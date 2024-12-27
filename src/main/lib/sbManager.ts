import { ipcMain, IpcMainEvent } from 'electron';
import settings from 'electron-settings';
import log from 'electron-log';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { rimraf } from 'rimraf';
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
import { customEvent } from './customEvent';
import { Language } from '../../localization/type';
import {
    sbConfigName,
    sbWDFileName,
    helperFileName,
    helperConfigPath,
    protoAssetPath,
    helperPath,
    workingDirPath,
    isWindows,
    isLinux,
    IConfig,
    IGeoConfig,
    IRoutingRules,
    ruleSetDirPath
} from '../../constants';

interface ICommand {
    command: string;
    args?: string[];
}

class SingBoxManager {
    private helperClient: any;

    private event?: IpcMainEvent;

    private appLang?: Language;

    private isListeningToHelper: boolean = false;

    private shouldBreakConnectionTest: boolean = false;

    private retryCount: number = 0;

    private responseStatus: string = '';

    private static readonly MAX_ATTEMPTS = 10;

    private static readonly CHECK_INTERVAL = 3000;

    private static readonly TIMEOUT = 3000;

    constructor() {
        this.initializeGrpcClient();
    }

    //Public-Methods
    public async startSingBox(appLang?: Language, event?: IpcMainEvent): Promise<boolean> {
        if (!this.event) this.event = event;
        if (await this.isProcessRunning(sbWDFileName)) return true;

        this.appLang = appLang;
        this.retryCount = 0;
        await this.setupConfigs();

        try {
            const helperStarted = await this.ensureHelperIsRunning();
            if (!helperStarted) return false;

            await this.monitorHelperStatus();

            return this.startService();
        } catch (error) {
            this.replyEvent(`${this.appLang?.log.error_singbox_failed_start}\n${error}`);
            log.error('Failed to start Sing-Box:', error);
            return false;
        }
    }

    public async stopSingBox(): Promise<boolean> {
        if (!(await this.isProcessRunning(sbWDFileName))) return true;

        try {
            return this.stopService();
        } catch (error) {
            this.replyEvent(`${this.appLang?.log.error_singbox_failed_stop}\n${error}`);
            log.error('Failed to stop Sing-Box:', error);
            return false;
        }
    }

    public async stopHelper(): Promise<void> {
        log.info('Stopping Oblivion-Helper...');
        this.helperClient.Exit({}, () => {});
        await this.delay(2000);
    }

    public async stopHelperOnStart(): Promise<void> {
        if (!(await this.isProcessRunning(helperFileName))) return;

        log.info('Stopping Oblivion-Helper on startup...');
        this.helperClient.Exit({}, () => {});
        await this.delay(4000);
        this.isListeningToHelper = false;
    }

    public checkConnectionStatus(): Promise<boolean> {
        log.info('Waiting for connection...');

        const checkStatus = async (attempt: number): Promise<boolean> => {
            if (this.shouldBreakConnectionTest) return false;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), SingBoxManager.TIMEOUT);

            try {
                const response = await fetch('https://1.1.1.1/cdn-cgi/trace', {
                    signal: controller.signal
                });

                if (response.ok && !this.shouldBreakConnectionTest) {
                    await this.delay(1500);
                    log.info(`Sing-Box connected successfully after ${attempt} attempts.`);
                    return true;
                }
            } catch {
                log.info(
                    `Connection not yet established. Retry attempt ${attempt}/${SingBoxManager.MAX_ATTEMPTS}...`
                );
            } finally {
                clearTimeout(timeoutId);
            }

            if (attempt >= SingBoxManager.MAX_ATTEMPTS) {
                log.error(
                    `Failed to establish Sing-Box connection after ${SingBoxManager.MAX_ATTEMPTS} attempts.`
                );
                this.replyEvent(`${this.appLang?.log.error_failed_connection}`);
                ipcMain.emit('wp-end');
                return false;
            }

            await this.delay(SingBoxManager.CHECK_INTERVAL);
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
            log.info('Starting Oblivion-Helper...');

            const command = this.getPlatformCommands().start(helperPath);
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
        log.info('Starting Sing-Box...');
        this.shouldBreakConnectionTest = false;

        return new Promise<boolean>((resolve, reject) => {
            this.helperClient.Start({}, (err: Error, response: { message: string }) => {
                if (err) {
                    reject(`Oblivion-Helper: ${err.message}`);
                    return;
                }
                log.info('Oblivion-Helper:', response.message);
                resolve(true);
            });
        });
    }

    private stopService(): Promise<boolean> {
        log.info('Stopping Sing-Box...');
        this.shouldBreakConnectionTest = true;

        return new Promise<boolean>((resolve, reject) => {
            this.helperClient.Stop({}, (err: Error, response: { message: string }) => {
                if (err) {
                    reject(`Oblivion-Helper: ${err.message}`);
                    return;
                }
                log.info('Oblivion-Helper:', response.message);
                resolve(true);
            });
        });
    }

    private async monitorHelperStatus(): Promise<void> {
        if (!this.isListeningToHelper) {
            await this.delay(2000);

            log.info('Monitoring helper status...');

            const call = this.helperClient.StreamStatus({});

            this.isListeningToHelper = true;

            call.on('data', async (response: { status: string }) => {
                this.responseStatus = response.status;
                log.info('Oblivion-Helper Status:', this.responseStatus);
                if (this.responseStatus === 'terminated') {
                    log.info('Sing-Box terminated unexpectedly. Restarting...');
                    customEvent.emit('tray-icon', 'disconnected');
                    this.replyEvent('sb_terminated');
                    this.retryCount++;

                    if (this.retryCount <= 3) {
                        const isStarted = await this.startService();
                        await this.delay(5000);
                        if (
                            isStarted &&
                            this.responseStatus !== 'terminated' &&
                            (await this.checkConnectionStatus())
                        ) {
                            customEvent.emit('tray-icon', 'connected-tun');
                            this.replyEvent('sb_restarted');
                        }
                    } else {
                        this.shouldBreakConnectionTest = true;
                        this.replyEvent('sb_exceeded');
                        ipcMain.emit('wp-end');
                        log.warn('Exceeded maximum restart attempts.');
                    }
                }
            });

            call.on('end', async () => {
                log.info('Oblivion-Helper service has ended.');
                this.isListeningToHelper = false;
                ipcMain.emit('wp-end');
            });

            call.on('error', async (err: Error) => {
                log.warn('Oblivion-Helper Error:', err.message);
                ipcMain.emit('wp-end');
            });
        }
    }

    private isProcessRunning(processName: string): Promise<boolean> {
        const command = this.getPlatformCommands().running(processName).command;

        return new Promise((resolve, reject) => {
            exec(command, (err: Error | null, stdout: string) => {
                if (err) reject(err.message);

                resolve(stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1);
            });
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    private getPlatformCommands(): Record<string, (param: string) => ICommand> {
        const commands: Record<string, Record<string, (param: string) => ICommand>> = {
            darwin: {
                start: (binPath) => ({
                    command: 'osascript',
                    args: [
                        '-e',
                        `do shell script "\\"${binPath}\\" > /dev/null 2>&1 & echo $! &" with administrator privileges`
                    ]
                }),
                running: (processName) => ({
                    command: `pgrep -l ${processName} | awk '{ print $2 }'`
                })
            },
            win32: {
                start: (binPath) => ({
                    command: 'powershell.exe',
                    args: [
                        '-Command',
                        `Start-Process -FilePath '${binPath.replace(/'/g, "''")}' -Verb RunAs -WindowStyle Hidden;`
                    ]
                }),
                running: () => ({
                    command: `tasklist`
                })
            },
            linux: {
                start: (binPath) => ({
                    command: 'pkexec',
                    args: [binPath]
                }),
                running: (processName) => ({
                    command: `pgrep -l ${processName} | awk '{ print $2 }'`
                })
            }
        };

        return (
            commands[process.platform] || {
                start: () => ({ command: '', args: [] }),
                running: () => ({ command: '' })
            }
        );
    }

    private async setupConfigs(): Promise<void> {
        log.info('Setting up configs...');
        const config = await this.loadConfiguration();
        const geoConfig = await this.loadGeoConfiguration();
        await this.setupGeoLists(geoConfig);
        await this.createConfigFiles(config, geoConfig);
    }

    private async loadConfiguration(): Promise<IConfig> {
        const [port, dns, mtu, loglevel, stack, sniff] = await Promise.all([
            settings.get('port'),
            settings.get('dns'),
            settings.get('singBoxMTU'),
            settings.get('singBoxLog'),
            settings.get('singBoxStack'),
            settings.get('singBoxSniff')
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
                    : dohDnsServers[0].value
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

        if (fs.existsSync(ruleSetDirPath)) {
            await rimraf(ruleSetDirPath);
        }
        fs.mkdirSync(ruleSetDirPath);

        if (geoIp !== 'none') {
            const hasExported = await this.exportGeoList(
                `geoip export ${geoIp} -o ./ruleset/geoip-${geoIp}.json`
            );
            log.info(`GeoIp: ${geoIp} => ${hasExported}`);
        }

        if (geoSite !== 'none') {
            const hasExported = await this.exportGeoList(
                `geosite export ${geoSite} -o ./ruleset/geosite-${geoSite}.json`
            );
            log.info(`GeoSite: ${geoSite} => ${hasExported}`);
        }

        if (geoBlock) {
            await this.setupSecurityLists();
        }
    }

    private async setupSecurityLists(): Promise<void> {
        const securityTasks = [
            ['geoip', 'malware'],
            ['geoip', 'phishing'],
            ['geosite', 'malware'],
            ['geosite', 'cryptominers'],
            ['geosite', 'phishing'],
            ['geosite', 'category-ads-all']
        ];

        await Promise.all(
            securityTasks.map(async ([type, category]) => {
                const hasExported = await this.exportGeoList(
                    `${type} export ${category} -o ./ruleset/${type}-${category}.json`
                );
                log.info(`GeoBlock: ${type}/${category} => ${hasExported}`);
            })
        );
    }

    private async createConfigFiles(config: IConfig, geoConfig: IGeoConfig): Promise<void> {
        const routingRules = await settings.get('routingRules');
        const rulesConfig = this.parseRoutingRules(routingRules);

        createSbConfig(config, geoConfig, rulesConfig);

        const helperConfig = { sbConfig: sbConfigName, sbBin: sbWDFileName };

        fs.writeFileSync(helperConfigPath, JSON.stringify(helperConfig, null, 2), 'utf-8');
        log.info(`Helper config file has been created at ${helperConfigPath}`);
    }

    private parseRoutingRules(routingRules: any): IRoutingRules {
        const result: IRoutingRules = {
            ipSet: [],
            domainSet: [],
            domainSuffixSet: [],
            processSet: []
        };

        if (typeof routingRules !== 'string' || routingRules.trim() === '') {
            return result;
        }

        routingRules
            .split('\n')
            .map((line: string) => line.trim().replace(/,$/, ''))
            .filter(Boolean)
            .forEach((line: string) => {
                const [prefix, value] = line.split(':').map((part) => part.trim());
                if (!value) return;

                this.processRoutingRule(prefix, value, result);
            });

        return result;
    }

    private processRoutingRule(prefix: string, value: string, result: IRoutingRules): void {
        switch (prefix) {
            case 'ip':
                result.ipSet.push(value);
                break;
            case 'domain':
                this.processDomainRule(value, result);
                break;
            case 'app':
                this.processAppRule(value, result);
                break;
            default:
                log.warn(`Unknown routing rule prefix: ${prefix}`);
                break;
        }
    }

    private processDomainRule(value: string, result: IRoutingRules): void {
        if (value.startsWith('*')) {
            result.domainSuffixSet.push(value.substring(1));
        } else {
            result.domainSet.push(value.replace('www.', ''));
        }
    }

    private processAppRule(value: string, result: IRoutingRules): void {
        const app = isWindows && !value.endsWith('.exe') ? `${value}.exe` : value;
        result.processSet.push(app);
    }

    private exportGeoList(args: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const command = path.join(workingDirPath, sbWDFileName).replace(/(\s+)/g, '\\$1');
            exec(`${command} ${args}`, { cwd: workingDirPath }, (err: any) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

    private replyEvent(message: string): void {
        if (this.event) {
            this.event.reply('guide-toast', message);
        }
    }
}

export default SingBoxManager;
