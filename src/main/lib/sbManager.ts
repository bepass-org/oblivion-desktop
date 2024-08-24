import { ChildProcess, spawn } from 'child_process';

type PlatformCommands = {
    start: (binPath: string, configPath: string) => [string, string[]];
    kill: (pid: string) => [string, string[]];
    findPid: string;
};

class SingBoxManager {
    private sbProcess: ChildProcess | null = null;

    private readonly sbBinPath: string;

    private readonly sbConfigPath: string;

    private readonly wpDirPath: string;

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
                        `do shell script "\\"${binPath}\\" run -c \\"${configPath}\\"" with administrator privileges`
                    ]
                ],
                kill: (pid) => [
                    'osascript',
                    ['-e', `do shell script "kill ${pid}" with administrator privileges`]
                ],
                findPid: `pgrep -f "BINPATH" | xargs ps -o pid= -o user= -p | grep root | awk '{print $1}'`
            },
            win32: {
                start: (binPath, configPath) => [
                    'powershell.exe',
                    [
                        '-Command',
                        `Start-Process -FilePath '${binPath}' -ArgumentList 'run -c ${configPath}' -Credential (Get-Credential) -WindowStyle Hidden`
                    ]
                ],
                kill: (pid) => ['powershell.exe', ['-Command', `Stop-Process -Id ${pid}`]],
                findPid: `Get-WmiObject Win32_Process | Where-Object { $_.ExecutablePath -like 'BINPATH' } | Select-Object -ExpandProperty ProcessId`
            },
            linux: {
                start: (binPath, configPath) => [
                    'pkexec',
                    [binPath, 'run', '-c', configPath, '--disable-internal-agent']
                ],
                kill: (pid) => ['sh', ['-c', `pkexec kill ${pid}`]],
                findPid: `pgrep -f "BINPATH" | xargs ps -o pid= -o user= -p | grep root | awk '{print $1}'`
            }
        };

        return (
            commands[process.platform] || {
                start: () => ['', []],
                kill: () => ['', []],
                findPid: ''
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

                this.monitorProcessStart(resolve);
            } catch (error) {
                console.error('Failed to start Sing-Box:', error);
                this.sbProcess = null;
                resolve(false);
            }
        });
    }

    private monitorProcessStart(resolve: (value: boolean) => void): void {
        const checkInterval = setInterval(
            async () => {
                try {
                    const pid = await this.findProcessId(this.sbBinPath);
                    if (pid) {
                        clearInterval(checkInterval);
                        resolve(true);
                    }
                } catch (error) {
                    console.error('Error checking process ID:', error);
                    clearInterval(checkInterval);
                    resolve(false);
                }
            },
            process.platform === 'linux' ? 10000 : 1000
        );

        this.sbProcess?.stderr?.on('data', (err: Buffer) => {
            const errorMessage = err.toString();
            console.error(`Sing-Box error: ${errorMessage}`);
            clearInterval(checkInterval);
            this.sbProcess = null;
            resolve(false);
        });

        this.sbProcess?.on('close', () => {
            clearInterval(checkInterval);
        });
    }

    public async stopSingBox(): Promise<boolean> {
        if (!this.sbProcess) return false;

        try {
            const pid = await this.findProcessId(this.sbBinPath);
            if (pid) {
                const { kill } = this.getPlatformCommands();
                const [command, args] = kill(pid);
                const killProcess = spawn(command, args);

                return new Promise<boolean>((resolve) => {
                    killProcess.stderr?.on('data', () => resolve(true));
                    killProcess.on('close', (code: number | null) => {
                        console.log(`Sing-Box process exited with code ${code}`);
                        this.sbProcess = null;
                        resolve(false);
                    });
                });
            }
        } catch (error) {
            console.error('Failed to stop Sing-Box:', error);
        }

        return false;
    }

    private async findProcessId(processName: string): Promise<string | null> {
        const { findPid } = this.getPlatformCommands();
        const command = findPid.replace('BINPATH', processName);

        return new Promise<string | null>((resolve) => {
            const findPidProcess =
                process.platform === 'win32'
                    ? spawn('powershell.exe', ['-Command', command])
                    : spawn('sh', ['-c', command]);

            let pid = '';
            findPidProcess.stdout?.on('data', (data: Buffer) => {
                pid += data.toString();
            });

            findPidProcess.on('close', () => resolve(pid.trim() || null));
            findPidProcess.on('error', () => resolve(null));
        });
    }
}

export default SingBoxManager;
