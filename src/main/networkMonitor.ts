import { networkStats, powerShellStart } from 'systeminformation';
import { BrowserWindow, ipcMain } from 'electron';

enum MonitoringState {
    Idle,
    Initializing,
    Measuring,
    Active
}

interface NetworkStats {
    currentDownload: number;
    currentUpload: number;
    totalDownload: number;
    totalUpload: number;
    totalUsage: number;
}

class NetworkMonitor {
    private static readonly MONITOR_INTERVAL_MS = 2000;

    private speedMonitorInterval: ReturnType<typeof setInterval> | null = null;

    private monitoringState: MonitoringState = MonitoringState.Idle;

    private initialDownloadUsage: number = 0;

    private initialUploadUsage: number = 0;

    private isWindowsPowerShellStarted: boolean = false;

    private readonly mainWindow: BrowserWindow | null;

    constructor(mainWindow: BrowserWindow | null) {
        this.mainWindow = mainWindow;
    }

    public initializeIpcEvents(): void {
        if (process.platform === 'win32' && !this.isWindowsPowerShellStarted) {
            powerShellStart();
            this.isWindowsPowerShellStarted = true;
        }
        ipcMain.on('check-speed', (event, arg) => {
            if (arg) {
                this.startMonitoring();
            } else {
                this.stopMonitoring();
            }
        });
    }

    public startMonitoring(): void {
        if (this.speedMonitorInterval || this.monitoringState !== MonitoringState.Idle) return;

        this.monitoringState = MonitoringState.Initializing;
        this.initializeStats();
    }

    public stopMonitoring(): void {
        if (this.speedMonitorInterval && this.monitoringState !== MonitoringState.Idle) {
            clearInterval(this.speedMonitorInterval);
            this.speedMonitorInterval = null;
            this.monitoringState = MonitoringState.Idle;
            this.initialDownloadUsage = 0;
            this.initialUploadUsage = 0;
        }
    }

    private initializeStats(): void {
        if (this.monitoringState !== MonitoringState.Initializing) return;

        this.monitoringState = MonitoringState.Active;
        this.getCurrentStats()
            .then((defaultInterface) => {
                this.initialDownloadUsage = defaultInterface.rx_bytes;
                this.initialUploadUsage = defaultInterface.tx_bytes;
                this.startIntervalMonitoring();
            })
            .catch((error) => {
                console.error('Error initializing stats:', error);
            });
    }

    private startIntervalMonitoring(): void {
        this.speedMonitorInterval = setInterval(
            () => this.measureNetworkStats(),
            NetworkMonitor.MONITOR_INTERVAL_MS
        );
        this.monitoringState = MonitoringState.Active;
    }

    private measureNetworkStats(): void {
        if (this.monitoringState === MonitoringState.Measuring) return;

        this.monitoringState = MonitoringState.Measuring;
        this.getCurrentStats()
            .then((defaultInterface) => {
                const stats: NetworkStats = {
                    currentDownload: defaultInterface.rx_sec,
                    currentUpload: defaultInterface.tx_sec,
                    totalDownload: defaultInterface.rx_bytes - this.initialDownloadUsage,
                    totalUpload: defaultInterface.tx_bytes - this.initialUploadUsage,
                    totalUsage:
                        defaultInterface.rx_bytes +
                        defaultInterface.tx_bytes -
                        (this.initialDownloadUsage + this.initialUploadUsage)
                };

                this.sendStatsToRenderer(stats);
            })
            .catch((error) => {
                console.error('Error measuring network stats:', error);
            })
            .finally(() => {
                this.monitoringState = MonitoringState.Active;
            });
    }

    private async getCurrentStats(): Promise<any> {
        const interfaces = await networkStats();
        return interfaces[0];
    }

    private sendStatsToRenderer(stats: NetworkStats): void {
        if (this.mainWindow) {
            this.mainWindow.webContents.send('speed-stats', stats);
        }
    }
}

export default NetworkMonitor;
