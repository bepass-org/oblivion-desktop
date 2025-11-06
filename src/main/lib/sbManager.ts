import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import settings from 'electron-settings';

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {
    defaultSettings,
    dnsServers,
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
    IPlatformHelper,
    regeditVbsDirPath
} from '../../constants';
import { WindowsHelper, LinuxHelper, DarwinHelper, RoutingRuleParser } from './sbHelper';
import { mapGrpcErrorCodeToLabel } from './utils';
import { disableProxy } from './proxy';
import { customEvent } from './customEvent';

// Types
type GrpcMethod = 'Start' | 'Stop';
interface GrpcResponse<T> {
    message: T;
}
interface GrpcError {
    message: string;
    code?: number;
}

// Configuration
const CONFIG = {
    delays: {
        statusMonitor: 2000,
        success: 1500,
        connectionCheck: 3000,
        connectionTimeout: 3000
    },
    connection: {
        maxRetries: 15,
        grpcEndpoint: '127.0.0.1:50051'
    },
    status: {
        preparing: 'preparing',
        downloadFailed: 'download-failed'
    }
} as const;

class SingBoxManager {
    private readonly helperClient: any;

    private readonly platformHelper: IPlatformHelper;

    private readonly routingRuleParser: RoutingRuleParser;

    private event?: IpcMainEvent;

    private appLang?: Language;

    private isSBRunning = false;

    private isListeningToHelper = false;

    private shouldBreakConnectionTest = false;

    private responseStatus = '';

    constructor() {
        this.helperClient = this.createGrpcClient();
        this.platformHelper = this.createPlatformHelper();
        this.routingRuleParser = new RoutingRuleParser();
    }

    // Public API
    public async startSingBox(appLang?: Language, event?: IpcMainEvent): Promise<boolean> {
        if (!this.event) this.event = event;
        if (this.isSBRunning) return true;

        try {
            this.isSBRunning = true;
            this.appLang = appLang;

            await this.setupConfigs();
            if (!(await this.ensureHelperIsRunning())) return false;
            await this.monitorHelperStatus();

            return this.startService();
        } catch (error) {
            this.isSBRunning = false;
            this.replyEvent(`${this.appLang?.log.error_singbox_failed_start}\n${error}`);
            log.error('Failed to start Sing-Box:', error);
            return false;
        }
    }

    public async stopSingBox(): Promise<boolean> {
        if (!this.isSBRunning) return true;

        try {
            this.isSBRunning = false;
            return this.stopService();
        } catch (error) {
            this.isSBRunning = true;
            this.replyEvent(`${this.appLang?.log.error_singbox_failed_stop}\n${error}`);
            log.error('Failed to stop Sing-Box:', error);
            return false;
        }
    }

    public async stopHelper(): Promise<void> {
        if (!this.isProcessRunning(helperFileName)) return;

        log.info('Stopping Oblivion-Helper...');
        this.helperClient.Exit({}, (err: GrpcError) => {
            if (err) {
                const messagePart = err.message.substring(err.message.indexOf(':') + 1).trim();
                const errorCodeLabel = mapGrpcErrorCodeToLabel(err.code);
                const errorMessage = `Helper Error: [${errorCodeLabel}] ${messagePart}`;
                log.error(errorMessage);
            }
        });
        await this.delay(CONFIG.delays.statusMonitor);
    }

    public async stopHelperOnStart(): Promise<void> {
        if (!this.isProcessRunning(helperFileName)) return;

        log.info('Stopping Oblivion-Helper on startup...');
        this.helperClient.Exit({}, (err: GrpcError) => {
            if (err) {
                const messagePart = err.message.substring(err.message.indexOf(':') + 1).trim();
                const errorCodeLabel = mapGrpcErrorCodeToLabel(err.code);
                const errorMessage = `Helper Error: [${errorCodeLabel}] ${messagePart}`;
                log.error(errorMessage);
            }
        });
        await this.delay(CONFIG.delays.statusMonitor * 2);
        this.isListeningToHelper = false;
    }

    public async checkConnectionStatus(): Promise<boolean> {
        log.info('Waiting for connection...');

        const savedTestUrl = await settings.get('testUrl');
        const testUrl = this.getSettingOrDefault(savedTestUrl, defaultSettings.testUrl);
        log.info(`Testing connection via ${testUrl}`);

        const checkAttempt = async (attempt: number): Promise<boolean> => {
            if (this.shouldBreakConnectionTest) return false;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.delays.connectionTimeout);

            try {
                const response = await fetch(testUrl, {
                    signal: controller.signal
                });

                if (response.ok && !this.shouldBreakConnectionTest) {
                    await this.delay(CONFIG.delays.success);
                    log.info(`Connection established after ${attempt} attempts`);
                    return true;
                }
            } catch {
                log.info(`Connection attempt ${attempt}/${CONFIG.connection.maxRetries} failed`);
            } finally {
                clearTimeout(timeoutId);
            }

            if (attempt >= CONFIG.connection.maxRetries) {
                this.handleConnectionFailure();
                return false;
            }

            await this.delay(CONFIG.delays.connectionCheck);
            return checkAttempt(attempt + 1);
        };

        return checkAttempt(1);
    }

    // Private Helper Methods
    private createGrpcClient() {
        const packageDefinition = protoLoader.loadSync(protoAssetPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        const proto: any = grpc.loadPackageDefinition(packageDefinition).oblivionHelper;
        return new proto.OblivionService(
            CONFIG.connection.grpcEndpoint,
            grpc.credentials.createInsecure()
        );
    }

    private async ensureHelperIsRunning(): Promise<boolean> {
        return this.isProcessRunning(helperFileName) || this.startHelper();
    }

    private async startHelper(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!fs.existsSync(helperPath)) {
                reject(`${this.appLang?.log.error_helper_not_found}`);
                return;
            }

            log.info('Starting Oblivion-Helper...');

            try {
                disableProxy(regeditVbsDirPath);
            } catch (error) {
                log.error('Error managing system proxy:', error);
            }

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
                const errorMessage = err.toString().toLowerCase();
                if (
                    errorMessage.includes('denied') ||
                    errorMessage.includes('dismissed') ||
                    errorMessage.includes('canceled') ||
                    errorMessage.includes('no tty present') ||
                    errorMessage.includes('a password is required') ||
                    errorMessage.includes('no askpass program specified') ||
                    errorMessage.includes('operation was cancelled') ||
                    errorMessage.includes('authentication is required') ||
                    errorMessage.includes('not authorized')
                ) {
                    customEvent.emit('tray-icon', 'disconnected');
                    reject(`${this.appLang?.log.error_canceled_by_user}`);
                }
                if (errorMessage.includes('command was found in the module')) {
                    log.error(
                        'The `Start-Process` command exists in the `Microsoft.PowerShell.Management` module, but PowerShell was unable to load this module.'
                    );
                    customEvent.emit('tray-icon', 'disconnected');
                    reject('PowerShell module error detected.');
                }
            });

            helperProcess.on('close', async (code) => {
                if (!isLinux && code === 0) {
                    resolve(true);
                }
            });
        });
    }

    private createPlatformHelper(): IPlatformHelper {
        const helpers = {
            darwin: DarwinHelper,
            win32: WindowsHelper,
            linux: LinuxHelper
        };
        const Helper = helpers[process.platform as keyof typeof helpers];
        if (!Helper) throw new Error(`Unsupported platform: ${process.platform}`);
        return new Helper();
    }

    private async setupConfigs(): Promise<void> {
        log.info('Setting up configs...');
        const [config, geoConfig] = await Promise.all([
            this.loadConfiguration(),
            this.loadGeoConfiguration()
        ]);

        await this.setupGeoLists(geoConfig);
        const routingRules = await settings.get('routingRules');
        const rulesConfig = this.routingRuleParser.parse(routingRules);

        createSbConfig(config, geoConfig, rulesConfig);
    }

    private async loadConfiguration(): Promise<IConfig> {
        const [
            hostIP,
            port,
            dns,
            mtu,
            loglevel,
            stack,
            sniff,
            address,
            endpoint,
            plainDns,
            DoH,
            singBoxUdpBlock,
            singBoxDiscordBypass
        ] = await Promise.all([
            settings.get('hostIP'),
            settings.get('port'),
            settings.get('dns'),
            settings.get('singBoxMTU'),
            settings.get('singBoxLog'),
            settings.get('singBoxStack'),
            settings.get('singBoxSniff'),
            settings.get('singBoxAddrType'),
            settings.get('endpoint'),
            settings.get('plainDns'),
            settings.get('DoH'),
            settings.get('singBoxUdpBlock'),
            settings.get('singBoxDiscordBypass')
        ]);

        return {
            socksIp: this.getSettingOrDefault(hostIP, defaultSettings.hostIP),
            socksPort: this.getSettingOrDefault(port, defaultSettings.port),
            tunMtu: this.getSettingOrDefault(mtu, defaultSettings.singBoxMTU),
            logLevel: this.getSettingOrDefault(loglevel, singBoxLog[0].value),
            tunStack: this.getSettingOrDefault(stack, singBoxStack[0].value),
            tunSniff: this.getSettingOrDefault(sniff, defaultSettings.singBoxSniff),
            tunAddr: this.getTunAddr(address),
            plainDns: this.getPlainDns(dns, plainDns),
            DoHDns: this.getDoHDns(dns, DoH),
            tunEndpoint: this.getSettingOrDefault(endpoint, defaultSettings.endpoint),
            udpBlock: this.getSettingOrDefault(singBoxUdpBlock, defaultSettings.singBoxUdpBlock),
            discordBypass: this.getSettingOrDefault(
                singBoxDiscordBypass,
                defaultSettings.singBoxDiscordBypass
            )
        };
    }

    private async loadGeoConfiguration(): Promise<IGeoConfig> {
        const [ip, site, block, nsfw] = await Promise.all([
            settings.get('singBoxGeoIp'),
            settings.get('singBoxGeoSite'),
            settings.get('singBoxGeoBlock'),
            settings.get('singBoxGeoNSFW')
        ]);

        return {
            geoIp: this.getSettingOrDefault(ip, singBoxGeoIp[0].geoIp),
            geoSite: this.getSettingOrDefault(site, singBoxGeoSite[0].geoSite),
            geoBlock: this.getSettingOrDefault(block, defaultSettings.singBoxGeoBlock),
            geoNSFW: this.getSettingOrDefault(nsfw, defaultSettings.singBoxGeoNSFW)
        };
    }

    private getPlainDns(dns: any, plainDns: any): string {
        if (typeof dns !== 'string') return dnsServers[0].value;
        if (dns === 'local') return '';
        if (dns === 'custom' && plainDns === '') return dnsServers[0].value;
        return dns === 'custom' ? plainDns : dns;
    }

    private getDoHDns(dns: any, doh: any): string {
        if (typeof dns !== 'string') return `https://${dnsServers[0].value}/dns-query`;
        if (dns === 'local' || (dns === 'custom' && (typeof doh !== 'string' || doh === '')))
            return `https://${dnsServers[0].value}/dns-query`;
        return dns === 'custom' ? doh : `https://${dns}/dns-query`;
    }

    private getTunAddr(addrType: any): string[] {
        if (typeof addrType !== 'string') return ['172.19.0.1/30', 'fdfe:dcba:9876::1/126'];

        switch (addrType) {
            case 'v4':
                return ['172.19.0.1/30'];
            case 'v6':
                return ['fdfe:dcba:9876::1/126'];
            default:
                return ['172.19.0.1/30', 'fdfe:dcba:9876::1/126'];
        }
    }

    private getSettingOrDefault<T>(value: any, defaultValue: T): T {
        return typeof value === typeof defaultValue ? value : defaultValue;
    }

    private async setupGeoLists(geoConfig: IGeoConfig): Promise<void> {
        const urls: Record<string, string> = {};
        const addRuleSet = (filename: string) => {
            urls[filename] = `${ruleSetBaseUrl}${filename}`;
        };

        if (geoConfig.geoIp !== 'none') addRuleSet(`geoip-${geoConfig.geoIp}.srs`);
        if (geoConfig.geoSite !== 'none') addRuleSet(`geosite-${geoConfig.geoSite}.srs`);

        if (geoConfig.geoBlock) {
            ['category-ads-all', 'malware', 'phishing', 'cryptominers'].forEach((type) =>
                addRuleSet(`geosite-${type}.srs`)
            );
            ['malware', 'phishing'].forEach((type) => addRuleSet(`geoip-${type}.srs`));
        }

        if (geoConfig.geoNSFW) addRuleSet(`geosite-nsfw.srs`);

        fs.writeFileSync(sbExportListPath, JSON.stringify({ interval: 7, urls }, null, 2), 'utf-8');
        log.info(`ExportList config created at ${sbExportListPath}`);
    }

    private async monitorHelperStatus(): Promise<void> {
        if (this.isListeningToHelper) return;

        await this.delay(CONFIG.delays.statusMonitor);
        log.info('Monitoring helper status...');

        const call = this.helperClient.StreamStatus({});
        this.isListeningToHelper = true;

        call.on('data', this.handleStatusUpdate);
        call.on('end', this.handleStreamEnd);
        call.on('error', this.handleStreamError);
    }

    private handleStatusUpdate = (response: { status: string }): void => {
        this.responseStatus = response.status;
        log.info('Helper Status:', this.responseStatus);

        if (this.responseStatus === CONFIG.status.preparing) {
            this.replyEvent('sb_preparing');
        } else if (this.responseStatus === CONFIG.status.downloadFailed) {
            this.replyEvent('sb_download_failed');
            this.isSBRunning = false;
            ipcMain.emit('wp-end');
        }
    };

    private handleStreamEnd = (): void => {
        log.info('Helper service ended');
        this.isListeningToHelper = false;
        this.isSBRunning = false;
        ipcMain.emit('wp-end');
    };

    private handleStreamError = (err: Error): void => {
        log.warn('Helper Error:', err.message);
        this.isSBRunning = false;
        ipcMain.emit('wp-end');
    };

    private handleConnectionFailure(): void {
        log.error(`Failed to establish connection after ${CONFIG.connection.maxRetries} attempts`);
        this.replyEvent(`${this.appLang?.log.error_failed_connection}`);
        ipcMain.emit('wp-end');
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    private replyEvent(message: string): void {
        this.event?.reply('guide-toast', message);
    }

    private isProcessRunning(processName: string): boolean {
        return execSync(this.platformHelper.running(processName).command)
            .toString('utf-8')
            .toLowerCase()
            .includes(processName.toLowerCase());
    }

    private async executeGrpcCall<T>(method: GrpcMethod, request: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.helperClient[method](request, (err: GrpcError, response: GrpcResponse<T>) => {
                if (err) {
                    const failureType = method === 'Start' ? 'sb_start_failed' : 'sb_stop_failed';
                    this.replyEvent(failureType);
                    this.isSBRunning = method !== 'Start';

                    //const errorMessage = `Helper Error: ${err.code} ${err.message}`;
                    const messagePart = err.message.substring(err.message.indexOf(':') + 1).trim();
                    const errorCodeLabel = mapGrpcErrorCodeToLabel(err.code);
                    const errorMessage = `Helper Error: [${errorCodeLabel}] ${messagePart}`;
                    log.error(errorMessage);
                    if (errorMessage.includes('set ipv6 address: Element not found')) {
                        this.replyEvent('sb_error_ipv6');
                    } else if (
                        errorMessage.includes('Cannot create a file') ||
                        errorMessage.includes('system cannot find the file specified')
                    ) {
                        this.replyEvent('sb_error_tun0');
                    } else {
                        this.replyEvent(errorMessage);
                    }
                    reject(`Helper: ${err.message}`);
                    return;
                }

                log.info(`Helper: ${response.message}`);
                resolve(true);
            });
        });
    }

    private startService(): Promise<boolean> {
        log.info('Starting Sing-Box...');
        this.shouldBreakConnectionTest = false;
        return this.executeGrpcCall<string>('Start', {});
    }

    private stopService(): Promise<boolean> {
        log.info('Stopping Sing-Box...');
        this.shouldBreakConnectionTest = true;
        return this.executeGrpcCall<string>('Stop', {});
    }
}

export default SingBoxManager;
