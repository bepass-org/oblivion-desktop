import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import SpeedTest, { MeasurementConfig } from '@cloudflare/speedtest';

const testMeasurements: MeasurementConfig[] = [
    { type: 'latency', numPackets: 1 },
    { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true },
    { type: 'latency', numPackets: 20 },
    { type: 'download', bytes: 1e5, count: 9 },
    { type: 'download', bytes: 1e6, count: 8 },
    { type: 'upload', bytes: 1e5, count: 8 },
    { type: 'upload', bytes: 1e6, count: 6 },
    { type: 'download', bytes: 1e7, count: 6 }
];

class SpeedTestManager {
    private speedTest: SpeedTest | null = null;

    private readonly mainWindow: BrowserWindow | null;

    constructor(mainWindow: BrowserWindow | null) {
        this.mainWindow = mainWindow;
    }

    public initializeIpcEvents(): void {
        ipcMain.on('speed-test-command', (_, arg: any) => {
            switch (arg) {
                case 'play':
                    if (this.speedTest?.isFinished) {
                        this.speedTest.restart();
                    } else {
                        this.setupSpeedTest();
                        this.speedTest?.play();
                    }
                    break;
                case 'pause':
                    this.speedTest?.pause();
                    this.broadcastResults('paused');
                    break;
                case 'restart':
                    this.speedTest?.restart();
                    break;
                default:
                    break;
            }
        });
    }

    private setupSpeedTest() {
        if (this.speedTest == null) {
            this.speedTest = new SpeedTest({ autoStart: false, measurements: testMeasurements });

            this.speedTest.onResultsChange = () => this.broadcastResults('started');

            this.speedTest.onFinish = () => this.broadcastResults('finished');

            this.speedTest.onError = (error) => {
                log.error('Speed Test Error:', error);
            };
        }
    }

    private broadcastResults(event: string) {
        if (this.mainWindow) {
            this.mainWindow.webContents.send(
                'speed-test-results',
                event,
                this.speedTest?.results.getSummary()
            );
        }
    }
}

export default SpeedTestManager;
