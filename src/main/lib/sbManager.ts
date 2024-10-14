import { spawn } from 'child_process';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import { isDev } from './utils';
import { defaultSettings, singBoxGeoIp, singBoxGeoSite } from '../../defaultSettings';
import { createSbConfig } from './sbConfig';

type PlatformCommands = {
    start: (helperPath: string) => [string, string[]];
    running: (processName: string) => [string, string[]];
};

class SingBoxManager {
    private readonly cmdPath;

    private readonly configPath;

    private monitorWarpPlus: boolean | null = null;

    private monitorOblivionDesktop: boolean | null = null;

    constructor(
        private readonly helperPath: string,
        private readonly helperFileName: string,
        private readonly sbWDFileName: string,
        private readonly sbConfigName: string,
        private readonly workingDirPath: string
    ) {
        this.cmdPath = path.join(this.workingDirPath, 'cmd.obv');
        this.configPath = path.join(this.workingDirPath, 'config.obv');
    }

    public async startSingBox(): Promise<boolean> {
        if (await this.isProcessRunning(this.sbWDFileName)) return true;

        await this.initialize();

        try {
            if (!(await this.isProcessRunning(this.helperFileName))) {
                await this.startHelper();
                if (
                    !(await this.processCheck(
                        this.helperFileName,
                        'Oblivion-Helper started successfully.',
                        'Failed to start Oblivion-Helper.',
                        true
                    ))
                ) {
                    return false;
                }
            }

            log.info('Starting Sing-Box...');
            if (!(await this.writeCommand('start'))) {
                return false;
            }

            return this.processCheck(
                this.sbWDFileName,
                'Sing-Box started successfully, waiting for connection...',
                'Failed to start Sing-Box.',
                true
            );
        } catch (error) {
            log.error('Failed to start Sing-Box:', error);
            return false;
        }
    }

    public async stopSingBox(): Promise<boolean> {
        if (!(await this.isProcessRunning(this.sbWDFileName))) return true;

        log.info('Stopping Sing-Box...');
        if (!this.monitorWarpPlus && !(await this.writeCommand('stop'))) {
            return false;
        }

        return this.processCheck(
            this.sbWDFileName,
            'Sing-Box stopped successfully.',
            'Failed to stop Sing-Box.',
            false
        );
    }

    public async stopHelper(): Promise<boolean> {
        if (!(await this.isProcessRunning(this.helperFileName))) return true;

        if (this.monitorOblivionDesktop) {
            log.info('Stopping Oblivion-Helper...');
            return this.processCheck(
                this.helperFileName,
                'Oblivion-Helper stopped successfully.',
                'Failed to stop Oblivion-Helper.',
                false
            );
        }

        return true;
    }

    public async checkConnectionStatus(): Promise<boolean> {
        const maxAttempts = 10;
        const checkStatus = async (attempt: number): Promise<boolean> => {
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            try {
                const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
                    signal
                });
                if (response.ok) {
                    log.info(`Sing-Box connected successfully after ${attempt} attempts.`);
                    return true;
                }
            } catch {
                log.info(`Connection not yet established. Retry attempt ${attempt}/10...`);
            } finally {
                clearTimeout(timeoutId);
            }

            if (attempt >= maxAttempts) {
                log.error(`Failed to establish Sing-Box connection after ${maxAttempts} attempts.`);
                return false;
            }

            await this.delay(2000);
            return checkStatus(attempt + 1);
        };

        return checkStatus(1);
    }

    private async initialize(): Promise<void> {
        const [port, ip, site, block, mtu, routingRules, closeSingBox, closeHelper] =
            await Promise.all([
                settings.get('port'),
                settings.get('singBoxGeoIp'),
                settings.get('singBoxGeoSite'),
                settings.get('singBoxGeoBlock'),
                settings.get('singBoxMTU'),
                settings.get('routingRules'),
                settings.get('closeSingBox'),
                settings.get('closeHelper')
            ]);

        const socksPort = typeof port === 'number' ? port : defaultSettings.port;
        const tunMtu = typeof mtu === 'number' ? mtu : defaultSettings.singBoxMTU;
        const geoIp = typeof ip === 'string' ? ip : singBoxGeoIp[0].geoIp;
        const geoSite = typeof site === 'string' ? site : singBoxGeoSite[0].geoSite;
        const geoBlock = typeof block === 'boolean' ? block : defaultSettings.singBoxGeoBlock;

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
            const geoIpMalware = await this.exportGeoList([
                'geoip',
                'export',
                'malware',
                '-f',
                'security-ip.db'
            ]);
            const geoIpPhishing = await this.exportGeoList([
                'geoip',
                'export',
                'phishing',
                '-f',
                'security-ip.db'
            ]);
            const geoSiteMalware = await this.exportGeoList([
                'geosite',
                'export',
                'malware',
                '-f',
                'security.db'
            ]);
            const geoSiteCryptoMiners = await this.exportGeoList([
                'geosite',
                'export',
                'cryptominers',
                '-f',
                'security.db'
            ]);
            const geoSitePhishing = await this.exportGeoList([
                'geosite',
                'export',
                'phishing',
                '-f',
                'security.db'
            ]);
            const geoSiteAds = await this.exportGeoList([
                'geosite',
                'export',
                'category-ads-all',
                '-f',
                'security.db'
            ]);
            log.info(
                `GeoIpMalware: ${geoIpMalware}, GeoIpPhishing: ${geoIpPhishing}, GeoSiteMalware: ${geoSiteMalware}, GeoSiteCryptoMiners: ${geoSiteCryptoMiners}, GeoSitePhishing: ${geoSitePhishing}, GeoSiteAds: ${geoSiteAds}`
            );
        }

        const { ipSet, domainSet, domainSuffixSet, processSet } =
            this.parseRoutingRules(routingRules);

        createSbConfig(
            socksPort,
            tunMtu,
            geoBlock,
            geoIp,
            geoSite,
            ipSet,
            domainSet,
            domainSuffixSet,
            processSet
        );

        if (!fs.existsSync(this.cmdPath)) {
            log.info(`Helper command file has been created at ${this.cmdPath}`);
            fs.writeFileSync(this.cmdPath, '');
        }

        this.monitorWarpPlus =
            typeof closeSingBox === 'boolean' ? closeSingBox : defaultSettings.closeSingBox;
        this.monitorOblivionDesktop =
            typeof closeHelper === 'boolean' ? closeHelper : defaultSettings.closeHelper;

        const config = {
            sbConfig: this.sbConfigName,
            sbBin: this.sbWDFileName,
            wpBin: 'warp-plus',
            obBin: isDev() ? 'electron' : 'oblivion-desktop',
            monitorWp: this.monitorWarpPlus,
            monitorOb: this.monitorOblivionDesktop
        };

        log.info(`Helper config file has been created at ${this.configPath}`);
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 1), 'utf-8');
    }

    private async startHelper(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            log.info('Starting Oblivion-Helper...');

            const { start } = this.getPlatformCommands();
            const [command, args] = start(this.helperPath);

            const helperProcess = spawn(command, args, { cwd: this.workingDirPath });

            helperProcess.stdout?.on('data', (data: Buffer) => {
                if (
                    process.platform === 'linux' &&
                    data.toString().includes('Oblivion helper started.')
                ) {
                    resolve(true);
                }
            });

            helperProcess.stderr?.on('data', (err: Buffer) => {
                if (err.toString().includes('dismissed') || err.toString().includes('canceled')) {
                    if (process.platform === 'darwin') {
                        log.error('The operation was canceled by the user.');
                    }
                    reject('The operation was canceled by the user.');
                } else {
                    reject(new Error(err.toString()));
                }
            });

            helperProcess.on('close', (code) => {
                if (process.platform !== 'linux' && code === 0) {
                    resolve(true);
                }
            });
        });
    }

    private writeCommand(command: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            fs.writeFile(this.cmdPath, command, (err) => {
                if (err) {
                    log.error('Error sending command to Oblivion-Helper:', err);
                    resolve(false);
                } else {
                    log.info('Command sent to Oblivion-Helper:', command);
                    resolve(true);
                }
            });
        });
    }

    private async isProcessRunning(processPath: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            let isRunning = false;
            const { running } = this.getPlatformCommands();
            const [command, args] = running(processPath);
            const checkProcess = spawn(command, args);

            checkProcess.stdout?.on('data', (data: Buffer) => {
                const output = data.toString().trim();
                if (output.length > 0) {
                    isRunning = true;
                }
            });

            checkProcess.on('close', () => {
                resolve(isRunning);
            });
        });
    }

    private async processCheck(
        processPath: string,
        successMessage: string,
        errorMessage: string,
        processShouldBeRunning: boolean
    ): Promise<boolean> {
        const maxAttempts = 10;
        const checkProcess = async (attempt: number): Promise<boolean> => {
            const isRunning = await this.isProcessRunning(processPath);
            const conditionMet = processShouldBeRunning ? isRunning : !isRunning;

            if (conditionMet) {
                log.info(successMessage);
                return true;
            }

            if (attempt >= maxAttempts) {
                log.error(errorMessage);
                return false;
            }

            await this.delay(1000);
            return checkProcess(attempt + 1);
        };

        return checkProcess(1);
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    private getPlatformCommands(): PlatformCommands {
        const commands: { [key: string]: PlatformCommands } = {
            darwin: {
                start: (helperPath) => [
                    'osascript',
                    [
                        '-e',
                        `do shell script "\\"${helperPath}\\" > /dev/null 2>&1 & echo $! &" with administrator privileges`
                    ]
                ],
                running: (processName) => ['pgrep', ['-f', processName]]
            },
            win32: {
                start: (helperPath) => [
                    'powershell.exe',
                    [
                        '-Command',
                        `Start-Process -FilePath '${helperPath.replace(/'/g, "''")}' -Verb RunAs -WindowStyle Hidden;`
                    ]
                ],
                running: (processName) => [
                    'powershell.exe',
                    [
                        '-Command',
                        `Get-CimInstance Win32_Process | Where-Object { $_.Name -like '${processName}'}`
                    ]
                ]
            },
            linux: {
                start: (helperPath) => ['pkexec', [helperPath]],
                running: (processName) => ['pgrep', ['-f', processName]]
            }
        };

        return (
            commands[process.platform] || {
                start: () => ['', []],
                running: () => ['', []]
            }
        );
    }

    private parseRoutingRules(routingRules: any): {
        ipSet: string[];
        domainSet: string[];
        domainSuffixSet: string[];
        processSet: string[];
    } {
        const ipSet: string[] = [];
        const domainSet: string[] = [];
        const domainSuffixSet: string[] = [];
        const processSet: string[] = [];

        if (typeof routingRules === 'string' && routingRules.trim() !== '') {
            const lines = routingRules
                .split('\n')
                .map((line) => line.trim().replace(/,$/, ''))
                .filter((line) => line !== '');

            const isWindows = process.platform === 'win32';

            lines.forEach((line) => {
                const [prefix, value] = line.split(':').map((part) => part.trim());
                if (!value) return;

                switch (prefix) {
                    case 'ip': {
                        ipSet.push(value);
                        break;
                    }
                    case 'domain': {
                        if (value.startsWith('*')) {
                            domainSuffixSet.push(value.substring(1));
                        } else {
                            domainSet.push(value.replace('www.', ''));
                        }
                        break;
                    }
                    case 'app': {
                        const app = isWindows && !value.endsWith('.exe') ? `${value}.exe` : value;
                        processSet.push(app);
                        break;
                    }
                    default:
                        break;
                }
            });
        }

        return { ipSet, domainSet, domainSuffixSet, processSet };
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
