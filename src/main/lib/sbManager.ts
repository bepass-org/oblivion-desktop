import { spawn } from 'child_process';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import treeKill from 'tree-kill';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { defaultSettings, singBoxGeoIp, singBoxGeoSite } from '../../defaultSettings';
import { createSbConfig } from './sbConfig';

interface IProcessCommand {
    command: string;
    args: string[];
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

    private wpPid: number | undefined;

    private oblivionHelperProto: any;

    private helperClient: any;

    private isListeningToHelper: boolean = false;

    private doesSingBoxNeedsToStop: boolean = false;

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

    public async startSingBox(wpPid: number): Promise<boolean> {
        if (await this.isProcessRunning(this.sbWDFileName)) {
            return true;
        }

        this.wpPid = wpPid;
        await this.setupConfigs();

        try {
            const helperStarted = await this.ensureHelperIsRunning();
            if (!helperStarted) return false;

            if (!this.isListeningToHelper) {
                await this.delay(2000);
                await this.monitorHelperStatus();
            }

            log.info('Starting Sing-Box...');

            return new Promise<boolean>((resolve) => {
                this.helperClient.Start({}, (err: Error, response: { message: string }) => {
                    if (err) {
                        log.error('Oblivion-Helper:', err.message);
                        resolve(false);
                        return;
                    }
                    log.info('Oblivion-Helper:', response.message);
                    this.doesSingBoxNeedsToStop = true;
                    resolve(true);
                });
            });
        } catch (error) {
            log.error('Failed to start Sing-Box:', error);
            return false;
        }
    }

    public async stopSingBox(): Promise<boolean> {
        if (!(await this.isProcessRunning(this.helperFileName)) || !this.doesSingBoxNeedsToStop) {
            return true;
        }

        log.info('Stopping Sing-Box...');

        return new Promise<boolean>((resolve) => {
            this.helperClient.Stop({}, (err: Error, response: { message: string }) => {
                if (err) {
                    log.error('Oblivion-Helper:', err.message);
                    resolve(false);
                    return;
                }
                log.info('Oblivion-Helper:', response.message);
                this.doesSingBoxNeedsToStop = false;
                resolve(true);
            });
        });
    }

    private async startHelper(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            log.info('Starting Oblivion-Helper...');
            const command = this.getPlatformCommands().start(this.helperPath);
            const helperProcess = spawn(command.command, command.args, {
                cwd: this.workingDirPath
            });

            helperProcess.stdout?.on('data', async (data: Buffer) => {
                if (process.platform === 'linux' && data.toString().includes('Server started on')) {
                    resolve(true);
                }
            });

            helperProcess.stderr?.on('data', (err: Buffer) => {
                const errorMessage = err.toString();
                if (errorMessage.includes('dismissed') || errorMessage.includes('canceled')) {
                    reject(
                        process.platform === 'darwin'
                            ? 'The operation was canceled by the user.'
                            : new Error(errorMessage)
                    );
                }
            });

            helperProcess.on('close', async (code) => {
                if (process.platform !== 'linux' && code === 0) {
                    resolve(true);
                }
            });
        });
    }

    public async stopHelper(): Promise<void> {
        this.doesSingBoxNeedsToStop = false;
        log.info('Stopping Oblivion-Helper...');
        this.helperClient.Exit({}, () => {});
    }

    private async ensureHelperIsRunning(): Promise<boolean> {
        return (await this.isProcessRunning(this.helperFileName)) || this.startHelper();
    }

    public async checkConnectionStatus(): Promise<boolean> {
        const maxAttempts = 10;
        const checkInterval = 3000;
        const timeout = 5000;

        log.info('Waiting for connection...');

        const checkStatus = async (attempt: number): Promise<boolean> => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
                    signal: controller.signal
                });

                if (response.ok) {
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
                return false;
            }

            await this.delay(checkInterval);
            return checkStatus(attempt + 1);
        };

        return checkStatus(1);
    }

    private async monitorHelperStatus(): Promise<void> {
        const call = this.helperClient.StreamStatus({});

        this.isListeningToHelper = true;

        call.on('data', (response: { status: string }) => {
            log.info('Oblivion-Helper Status:', response.status);
            if (response.status === 'terminated') {
                this.killWarpPlus();
            }
        });

        call.on('end', () => {
            log.info('Oblivion-Helper service has ended.');
            this.isListeningToHelper = false;
            this.killWarpPlus();
        });

        call.on('error', (err: Error) => {
            log.warn('Oblivion-Helper Error:', err.message);
            this.killWarpPlus();
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    private async isProcessRunning(processName: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const command = this.getPlatformCommands().running(processName);
            const checkProcess = spawn(command.command, command.args);
            let isRunning = false;

            checkProcess.stdout?.on('data', (data: Buffer) => {
                if (data.toString().trim().length > 0) {
                    isRunning = true;
                }
            });

            checkProcess.on('close', () => resolve(isRunning));
        });
    }

    private killWarpPlus(): void {
        if (this.wpPid) {
            this.doesSingBoxNeedsToStop = false;
            treeKill(this.wpPid, 'SIGKILL');
        }
    }

    private getPlatformCommands(): Record<string, (process: string) => IProcessCommand> {
        const commands: Record<string, Record<string, (helperPath: string) => IProcessCommand>> = {
            darwin: {
                start: (helperPath) => ({
                    command: 'osascript',
                    args: [
                        '-e',
                        `do shell script "\\"${helperPath}\\" > /dev/null 2>&1 & echo $! &" with administrator privileges`
                    ]
                }),
                running: (processName) => ({
                    command: 'pgrep',
                    args: ['-f', processName]
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
                running: (processName) => ({
                    command: 'powershell.exe',
                    args: [
                        '-Command',
                        `Get-CimInstance Win32_Process | Where-Object { $_.Name -like '${processName}'}`
                    ]
                })
            },
            linux: {
                start: (helperPath) => ({
                    command: 'pkexec',
                    args: [helperPath]
                }),
                running: (processName) => ({
                    command: 'pgrep',
                    args: ['-f', processName]
                })
            }
        };

        return (
            commands[process.platform] || {
                start: () => ({ command: '', args: [] }),
                running: () => ({ command: '', args: [] })
            }
        );
    }

    private async setupConfigs(): Promise<void> {
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
            const hasGeoIp = await this.exportGeoList(['geoip', 'export', geoIp, '-f', 'geoip.db']);
            log.info(`GeoIp: ${geoIp} => ${hasGeoIp}`);
        }

        if (geoSite !== 'none') {
            const hasGeoSite = await this.exportGeoList([
                'geosite',
                'export',
                geoSite,
                '-f',
                'geosite.db'
            ]);
            log.info(`GeoSite: ${geoSite} => ${hasGeoSite}`);
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

        const results = await Promise.all(
            securityTasks.map(([type, category, file]) =>
                this.exportGeoList([type, 'export', category, '-f', file])
            )
        );

        log.info('Security lists setup results:', results);
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

    private async exportGeoList(args: string[]): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            let noError = true;
            const command = path.join(this.workingDirPath, this.sbWDFileName);
            const extractProcess = spawn(command, args, { cwd: this.workingDirPath });

            extractProcess.stdout?.on('error', () => {
                noError = false;
            });

            extractProcess.on('close', () => {
                resolve(noError);
            });
        });
    }
}

export default SingBoxManager;
