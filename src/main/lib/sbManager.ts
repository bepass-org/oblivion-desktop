import path from 'path';
import { app } from 'electron';
import Sudoer from '@o/electron-sudo';
import { ChildProcess, spawn } from 'child_process';

class SingBoxManager {
    private sbProcess: ChildProcess | null = null;

    private readonly sbBinPath: string;

    private readonly sbFileName: string;

    private readonly sbConfigPath: string;

    private readonly wpDirPath: string;

    private readonly sudoer: typeof Sudoer.prototype;

    private readonly icon: string;

    constructor(sbBinPath: string, sbFileName: string, sbConfigPath: string, wpDirPath: string) {
        this.sbBinPath = sbBinPath;
        this.sbFileName = sbFileName;
        this.sbConfigPath = sbConfigPath;
        this.wpDirPath = wpDirPath;
        this.icon = path.join(
            app.getAppPath().replace(/[/\\]app\.asar$/, ''),
            'assets',
            'icon.icns'
        );
        const options = { name: 'Oblivion Desktop', icns: this.icon };
        this.sudoer = new Sudoer(options);
    }

    public async startSingBox(method: any): Promise<void> {
        if (this.sbProcess) {
            return;
        }

        try {
            this.sbProcess =
                method === 'tun'
                    ? await this.sudoer.spawn(`"${this.sbBinPath}"`, [
                          'run',
                          '-c',
                          `"${this.sbConfigPath}"`
                      ])
                    : spawn(this.sbBinPath, ['run', '-c', this.sbConfigPath], {
                          cwd: this.wpDirPath
                      });

            this.sbProcess?.on('close', (code: number | null) => {
                console.log(`Sing-Box process exited with code ${code}`);
                this.sbProcess = null;
            });
        } catch (error) {
            console.error('Failed to start Sing-Box:', error);
            this.sbProcess = null;
        }
    }

    public async stopSingBox(method: any): Promise<void> {
        if (!this.sbProcess) {
            return;
        }

        try {
            if (method === 'tun') {
                await this.killProcessCrossPlatform();
            } else {
                this.sbProcess.kill();
            }

            await this.waitForProcessToClose(5000);
        } catch (error) {
            console.error('Failed to stop Sing-Box:', error);
        } finally {
            this.sbProcess = null;
        }
    }

    private async killProcessCrossPlatform(): Promise<void> {
        const platform = process.platform;

        let command: string;
        if (platform === 'win32') {
            command = `taskkill /F /IM "${this.sbFileName}"`;
        } else if (platform === 'darwin' || platform === 'linux') {
            command = `pkill "${this.sbFileName}"`;
        } else {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        try {
            await this.sudoer.exec(command);
        } catch (error) {
            console.error('Error executing kill command:', error);
            // If the kill command fails, try a more aggressive approach
            if (platform === 'darwin' || platform === 'linux') {
                try {
                    await this.sudoer.exec(`killall -9 "${this.sbFileName}"`);
                } catch (innerError) {
                    console.error('Error executing killall command:', innerError);
                    throw innerError;
                }
            } else {
                throw error;
            }
        }
    }

    private waitForProcessToClose(timeout: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.sbProcess) {
                resolve();
                return;
            }

            const timer = setTimeout(() => {
                reject(new Error('Timeout waiting for Sing-Box to stop'));
            }, timeout);

            this.sbProcess.on('close', () => {
                clearTimeout(timer);
                resolve();
            });
        });
    }
}

export default SingBoxManager;
