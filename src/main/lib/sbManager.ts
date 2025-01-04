import { ipcMain, IpcMainEvent } from 'electron';
import settings from 'electron-settings';
import log from 'electron-log';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {
    defaultSettings,
    dnsServers,
    dohDnsServers,
    singBoxGeoIp,
    singBoxGeoSite,
    singBoxLog,
    singBoxStack
} from '../../defaultSettings';
import { createSbConfig } from './sbConfig';
import { Language } from '../../localization/type';
import {
    helperFileName,
    helperPath,
    sbExportListPath,
    protoAssetPath,
    workingDirPath,
    isLinux,
    IConfig,
    IGeoConfig,
    ruleSetBaseUrl,
    IPlatformHelper
} from '../../constants';
import { WindowsHelper, LinuxHelper, DarwinHelper, RoutingRuleParser } from './sbHelper';

interface GrpcResponse<T> {
    message: T;
}

interface GrpcError {
    message: string;
    code?: number;
}
// Constants for delays and timeouts
const STATUS_MONITOR_DELAY = 2000;
const SUCCESS_DELAY = 1500;
const CONNECTION_CHECK_INTERVAL = 3000;
const CONNECTION_TIMEOUT = 3000;
const MAX_CHECK_CONNECTION_RETRY_ATTEMPTS = 10;

// Constant for status messages
const STATUS_PREPARING = 'preparing';
const STATUS_DOWNLOAD_FAILED = 'download-failed';

// Constant for logging
const LOG_MONITORING_HELPER_STATUS = 'Monitoring helper status...';
const LOG_HELPER_SERVICE_ENDED = 'Oblivion-Helper service has ended.';
const LOG_FAILED_CONNECTION = 'Failed to establish Sing-Box connection after';
const LOG_WAITING_CONNECTION = 'Waiting for connection...';
const LOG_CONNECTION_ESTABLISHED = 'Sing-Box connected successfully after';
const LOG_CONNECTION_NOT_ESTABLISHED = 'Connection not yet established. Retry attempt';
const LOG_OBLIVION_HELPER = 'Oblivion-Helper:';
const LOG_OBLIVION_HELPER_ERROR = 'Oblivion-Helper Error:';
const LOG_STARTING_HELPER = 'Starting Oblivion-Helper...';
const LOG_STOPPING_HELPER = 'Stopping Oblivion-Helper...';
const LOG_STOPPING_HELPER_ON_START = 'Stopping Oblivion-Helper on startup...';
const LOG_SETTING_UP_CONFIGS = 'Setting up configs...';
const LOG_STARTING_SING_BOX = 'Starting Sing-Box...';
const LOG_STOPPING_SING_BOX = 'Stopping Sing-Box...';
const LOG_EXPORT_LIST_CREATED = 'ExportList config file has been created at';
const LOG_OBLIVION_HELPER_STATUS = 'Oblivion-Helper Status:';
const LOG_FAILED_START_SINGBOX = 'Failed to start Sing-Box:';
const LOG_FAILED_STOP_SINGBOX = 'Failed to stop Sing-Box:';

class SingBoxManager {
    private helperClient: any;

    private event?: IpcMainEvent;

    private appLang?: Language;

    private isSBRunning: boolean = false;

    private isListeningToHelper: boolean = false;

    private shouldBreakConnectionTest: boolean = false;

    private responseStatus: string = '';

    private platformHelper: IPlatformHelper;

    private routingRuleParser: RoutingRuleParser;

    constructor() {
        this.initializeGrpcClient();
        this.platformHelper = this.getPlatformHelper();
        this.routingRuleParser = new RoutingRuleParser();
    }

    //Public-Methods
    public async startSingBox(appLang?: Language, event?: IpcMainEvent): Promise<boolean> {
        if (!this.event) this.event = event;
        if (this.isSBRunning) return true;

        this.isSBRunning = true;
        this.appLang = appLang;
        await this.setupConfigs();

        try {
            const helperStarted = await this.ensureHelperIsRunning();
            if (!helperStarted) return false;

            await this.monitorHelperStatus();

            return this.startService();
        } catch (error) {
            this.isSBRunning = false;
            this.replyEvent(`${this.appLang?.log.error_singbox_failed_start}\n${error}`);
            log.error(LOG_FAILED_START_SINGBOX, error);
            return false;
        }
    }

    public async stopSingBox(): Promise<boolean> {
        if (!this.isSBRunning) return true;

        this.isSBRunning = false;

        try {
            return this.stopService();
        } catch (error) {
            this.isSBRunning = true;
            this.replyEvent(`${this.appLang?.log.error_singbox_failed_stop}\n$${error}`);
            log.error(LOG_FAILED_STOP_SINGBOX, error);
            return false;
        }
    }

    public async stopHelper(): Promise<void> {
        log.info(LOG_STOPPING_HELPER);
        this.helperClient.Exit({}, () => {});
        await this.delay(STATUS_MONITOR_DELAY);
    }

    public async stopHelperOnStart(): Promise<void> {
        if (!(await this.isProcessRunning(helperFileName))) return;

        log.info(LOG_STOPPING_HELPER_ON_START);
        this.helperClient.Exit({}, () => {});
        await this.delay(STATUS_MONITOR_DELAY * 2);
        this.isListeningToHelper = false;
    }

    public checkConnectionStatus(): Promise<boolean> {
        log.info(LOG_WAITING_CONNECTION);

        const checkStatus = async (attempt: number): Promise<boolean> => {
            if (this.shouldBreakConnectionTest) return false;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);

            try {
                const response = await fetch('https://1.1.1.1/cdn-cgi/trace', {
                    signal: controller.signal
                });

                if (response.ok && !this.shouldBreakConnectionTest) {
                    await this.delay(SUCCESS_DELAY);
                    log.info(`${LOG_CONNECTION_ESTABLISHED} ${attempt} attempts.`);
                    return true;
                }
            } catch {
                log.info(
                    `${LOG_CONNECTION_NOT_ESTABLISHED} ${attempt}/${MAX_CHECK_CONNECTION_RETRY_ATTEMPTS}...`
                );
            } finally {
                clearTimeout(timeoutId);
            }

            if (attempt >= MAX_CHECK_CONNECTION_RETRY_ATTEMPTS) {
                log.error(
                    `${LOG_FAILED_CONNECTION} ${MAX_CHECK_CONNECTION_RETRY_ATTEMPTS} attempts.`
                );
                this.replyEvent(`${this.appLang?.log.error_failed_connection}`);
                ipcMain.emit('wp-end');
                return false;
            }

            await this.delay(CONNECTION_CHECK_INTERVAL);
            return checkStatus(attempt + 1);
        };

        return checkStatus(1);
    }

    //Private-Methods
    private initializeGrpcClient(): void {
        const packageDefinition = protoLoader.loadSync(protoAssetPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        const oblivionHelperProto: any =
            grpc.loadPackageDefinition(packageDefinition).oblivionHelper;
        this.helperClient = new oblivionHelperProto.OblivionService(
            '127.0.0.1:50051',
            grpc.credentials.createInsecure()
        );
    }

    private async ensureHelperIsRunning(): Promise<boolean> {
        return (await this.isProcessRunning(helperFileName)) || this.startHelper();
    }

    private async startHelper(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            log.info(LOG_STARTING_HELPER);

            const command = this.platformHelper.start(helperPath);
            const helperProcess = spawn(command.command, command.args, {
                cwd: workingDirPath
            });

            helperProcess.stdout?.on('data', (data: Buffer) => {
                if (isLinux && data.toString().includes('Server started on')) {
                    resolve(true);
                }
            });

            helperProcess.stderr?.on('data', (err: Buffer) => {
                const errorMessage = err.toString();
                if (errorMessage.includes('dismissed') || errorMessage.includes('canceled')) {
                    reject(`${this.appLang?.log.error_canceled_by_user}`);
                }
            });

            helperProcess.on('close', async (code) => {
                if (!isLinux && code === 0) {
                    resolve(true);
                }
            });
        });
    }

    private startService(): Promise<boolean> {
        log.info(LOG_STARTING_SING_BOX);
        this.shouldBreakConnectionTest = false;

        return this.executeGrpcCall<string>('Start', {});
    }

    private stopService(): Promise<boolean> {
        log.info(LOG_STOPPING_SING_BOX);
        this.shouldBreakConnectionTest = true;

        return this.executeGrpcCall<string>('Stop', {});
    }

    private async executeGrpcCall<T>(method: 'Start' | 'Stop', request: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.helperClient[method](request, (err: GrpcError, response: GrpcResponse<T>) => {
                if (err) {
                    if (method === 'Start') {
                        this.replyEvent('sb_start_failed');
                        this.isSBRunning = false;
                    } else {
                        this.replyEvent('sb_stop_failed');
                        this.isSBRunning = true;
                    }
                    const errorMessage = `${LOG_OBLIVION_HELPER_ERROR} ${err.code} ${err.message}`;
                    log.error(errorMessage);
                    this.replyEvent(errorMessage);
                    reject(`${LOG_OBLIVION_HELPER} ${err.message}`);
                    return;
                }
                log.info(`${LOG_OBLIVION_HELPER} ${response.message}`);
                resolve(true);
            });
        });
    }

    private async monitorHelperStatus(): Promise<void> {
        if (this.isListeningToHelper) return;

        await this.delay(STATUS_MONITOR_DELAY);
        log.info(LOG_MONITORING_HELPER_STATUS);

        const call = this.helperClient.StreamStatus({});
        this.isListeningToHelper = true;

        call.on('data', (response: { status: string }) => this.handleStatusUpdate(response.status));
        call.on('end', () => this.handleStreamEnd());
        call.on('error', (err: Error) => this.handleStreamError(err));
    }

    private handleStatusUpdate = async (status: string): Promise<void> => {
        this.responseStatus = status;
        log.info(LOG_OBLIVION_HELPER_STATUS, this.responseStatus);

        switch (this.responseStatus) {
            case STATUS_PREPARING:
                this.replyEvent('sb_preparing');
                break;
            case STATUS_DOWNLOAD_FAILED:
                this.replyEvent('sb_download_failed');
                this.isSBRunning = false;
                ipcMain.emit('wp-end');
                break;
            default:
                break;
        }
    };

    private handleStreamEnd = (): void => {
        log.info(LOG_HELPER_SERVICE_ENDED);
        this.isListeningToHelper = false;
        this.isSBRunning = false;
        ipcMain.emit('wp-end');
    };

    private handleStreamError = (err: Error): void => {
        log.warn(LOG_OBLIVION_HELPER_ERROR, err.message);
        this.isSBRunning = false;
        ipcMain.emit('wp-end');
    };

    private isProcessRunning(processName: string): Promise<boolean> {
        const command = this.platformHelper.running(processName).command;

        return new Promise((resolve, reject) => {
            exec(command, (err: Error | null, stdout: string) => {
                if (err) {
                    reject(err.message);
                    return;
                }
                resolve(stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1);
            });
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    private getPlatformHelper(): IPlatformHelper {
        switch (process.platform) {
            case 'darwin':
                return new DarwinHelper();
            case 'win32':
                return new WindowsHelper();
            case 'linux':
                return new LinuxHelper();
            default:
                throw new Error(`Unsupported platform: ${process.platform}`);
        }
    }

    private async setupConfigs(): Promise<void> {
        log.info(LOG_SETTING_UP_CONFIGS);
        const config = await this.loadConfiguration();
        const geoConfig = await this.loadGeoConfiguration();
        await this.setupGeoLists(geoConfig);
        const routingRules = await settings.get('routingRules');
        const rulesConfig = this.routingRuleParser.parse(routingRules);
        createSbConfig(config, geoConfig, rulesConfig);
    }

    private async loadConfiguration(): Promise<IConfig> {
        const [port, dns, mtu, loglevel, stack, sniff, endpoint] = await Promise.all([
            settings.get('port'),
            settings.get('dns'),
            settings.get('singBoxMTU'),
            settings.get('singBoxLog'),
            settings.get('singBoxStack'),
            settings.get('singBoxSniff'),
            settings.get('endpoint')
        ]);

        return {
            socksPort: typeof port === 'number' ? port : defaultSettings.port,
            tunMtu: typeof mtu === 'number' ? mtu : defaultSettings.singBoxMTU,
            logLevel: typeof loglevel === 'string' ? loglevel : singBoxLog[0].value,
            tunStack: typeof stack === 'string' ? stack : singBoxStack[0].value,
            tunSniff: typeof sniff === 'boolean' ? sniff : defaultSettings.singBoxSniff,
            plainDns: typeof dns === 'string' ? dns : dnsServers[0].value,
            DoHDns:
                typeof dns === 'string'
                    ? (dohDnsServers.find((doh) => doh.key === dns)?.value ??
                      dohDnsServers[0].value)
                    : dohDnsServers[0].value,
            tunEndpoint: typeof endpoint === 'string' ? endpoint : defaultSettings.endpoint
        };
    }

    private async loadGeoConfiguration(): Promise<IGeoConfig> {
        const [ip, site, block] = await Promise.all([
            settings.get('singBoxGeoIp'),
            settings.get('singBoxGeoSite'),
            settings.get('singBoxGeoBlock')
        ]);

        return {
            geoIp: typeof ip === 'string' ? ip : singBoxGeoIp[0].geoIp,
            geoSite: typeof site === 'string' ? site : singBoxGeoSite[0].geoSite,
            geoBlock: typeof block === 'boolean' ? block : defaultSettings.singBoxGeoBlock
        };
    }

    private async setupGeoLists(geoConfig: IGeoConfig): Promise<void> {
        const { geoIp, geoSite, geoBlock } = geoConfig;

        const urls: Record<string, string> = {};

        const addRuleSet = (filename: string) => {
            urls[filename] = `${ruleSetBaseUrl}${filename}`;
        };

        if (geoIp !== 'none') {
            addRuleSet(`geoip-${geoIp}.srs`);
        }

        if (geoSite !== 'none') {
            addRuleSet(`geosite-${geoSite}.srs`);
        }

        if (geoBlock) {
            addRuleSet(`geosite-category-ads-all.srs`);
            addRuleSet(`geosite-malware.srs`);
            addRuleSet(`geosite-phishing.srs`);
            addRuleSet(`geosite-cryptominers.srs`);
            addRuleSet(`geoip-malware.srs`);
            addRuleSet(`geoip-phishing.srs`);
        }

        const exportConfig = {
            interval: 7,
            urls: urls
        };

        fs.writeFileSync(sbExportListPath, JSON.stringify(exportConfig, null, 2), 'utf-8');
        log.info(`${LOG_EXPORT_LIST_CREATED} ${sbExportListPath}`);
    }

    private replyEvent(message: string): void {
        if (this.event) {
            this.event.reply('guide-toast', message);
        }
    }
}

export default SingBoxManager;
