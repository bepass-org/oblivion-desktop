import { BrowserWindow } from 'electron';
import settings from 'electron-settings';
import log from 'electron-log';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import treeKill from 'tree-kill';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { defaultSettings, singBoxGeoIp, singBoxGeoSite } from '../../defaultSettings';
import { createSbConfig } from './sbConfig';
import { customEvent } from './customEvent';
import { Language } from '../../localization/type';

interface ICommand {
    command: string;
    args?: string[];
}

interface IConfig {
    geoIp: string;
    geoSite: string;
    geoBlock: boolean;
    socksPort: number;
    tunMtu: number;
}

interface IRoutingRules {
    ipSet: string[];
    domainSet: string[];
    domainSuffixSet: string[];
    processSet: string[];
}

class SingBoxManager {
    private readonly configPath;

    private readonly isWindows = process.platform === 'win32';

    private wpPid?: number;

    private appLang?: Language;

    private oblivionHelperProto: any;

    private helperClient: any;

    private isListeningToHelper: boolean = false;

    private shouldBreakConnectionTest: boolean = false;

    private mainWindow: BrowserWindow | null | undefined;

    constructor(
        private readonly helperPath: string,
        private readonly helperFileName: string,
        private readonly sbWDFileName: string,
        private readonly sbConfigName: string,
        private readonly workingDirPath: string,
        private readonly protoAssetPath: string
    ) {
        this.configPath = path.join(this.workingDirPath, 'config.obv');
        this.initializeGrpcClient();
    }

    //Public-Methods
    public initializeMainWindow(mainWindow: BrowserWindow | null) {
        this.mainWindow = mainWindow;
    }

    public async startSingBox(wpPid?: number, appLang?: Language): Promise<boolean> {
        if (await this.isProcessRunning(this.sbWDFileName)) return true;

        this.wpPid = wpPid;
        this.appLang = appLang;
        await this.setupConfigs();

        try {
            const helperStarted = await this.ensureHelperIsRunning();
            if (!helperStarted) return false;

            await this.monitorHelperStatus();

            return this.startService();
        } catch (error) {
            this.sendMessageToRenderer(
                'guide-toast',
                `${this.appLang?.log.error_singbox_failed_start}\n${error}`
            );
            log.error('Failed to start Sing-Box:', error);
            this.killWarpPlus();
            return false;
        }
    }

    public async stopSingBox(): Promise<boolean> {
        if (!(await this.isProcessRunning(this.sbWDFileName))) return true;

        try {
            return this.stopService();
        } catch (error) {
            this.sendMessageToRenderer(
                'guide-toast',
                `${this.appLang?.log.error_singbox_failed_stop}\n${error}`
            );
            log.error('Failed to stop Sing-Box:', error);
            return false;
        }
    }

    public stopHelper(): void {
        log.info('Stopping Oblivion-Helper...');
        this.helperClient.Exit({}, () => {});
    }

    //Private-Methods
    private initializeGrpcClient(): void {
        const packageDefinition = protoLoader.loadSync(this.protoAssetPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        this.oblivionHelperProto = grpc.loadPackageDefinition(packageDefinition).oblivionHelper;
        this.helperClient = new this.oblivionHelperProto.OblivionService(
            '127.0.0.1:50051',
            grpc.credentials.createInsecure()
        );
    }

    private async ensureHelperIsRunning(): Promise<boolean> {
        return (await this.isProcessRunning(this.helperFileName)) || this.startHelper();
    }

    private async startHelper(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            log.info('Starting Oblivion-Helper...');

            const command = this.getPlatformCommands().start(this.helperPath);
            const helperProcess = spawn(command.command, command.args, {
                cwd: this.workingDirPath
            });

            helperProcess.stdout?.on('data', (data: Buffer) => {
                if (process.platform === 'linux' && data.toString().includes('Server started on')) {
                    resolve(true);
                }
            });

            helperProcess.stderr?.on('data', (err: Buffer) => {
                const errorMessage = err.toString();
                if (errorMessage.includes('dismissed') || errorMessage.includes('canceled')) {
                    reject('The operation was canceled by the user');
                }
            });

            helperProcess.on('close', async (code) => {
                if (process.platform !== 'linux' && code === 0) {
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
                }
                log.info('Oblivion-Helper:', response.message);
                resolve(this.checkConnectionStatus());
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
                }
                log.info('Oblivion-Helper:', response.message);
                resolve(true);
            });
        });
    }

    private checkConnectionStatus(): Promise<boolean> {
        const maxAttempts = 10;
        const checkInterval = 3000;
        const timeout = 3000;

        log.info('Waiting for connection...');

        const checkStatus = async (attempt: number): Promise<boolean> => {
            if (this.shouldBreakConnectionTest) return false;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

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
                    `Connection not yet established. Retry attempt ${attempt}/${maxAttempts}...`
                );
            } finally {
                clearTimeout(timeoutId);
            }

            if (attempt >= maxAttempts) {
                log.error(`Failed to establish Sing-Box connection after ${maxAttempts} attempts.`);
                this.sendMessageToRenderer('guide-toast', 'Failed to establish connection');
                return false;
            }

            await this.delay(checkInterval);
            return checkStatus(attempt + 1);
        };

        return checkStatus(1);
    }

    private async monitorHelperStatus(): Promise<void> {
        if (!this.isListeningToHelper) {
            await this.delay(2000);

            log.info('Monitoring helper status...');

            const call = this.helperClient.StreamStatus({});

            this.isListeningToHelper = true;

            let terminationsCount: number = 0;

            call.on('data', (response: { status: string }) => {
                log.info('Oblivion-Helper Status:', response.status);
                if (response.status === 'terminated') {
                    log.info('Sing-Box terminated unexpectedly. Restarting...');
                    customEvent.emit('tray-icon', 'disconnected');
                    this.sendMessageToRenderer('sb-terminate', 'terminated');

                    if (terminationsCount < 3) {
                        this.startService().then((connected) => {
                            console.log(connected);
                            if (connected) {
                                customEvent.emit('tray-icon', 'connected-tun');
                                this.sendMessageToRenderer('sb-terminate', 'restarted');
                                terminationsCount = 0;
                            }
                        });
                        terminationsCount++;
                    } else {
                        this.shouldBreakConnectionTest = true;
                        this.killWarpPlus();
                        terminationsCount = 0;
                    }
                }
            });

            call.on('end', async () => {
                log.info('Oblivion-Helper service has ended.');
                this.isListeningToHelper = false;
                this.killWarpPlus();
            });

            call.on('error', async (err: Error) => {
                log.warn('Oblivion-Helper Error:', err.message);
                this.killWarpPlus();
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

    private killWarpPlus(): void {
        if (this.wpPid) {
            treeKill(this.wpPid, 'SIGKILL');
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    private getPlatformCommands(): Record<string, (param: string) => ICommand> {
        const commands: Record<string, Record<string, (param: string) => ICommand>> = {
            darwin: {
                start: (helperPath) => ({
                    command: 'osascript',
                    args: [
                        '-e',
                        `do shell script "\\"${helperPath}\\" > /dev/null 2>&1 & echo $! &" with administrator privileges`
                    ]
                }),
                running: (processName) => ({
                    command: `pgrep -l ${processName} | awk '{ print $2 }'`
                })
            },
            win32: {
                start: (helperPath) => ({
                    command: 'powershell.exe',
                    args: [
                        '-Command',
                        `Start-Process -FilePath '${helperPath.replace(/'/g, "''")}' -Verb RunAs -WindowStyle Hidden;`
                    ]
                }),
                running: () => ({
                    command: `tasklist`
                })
            },
            linux: {
                start: (helperPath) => ({
                    command: 'pkexec',
                    args: [helperPath]
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
        await this.setupGeoLists(config);
        await this.createConfigFiles(config);
    }

    private async loadConfiguration(): Promise<IConfig> {
        const [port, ip, site, block, mtu] = await Promise.all([
            settings.get('port'),
            settings.get('singBoxGeoIp'),
            settings.get('singBoxGeoSite'),
            settings.get('singBoxGeoBlock'),
            settings.get('singBoxMTU')
        ]);

        return {
            socksPort: typeof port === 'number' ? port : defaultSettings.port,
            tunMtu: typeof mtu === 'number' ? mtu : defaultSettings.singBoxMTU,
            geoIp: typeof ip === 'string' ? ip : singBoxGeoIp[0].geoIp,
            geoSite: typeof site === 'string' ? site : singBoxGeoSite[0].geoSite,
            geoBlock: typeof block === 'boolean' ? block : defaultSettings.singBoxGeoBlock
        };
    }

    private async setupGeoLists(config: IConfig): Promise<void> {
        const { geoIp, geoSite, geoBlock } = config;

        if (geoIp !== 'none') {
            const hasExported = await this.exportGeoList(`geoip export ${geoIp} -f geoip.db`);
            log.info(`GeoIp: ${geoIp} => ${hasExported}`);
        }

        if (geoSite !== 'none') {
            const hasExported = await this.exportGeoList(`geosite export ${geoSite} -f geosite.db`);
            log.info(`GeoSite: ${geoSite} => ${hasExported}`);
        }

        if (geoBlock) {
            await this.setupSecurityLists();
        }
    }

    private async setupSecurityLists(): Promise<void> {
        const securityTasks = [
            ['geoip', 'malware', 'security-ip.db'],
            ['geoip', 'phishing', 'security-ip.db'],
            ['geosite', 'malware', 'security.db'],
            ['geosite', 'cryptominers', 'security.db'],
            ['geosite', 'phishing', 'security.db'],
            ['geosite', 'category-ads-all', 'security.db']
        ];

        await Promise.all(
            securityTasks.map(async ([type, category, file]) => {
                const hasExported = await this.exportGeoList(
                    `${type} export ${category} -f ${file}`
                );
                log.info(`GeoBlock: ${type}/${category} => ${hasExported}`);
            })
        );
    }

    private async createConfigFiles(config: IConfig): Promise<void> {
        const routingRules = await settings.get('routingRules');
        const rules = this.parseRoutingRules(routingRules);

        createSbConfig(
            config.socksPort,
            config.tunMtu,
            config.geoBlock,
            config.geoIp,
            config.geoSite,
            rules.ipSet,
            rules.domainSet,
            rules.domainSuffixSet,
            rules.processSet
        );

        const helperConfig = {
            sbConfig: this.sbConfigName,
            sbBin: this.sbWDFileName
        };

        fs.writeFileSync(this.configPath, JSON.stringify(helperConfig, null, 2), 'utf-8');
        log.info(`Helper config file has been created at ${this.configPath}`);
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
        const app = this.isWindows && !value.endsWith('.exe') ? `${value}.exe` : value;
        result.processSet.push(app);
    }

    private exportGeoList(args: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const command = path
                .join(this.workingDirPath, this.sbWDFileName)
                .replace(/(\s+)/g, '\\$1');
            exec(`${command} ${args}`, { cwd: this.workingDirPath }, (err: any) => {
                if (err) {
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

    private sendMessageToRenderer(channel: string, message: string): void {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(channel, message);
        }
    }
}

export default SingBoxManager;
