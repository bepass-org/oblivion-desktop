import { ChildProcess, spawn } from 'child_process';
import log from 'electron-log';

type PlatformCommands = {
    getPlatformCommand: (binPath: string) => [string, string[]];
};

enum WindowsTaskStatus {
    NotCreated,
    Ready,
    Running,
    Failed
}

class SingBoxManager {
    private singBoxProcess: ChildProcess | null = null;

    private readonly isWindows: boolean;

    /**
     * Initializes the SingBoxManager instance.
     * @param {string} binPath - Path to the Sing-Box binary.
     * @param {string} configPath - Path to the configuration file.
     * @param {string} workingDir - Working directory for Sing-Box.
     */
    constructor(
        private readonly binPath: string,
        private readonly configPath: string,
        private readonly workingDir: string
    ) {
        this.isWindows = process.platform === 'win32';
    }

    // Common Methods
    /**
     * Starts the Sing-Box process for the current platform.
     * Chooses the appropriate method for Windows or Darwin/Linux.
     * @returns {Promise<boolean>} - Resolves to true if the process starts successfully, otherwise false.
     */
    public async startSingBox(): Promise<boolean> {
        return this.isWindows ? this.startSingBoxWindows() : this.startSingBoxDarwinLinux();
    }

    /**
     * Stops the Sing-Box process for the current platform.
     * Chooses the appropriate method for Windows or Darwin/Linux.
     * @returns {Promise<boolean>} - Resolves to true if the process stops successfully, otherwise false.
     */
    public async stopSingBox(): Promise<boolean> {
        return this.isWindows ? this.stopSingBoxWindows() : this.stopSingBoxDarwinLinux();
    }

    /**
     * Monitors the Sing-Box connection status.
     * Makes up to 10 attempts, each with a 5-second timeout, to establish a connection.
     * If the connection fails after 10 attempts, it stops the Sing-Box process.
     * @returns {Promise<boolean>} - Resolves to true if the connection is established, otherwise false.
     */
    private async checkConnectionStatus(): Promise<boolean> {
        let isChecking = false;
        let attemptCounter = 0;
        log.info('Sing-Box started successfully, waiting for connection...');
        return new Promise((resolve) => {
            const pingInterval = setInterval(async () => {
                if (isChecking) return;
                isChecking = true;
                attemptCounter++;
                const controller = new AbortController();
                const signal = controller.signal;
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                try {
                    const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
                        signal
                    });
                    if (response.ok) {
                        log.info(
                            `Sing-Box connected successfully after ${attemptCounter} attempts.`
                        );
                        clearInterval(pingInterval);
                        resolve(true);
                    }
                } catch {
                    log.info(
                        `Connection not yet established. Retry attempt ${attemptCounter}/10...`
                    );
                } finally {
                    clearTimeout(timeoutId);
                    isChecking = false;
                    if (attemptCounter > 9) {
                        log.error(
                            `Failed to establish Sing-Box connection after ${attemptCounter} attempts.`
                        );
                        clearInterval(pingInterval);
                        await this.stopSingBox();
                        resolve(false);
                    }
                }
            }, 2000);
        });
    }

    /**
     * Executes a system process with the specified command and arguments.
     * Captures output and errors from the process.
     * @param {string} command - Command to be executed.
     * @param {string[]} args - Arguments for the command.
     * @returns {Promise<string>} - Resolves with the process output if successful, rejects on errors.
     */
    private async runProcess(command: string, args: string[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let output = '';
            let hasErrors = false;
            const process = spawn(command, args, { cwd: this.workingDir });

            process.stdout?.on('data', (data: Buffer) => {
                output += data.toString();
            });

            process.stderr?.on('data', (err: Buffer) => {
                hasErrors = true;
                log.error(`Process error: ${err.toString()}`);
            });

            process.on('close', () => {
                if (hasErrors) reject(new Error('Process encountered errors.'));
                else resolve(output);
            });
        });
    }

    // Windows-specific Methods
    /**
     * Starts the Sing-Box process on Windows by managing scheduled tasks.
     * Creates the task if not already present, starts it if it isn't running, and verifies the connection.
     * @returns {Promise<boolean>} - Resolves to true if the task starts and the connection is established, otherwise false.
     */
    private async startSingBoxWindows(): Promise<boolean> {
        try {
            log.info('Checking Sing-Box task status...');
            const taskStatus = await this.checkWindowsTaskStatus();
            if (taskStatus === WindowsTaskStatus.Failed) return false;

            if (taskStatus === WindowsTaskStatus.NotCreated) {
                log.info('Creating Sing-Box task...');
                if (!(await this.createWindowsTask())) return false;
            } else if (taskStatus === WindowsTaskStatus.Running) {
                log.info('Sing-Box task is already running.');
                return true;
            }

            log.info('Starting Sing-Box task...');
            if (!(await this.setWindowsTaskState('start'))) {
                log.error('Failed to start Sing-Box task.');
                return false;
            }

            log.info('Sing-Box task started successfully.');
            return this.checkConnectionStatus();
        } catch (error) {
            log.error('Failed to start Sing-Box:', error);
            return false;
        }
    }

    /**
     * Stops the Sing-Box process on Windows by controlling the scheduled task.
     * Stops the task if it's running.
     * @returns {Promise<boolean>} - Resolves to true if the task is stopped successfully, otherwise false.
     */
    private async stopSingBoxWindows(): Promise<boolean> {
        const taskStatus = await this.checkWindowsTaskStatus();
        if (taskStatus === WindowsTaskStatus.Failed) return false;

        if (taskStatus === WindowsTaskStatus.Ready) {
            log.info('Sing-Box task is not running.');
            return false;
        }

        log.info('Stopping Sing-Box task. Please wait...');
        const isTaskStopped = await this.setWindowsTaskState('stop');
        if (isTaskStopped) {
            log.info('Sing-Box task stopped successfully.');
            this.singBoxProcess = null;
        } else {
            log.error('Failed to stop Sing-Box task.');
        }

        return isTaskStopped;
    }

    /**
     * Checks the status of the Sing-Box scheduled task on Windows.
     * Uses PowerShell to determine if the task exists and whether it is running.
     * @returns {Promise<WindowsTaskStatus>} - Resolves with the current task status.
     */
    private async checkWindowsTaskStatus(): Promise<WindowsTaskStatus> {
        try {
            const output = await this.runProcess('powershell.exe', [
                '-Command',
                'Get-ScheduledTask -TaskName "OblivionDesktop"'
            ]);
            if (output.includes('Ready')) return WindowsTaskStatus.Ready;
            if (output.includes('Running')) return WindowsTaskStatus.Running;
            return WindowsTaskStatus.Failed;
        } catch (error) {
            return WindowsTaskStatus.NotCreated;
        }
    }

    /**
     * Creates a new scheduled task for running Sing-Box on Windows.
     * The task is created to run with elevated privileges.
     * Waits for 3 seconds after the task creation before resolving.
     * @returns {Promise<boolean>} - Resolves to true if the task is created successfully, otherwise false.
     */
    private async createWindowsTask(): Promise<boolean> {
        try {
            const { getPlatformCommand } = this.getPlatformCommands();
            const [command, args] = getPlatformCommand(this.binPath);
            const output = await this.runProcess(command, args);
            if (output.trim()) {
                log.info('Sing-Box task created successfully.');
                await new Promise((resolve) => {
                    setTimeout(() => resolve(null), 3000);
                });
                return true;
            } else {
                log.error('Failed to create Sing-Box task.');
                return false;
            }
        } catch (error) {
            log.error('Failed to create Sing-Box task:', error);
            return false;
        }
    }

    /**
     * Sets the state of the Sing-Box scheduled task on Windows.
     * The action can be 'start' or 'stop', controlling whether the task runs or is stopped.
     * @param {string} action - The desired task action ('start' or 'stop').
     * @returns {Promise<boolean>} - Resolves to true if the action is performed successfully, otherwise false.
     */
    private async setWindowsTaskState(action: string): Promise<boolean> {
        try {
            const command = `${action === 'start' ? 'Start' : 'Stop'}-ScheduledTask -TaskName "OblivionDesktop"`;
            await this.runProcess('powershell.exe', ['-Command', command]);
            return true;
        } catch (error) {
            log.error(`Failed to ${action} Sing-Box task:`, error);
            return false;
        }
    }

    // Darwin/Linux-specific Methods
    /**
     * Starts the Sing-Box process on macOS/Linux.
     * Ensures necessary permissions are set before starting the process.
     * @returns {Promise<boolean>} - Resolves to true if the process starts successfully and the connection is established, otherwise false.
     */
    private async startSingBoxDarwinLinux(): Promise<boolean> {
        if (this.singBoxProcess) return true;

        try {
            if (!(await this.ensureDarwinLinuxPermissions())) return false;

            log.info('Starting Sing-Box...');
            this.singBoxProcess = spawn(this.binPath, ['run', '-c', this.configPath], {
                cwd: this.workingDir
            });

            this.singBoxProcess?.stdout?.on('data', (data: Buffer) =>
                log.info(`Sing-Box output: ${data.toString()}`)
            );
            this.singBoxProcess?.stderr?.on('data', (err: Buffer) =>
                log.error(`Sing-Box error: ${err.toString()}`)
            );
            this.singBoxProcess?.on('close', (code) => {
                log.info(`Sing-Box process exited with code ${code}`);
                this.singBoxProcess = null;
            });

            return await this.checkConnectionStatus();
        } catch (error) {
            log.error('Failed to start Sing-Box:', error);
            this.singBoxProcess = null;
            return false;
        }
    }

    /**
     * Stops the Sing-Box process on macOS/Linux by killing the process if it's running.
     * @returns {Promise<boolean>} - Resolves to true if the process is killed successfully, otherwise false.
     */
    private async stopSingBoxDarwinLinux(): Promise<boolean> {
        if (!this.singBoxProcess) return false;

        try {
            this.singBoxProcess?.kill();
            await this.waitForDarwinLinuxProcessExit();
            return true;
        } catch (error) {
            log.error('Failed to stop Sing-Box:', error);
            return false;
        }
    }

    /**
     * Waits for the Sing-Box process to exit on macOS/Linux.
     * It checks every second if the process has been terminated.
     * @returns {Promise<void>} - Resolves when the process has exited.
     */
    private waitForDarwinLinuxProcessExit(): Promise<void> {
        return new Promise((resolve) => {
            const killInterval = setInterval(() => {
                if (!this.singBoxProcess) {
                    clearInterval(killInterval);
                    resolve();
                }
            }, 1000);
        });
    }

    /**
     * Ensures necessary permissions are set for Sing-Box on macOS/Linux.
     * If the binary is not owned by root or lacks suid, it will attempt to change ownership
     * and permissions using `pkexec` on Linux or `osascript` on macOS.
     * @returns {Promise<boolean>} - Resolves to true if permissions are successfully ensured, otherwise false.
     * If permissions cannot be set, it logs the failure and returns false.
     */
    private async ensureDarwinLinuxPermissions(): Promise<boolean> {
        log.info('Checking Sing-Box permissions...');
        const isAdministrator = await this.checkDarwinLinuxPermissions();

        if (!isAdministrator) {
            log.info('Setting Sing-Box permissions...');
            return this.setDarwinLinuxPermissions();
        }

        return true;
    }

    /**
     * Checks if the current user has the necessary permissions for Sing-Box on macOS/Linux.
     * Verifies whether the binary has the correct ownership and suid permissions.
     * @returns {Promise<boolean>} - Resolves to true if permissions are correct, otherwise false.
     */
    private async checkDarwinLinuxPermissions(): Promise<boolean> {
        try {
            const output = await this.runProcess('ls', ['-l', this.binPath]);
            return output.includes('root');
        } catch (error) {
            log.error('Failed to check Sing-Box permissions:', error);
            return false;
        }
    }

    /**
     * Sets the necessary permissions for Sing-Box on macOS/Linux.
     * Changes ownership and permissions of the binary using `pkexec` or `osascript`.
     * @returns {Promise<boolean>} - Resolves to true if permissions are set successfully, otherwise false.
     */
    private async setDarwinLinuxPermissions(): Promise<boolean> {
        try {
            const { getPlatformCommand } = this.getPlatformCommands();
            const [command, args] = getPlatformCommand(this.binPath);
            await this.runProcess(command, args);
            log.info('Sing-Box permissions set successfully');
            return true;
        } catch (error) {
            log.error('Failed to set Sing-Box permissions:', error);
            return false;
        }
    }

    // Platform-specific commands
    /**
     * Returns the platform-specific commands for Sing-Box management.
     * Includes the logic for invoking `pkexec` on Linux, `powershell` on Windows and `osascript` on macOS.
     * @returns {PlatformCommands} - The platform commands including binaries and arguments.
     */
    private getPlatformCommands(): PlatformCommands {
        const commands: { [key: string]: PlatformCommands } = {
            darwin: {
                getPlatformCommand: (binPath) => [
                    'osascript',
                    [
                        '-e',
                        `do shell script "chown root:admin \\"${binPath}\\" && chmod +s \\"${binPath}\\"" with prompt "Oblivion Desktop requires administrator privileges to set Sing-Box permissions." with administrator privileges`
                    ]
                ]
            },
            win32: {
                getPlatformCommand: (binPath) => [
                    'powershell.exe',
                    [
                        '-Command',
                        `Start-Process powershell -ArgumentList 'Register-ScheduledTask "OblivionDesktop" -InputObject (New-ScheduledTask -Action (New-ScheduledTaskAction -Execute "${binPath.replace(/'/g, "''")}" -Argument "\\"run -c ${this.configPath.replace(/'/g, "''")}\\"") -Principal (New-ScheduledTaskPrincipal -UserId $env:UserDomain\\$env:UserName -LogonType S4U -RunLevel Highest) -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DisallowStartOnRemoteAppSession -DontStopIfGoingOnBatteries -DisallowHardTerminate -Compatibility Win8 -ExecutionTimeLimit (New-TimeSpan -Seconds 0)));' -Verb RunAs -WindowStyle Hidden -PassThru`
                    ]
                ]
            },
            linux: {
                getPlatformCommand: (binPath) => [
                    'pkexec',
                    ['sh', '-c', `chown root:root "${binPath}" && chmod +s "${binPath}"`]
                ]
            }
        };

        return commands[process.platform] || { getPlatformCommand: () => ['', []] };
    }
}

export default SingBoxManager;
