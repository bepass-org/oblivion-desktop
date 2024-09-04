import { ChildProcess, spawn } from 'child_process';
import log from 'electron-log';

type PlatformCommands = {
    start: (binPath: string, configPath: string) => [string, string[]];
    stop: (pid: string) => [string, string[]];
};

class SingBoxManager {
    private sbProcess: ChildProcess | null = null;

    private readonly sbBinPath: string;

    private readonly sbConfigPath: string;

    private readonly wpDirPath: string;

    private pid: string = '';

    private readonly startCommandDesc: string = `Oblivion Desktop requires administrator privileges to run Sing-Box in TUN mode.`;

    private readonly stopCommandDesc: string = `Oblivion Desktop requires administrator privileges to stop Sing-Box gracefully.`;

    constructor(sbBinPath: string, sbConfigPath: string, wpDirPath: string) {
        this.sbBinPath = sbBinPath;
        this.sbConfigPath = sbConfigPath;
        this.wpDirPath = wpDirPath;
    }

    private getPlatformCommands(): PlatformCommands {
        const commands: { [key: string]: PlatformCommands } = {
            darwin: {
                start: (binPath, configPath) => [
                    'osascript',
                    [
                        '-e',
                        `set processID to do shell script "\\"${binPath}\\" run -c \\"${configPath}\\" > /dev/null 2>&1 & echo $! &" with prompt "${this.startCommandDesc}" with administrator privileges`
                    ]
                ],
                stop: (pid) => [
                    'osascript',
                    [
                        '-e',
                        `do shell script "kill ${pid}" with prompt "${this.stopCommandDesc}" with administrator privileges`
                    ]
                ]
            },
            win32: {
                start: (binPath, configPath) => [
                    'powershell.exe',
                    [
                        '-Command',
                        `$process = Start-Process -FilePath '${binPath.replace(/'/g, "''")}' -ArgumentList 'run -c "${configPath.replace(/'/g, "''")}"' -Verb RunAs -WindowStyle Hidden -PassThru; $process.Id`
                    ]
                ],
                stop: (pid) => [
                    'powershell.exe',
                    [
                        '-Command',
                        `Start-Process powershell -ArgumentList 'Stop-Process -Id ${pid}' -Verb RunAs -WindowStyle Hidden`
                    ]
                ]
            },
            linux: {
                start: (binPath, configPath) => [
                    'sh',
                    [
                        '-c',
                        `nohup pkexec '${binPath}' run -c '${configPath}' > /dev/null 2>&1 & echo $!`
                    ]
                ],
                stop: (pid) => ['sh', ['-c', `pkexec kill ${pid}`]]
            }
        };

        return (
            commands[process.platform] || {
                start: () => ['', []],
                stop: () => ['', []]
            }
        );
    }

    public async startSingBox(): Promise<boolean> {
        if (this.sbProcess) {
            log.info('Sing-Box is already running.');
            return true;
        }

        return new Promise<boolean>((resolve) => {
            try {
                log.info('Starting Sing-Box...');
                const { start } = this.getPlatformCommands();
                const [command, args] = start(this.sbBinPath, this.sbConfigPath);
                this.sbProcess = spawn(command, args, { cwd: this.wpDirPath });

                let output = '';
                let hasErrors: boolean = false;

                this.sbProcess.stdout?.on('data', (data: Buffer) => {
                    output += data.toString();
                });

                this.sbProcess.stderr?.on('data', (err: Buffer) => {
                    log.error(`Error starting Sing-Box: ${err.toString()}`);
                    hasErrors = true;
                });

                this.sbProcess.on('close', async () => {
                    if (output.trim() && !hasErrors) {
                        if (process.platform === 'linux') {
                            this.findLinuxProcessId(resolve);
                        } else {
                            this.pid = output;
                            this.checkConnectionStatus(resolve);
                        }
                    } else {
                        log.error('Failed to start Sing-Box: No PID received');
                        this.pid = '';
                        this.sbProcess = null;
                        resolve(false);
                    }
                });
            } catch (error) {
                log.error('Failed to start Sing-Box:', error);
                this.pid = '';
                this.sbProcess = null;
                resolve(false);
            }
        });
    }

    public async stopSingBox(): Promise<boolean> {
        if (this.pid === '') {
            log.info('Sing-Box is not running.');
            return true;
        }

        let hasErrors: boolean = false;

        return new Promise<boolean>((resolve) => {
            try {
                log.info('Stopping Sing-Box...');
                const { stop } = this.getPlatformCommands();
                const [command, args] = stop(this.pid);
                const killProcess = spawn(command, args);
                killProcess.stderr?.on('data', (err: Buffer) => {
                    log.error(`Error stopping Sing-Box: ${err.toString()}`);
                    hasErrors = true;
                });
                killProcess.on('close', () => {
                    if (!hasErrors) {
                        log.info('Sing-Box stopped successfully.');
                        this.sbProcess = null;
                        this.pid = '';
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            } catch (error) {
                log.error('Failed to stop Sing-Box:', error);
                resolve(false);
            }
        });
    }

    private findLinuxProcessId(resolve: (value: boolean) => void): void {
        const command = `pgrep -f "${this.sbBinPath}" | xargs ps -o pid= -o user= -p | grep root | awk '{print $1}'`;
        const checkTimeout = setTimeout(() => {
            try {
                const findPidProcess = spawn('sh', ['-c', command]);

                findPidProcess.stdout?.on('data', (data: Buffer) => {
                    if (data.toString() !== '') {
                        this.pid = data.toString();
                    }
                });
                findPidProcess.on('close', () => {
                    clearTimeout(checkTimeout);
                    if (this.pid !== '') {
                        this.checkConnectionStatus(resolve);
                    } else {
                        log.error('Failed to start Sing-Box: No PID received');
                        this.sbProcess = null;
                        resolve(false);
                    }
                });
            } catch (error) {
                log.error('Error checking process ID:', error);
                clearTimeout(checkTimeout);
                resolve(false);
            }
        }, 10000);
    }

    private checkConnectionStatus(resolve: (value: boolean) => void): void {
        let isChecking: boolean = false;
        let attemptCounter = 0;
        log.info('Sing-Box started successfully. Establishing connection...');
        const pingInterval = setInterval(async () => {
            if (isChecking) return;
            isChecking = true;
            attemptCounter++;
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
                    method: 'HEAD',
                    signal
                });
                if (response.ok) {
                    log.info('Sing-Box has connected successfully.');
                    clearInterval(pingInterval);
                    clearTimeout(timeoutId);
                    resolve(true);
                }
            } catch (error) {
                log.info(
                    `Attempt ${attemptCounter}/10: The Sing-Box connection has not been established yet. Please wait...`
                );
            } finally {
                clearTimeout(timeoutId);
                isChecking = false;
                if (attemptCounter > 9) {
                    log.error('The Sing-Box connection has not been established.');
                    clearInterval(pingInterval);
                    await this.stopSingBox();
                }
            }
        }, 2000);
    }
}

export default SingBoxManager;
