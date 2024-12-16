import { IpcMainEvent, ipcMain } from 'electron';
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

    private event: IpcMainEvent | null = null;

    constructor() {
        this.initializeIpcEvents();
    }

    public initializeIpcEvents(): void {
        ipcMain.on('speed-test', (event, command: string) => {
            if (!this.event) {
                this.event = event;
            }
            switch (command) {
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
        if (!this.speedTest) {
            this.speedTest = new SpeedTest({ autoStart: false, measurements: testMeasurements });

            this.speedTest.onResultsChange = () => this.broadcastResults('started');

            this.speedTest.onFinish = () => this.broadcastResults('finished');

            this.speedTest.onError = (error) => {
                log.error('Speed Test Error:', error);
            };
        }
    }

    private broadcastResults(status: string) {
        this.event?.reply('speed-test', status, this.speedTest?.results.getSummary());
    }
}

export default SpeedTestManager;
