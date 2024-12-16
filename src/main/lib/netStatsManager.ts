import { ipcMain } from 'electron';
import log from 'electron-log';
import { ChildProcess, spawn } from 'child_process';
import { networkInterfaceDefault } from 'systeminformation';

class NetStatsManager {
    private statsProcess?: ChildProcess | null;

    private isMonitoring: boolean = false;

    private networkInterface: string = '';

    private retryCount = 0;

    private static readonly MAX_RETRIES = 3;

    constructor(
        private readonly netStatsPath: string,
        private readonly wpDirPath: string,
        private readonly spawnArgs: string[] = ['-t', '1', '-p', '2', '-f', 'json']
    ) {
        this.initializeIpcEvents();
        this.initializeNetworkInterface().catch((err) =>
            log.error('Failed to initialize network interface:', err)
        );
    }

    public initializeIpcEvents(): void {
        ipcMain.on('net-stats', (event, shouldStart) => {
            if (shouldStart && !this.isMonitoring) {
                this.isMonitoring = true;
                this.startMonitoring(event);
            } else if (!shouldStart && this.isMonitoring) {
                this.isMonitoring = false;
                this.stopMonitoring();
            }
        });
    }

    private async initializeNetworkInterface(): Promise<void> {
        this.networkInterface = await networkInterfaceDefault();
    }

    public startMonitoring(event: any): void {
        if (!this.statsProcess) {
            log.info('Starting netStats...');
            this.statsProcess = spawn(
                this.netStatsPath,
                ['-i', this.networkInterface, ...this.spawnArgs],
                {
                    cwd: this.wpDirPath
                }
            );

            this.statsProcess.stdout?.on('data', (data: Buffer) => {
                const output = data.toString();
                try {
                    if (output.startsWith('{"interface":')) {
                        this.isMonitoring = true;
                        this.retryCount = 0;
                        const stats = JSON.parse(output);
                        event.reply('net-stats', stats);
                    } else {
                        log.info('netStats output:', output);
                    }
                } catch (err) {
                    log.error('Failed to parse netStats output:', err);
                }
            });

            this.statsProcess.stderr?.on('data', (data: Buffer) => {
                log.error('netStats error:', data.toString());
            });

            this.statsProcess.on('close', (code) => {
                log.info(`netStats exited with code ${code}`);
                this.statsProcess = null;
                this.isMonitoring = false;

                if (code !== 0 && this.retryCount < NetStatsManager.MAX_RETRIES) {
                    this.retryCount++;
                    //this.startMonitoring(event);
                }
            });
        }
    }

    public stopMonitoring(): void {
        if (this.statsProcess) {
            log.info('Stopping netStats monitoring...');
            this.statsProcess.kill();
        }
    }
}

export default NetStatsManager;
