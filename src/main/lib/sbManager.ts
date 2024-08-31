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
                        `set processID to do shell script "\\"${binPath}\\" run -c \\"${configPath}\\" > /dev/null 2>&1 & echo $! &" with administrator privileges` // Running the process in the background and capturing the PID
                    ]
                ],
                stop: (pid) => [
                    'osascript',
                    ['-e', `do shell script "kill ${pid}" with administrator privileges`]
                ]
            },
            win32: {
                start: (binPath, configPath) => [
                    'powershell.exe',
                    [
                        '-Command',
                        `$process = Start-Process -FilePath '${binPath}' -ArgumentList 'run -c ${configPath}' -Verb RunAs -WindowStyle Hidden -PassThru; $process.Id`
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
        if (this.sbProcess) return true;

        return new Promise<boolean>((resolve) => {
            try {
                const { start } = this.getPlatformCommands();
                const [command, args] = start(this.sbBinPath, this.sbConfigPath);
                this.sbProcess = spawn(command, args, { cwd: this.wpDirPath });

                let output = '';
                let hasErrors: boolean = false;

                this.sbProcess.stdout?.on('data', (data: Buffer) => {
                    output += data.toString();
                });

                this.sbProcess.stderr?.on('data', (err: Buffer) => {
                    log.error(`Sing-Box error: ${err.toString()}`);
                    hasErrors = true;
                });

                this.sbProcess.on('close', async () => {
                    if (output.trim() && !hasErrors) {
                        if (process.platform === 'linux') {
                            this.findLinuxProcessId(resolve);
                        } else {
                            setTimeout(() => {
                                const pid = output.trim();
                                this.pid = pid;
                                log.info(`Started Sing-Box process with PID: ${pid}`);
                                resolve(true);
                            }, 5000);
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
        if (!this.sbProcess || this.pid === '') return false;

        let hasErrors: boolean = false;

        return new Promise<boolean>((resolve) => {
            try {
                const { stop } = this.getPlatformCommands();
                const [command, args] = stop(this.pid);
                const killProcess = spawn(command, args);
                killProcess.stderr?.on('data', (err: Buffer) => {
                    log.error(`Sing-Box error: ${err.toString()}`);
                    hasErrors = true;
                    resolve(true);
                });
                killProcess.on('close', (code: number | null) => {
                    if (!hasErrors) {
                        log.info(`Sing-Box process exited with code ${code}`);
                        this.sbProcess?.kill();
                        this.sbProcess = null;
                        this.pid = '';
                        resolve(false);
                    }
                });
            } catch (error) {
                log.error('Failed to stop Sing-Box:', error);
                resolve(true);
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
                        log.info(`Started Sing-Box process with PID: ${this.pid}`);
                        resolve(true);
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
}

export default SingBoxManager;
