import { spawn } from 'child_process';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import { isDev } from './utils';
import { defaultSettings, singBoxGeo } from '../../defaultSettings';
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
        if (!fs.existsSync(this.cmdPath)) {
            log.info(`Creating new cmd file at ${this.cmdPath}`);
            fs.writeFileSync(this.cmdPath, '');
        }
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
        const port = (await settings.get('port')) || defaultSettings.port;
        const geo = await settings.get('singBoxGeo');
        const block = await settings.get('singBoxGeoBlock');
        const mtu = (await settings.get('singBoxMTU')) || defaultSettings.singBoxMTU;

        const selectedGeo = singBoxGeo.find((item) => item.region === geo) || singBoxGeo[0];
        if (selectedGeo.region !== 'None') {
            log.info(
                `GeoRegion: ${selectedGeo.region}, GeoIP: ${selectedGeo.geoIp}, GeoSite: ${selectedGeo.geoSite}`
            );
        }

        const geoBlock = typeof block === 'boolean' ? block : defaultSettings.singBoxGeoBlock;
        log.info(`GeoBlock(Ads, Malware, Phishing, Crypto Miners): ${geoBlock}`);

        createSbConfig(
            Number(port),
            Number(mtu),
            Boolean(geoBlock),
            selectedGeo.region,
            selectedGeo.geoIp,
            selectedGeo.geoSite
        );

        const closeSingBox = await settings.get('closeSingBox');
        const closeHelper = await settings.get('closeHelper');
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

        log.info(`Creating new config file at ${this.configPath}`);
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
}

export default SingBoxManager;
