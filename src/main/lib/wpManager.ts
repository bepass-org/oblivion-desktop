import { app, ipcMain, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import toast from 'react-hot-toast';
import treeKill from 'tree-kill';
import settings from 'electron-settings';
import log from 'electron-log';
import fs from 'fs';
import { isDev, removeFileIfExists, shouldProxySystem } from './utils';
import { disableProxy as disableSystemProxy, enableProxy as enableSystemProxy } from './proxy';
import { getOsInfo, logMetadata } from '../ipcListeners/log';
import { getUserSettings, handleWpErrors } from './wpHelper';
import { defaultSettings } from '../../defaultSettings';
import { customEvent } from './customEvent';
import { showWpLogs } from '../dxConfig';
import { getTranslate } from '../../localization';
import {
    wpAssetPath,
    wpBinPath,
    workingDirPath,
    regeditVbsDirPath,
    singBoxManager,
    netStatsManager,
    logPath
} from '../../constants';

// Types and Enums
enum ConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    DISCONNECTING
}

interface WarpPlusState {
    child: ChildProcess | null;
    exitOnWpEnd: boolean;
    appLang: ReturnType<typeof getTranslate>;
    // eslint-disable-next-line no-undef
    event?: Electron.IpcMainEvent;
    shouldStartSingBox: boolean;
    shouldStopSingBox: boolean;
    connectionState: ConnectionState;
    settings: {
        proxyMode: string;
        port: number;
        hostIP: string;
        ipData: boolean;
        dataUsage: boolean;
        restartCounter: number;
    };
}

// Constants
const endpointRegex =
    /msg="(?:scan results|using warp endpoints)" endpoints="\[.*?(?:AddrPort:)?(\d{1,3}(?:\.\d{1,3}){3}:\d{1,5})/;
const MAX_RETRIES = 2;
const SUCCESS_MSG_PREFIX = 'level=INFO msg="serving proxy" address=';

// State management
const state: WarpPlusState = {
    child: null,
    exitOnWpEnd: false,
    appLang: getTranslate('en'),
    shouldStartSingBox: true,
    shouldStopSingBox: true,
    connectionState: ConnectionState.DISCONNECTED,
    settings: { ...defaultSettings }
};

// Logger configuration
const simpleLog = log.create({ logId: 'simpleLog' });
simpleLog.transports.console.format = '{text}';
simpleLog.transports.file.format = '{text}';

class WarpPlusManager {
    //Public-Methods
    static restartApp() {
        let retryCount = 0;

        const attemptRestart = () => {
            try {
                BrowserWindow.getAllWindows().forEach((win) => {
                    if (!win.isDestroyed()) win.close();
                });

                log.info('Relaunching app due to warp-plus error.');
                app.relaunch();
                app.quit();
            } catch (error) {
                retryCount++;
                log.error(`Error during app restart (attempt ${retryCount}):`, error);

                if (retryCount < MAX_RETRIES) {
                    log.info('Retrying app quit...');
                    setTimeout(attemptRestart, 1500);
                } else {
                    log.error('Max retry limit reached. Could not restart app.');
                }
            }
        };

        setTimeout(attemptRestart, 5000);
    }

    static async handleSystemProxy(enable: boolean) {
        if (!shouldProxySystem(state.settings.proxyMode)) {
            state.connectionState = enable
                ? ConnectionState.CONNECTING
                : ConnectionState.DISCONNECTED;
            return this.sendConnectionSignal();
        }

        try {
            const proxyFunc = enable ? enableSystemProxy : disableSystemProxy;
            await proxyFunc(regeditVbsDirPath, state.event);
            state.connectionState = enable
                ? ConnectionState.CONNECTING
                : ConnectionState.DISCONNECTING;
            this.sendConnectionSignal();
        } catch (error) {
            log.error('Error managing system proxy:', error);
            if (enable) await this.handleSystemProxy(false);
        }
    }

    static async startWarpPlus() {
        if (!fs.existsSync(wpBinPath)) {
            state.event?.reply('guide-toast', state.appLang.log.error_wp_not_found);
            state.event?.reply('wp-end', true);

            if (fs.existsSync(wpAssetPath) && state.settings.restartCounter < 2) {
                await settings.set('restartCounter', state.settings.restartCounter + 1);
                this.restartApp();
            }
            return;
        }

        try {
            const args = await getUserSettings();
            log.info('Starting WarpPlus process...');
            log.info(`${wpBinPath} ${args.join(' ')}`);
            state.child = spawn(wpBinPath, args, { cwd: workingDirPath });
            this.setupChildProcessHandlers();
        } catch (error) {
            log.error('Error starting WarpPlus:', error);
            this.handleStartupError();
        }
    }

    static killChild() {
        if (state.child?.pid) {
            treeKill(state.child.pid, 'SIGKILL');
        }
    }

    //Private-Methods
    private static sendConnectionSignal() {
        // eslint-disable-next-line default-case
        switch (state.connectionState) {
            case ConnectionState.CONNECTING:
                customEvent.emit('tray-icon', 'connecting');
                break;

            case ConnectionState.DISCONNECTING:
                customEvent.emit('tray-icon', 'connecting');
                break;

            case ConnectionState.CONNECTED:
                state.event?.reply('wp-start', true);
                customEvent.emit('tray-icon', `connected-${state.settings.proxyMode}`);
                toast.remove('GUIDE');

                if (
                    state.settings.ipData &&
                    state.settings.dataUsage &&
                    state.settings.proxyMode !== 'none'
                ) {
                    netStatsManager.startMonitoring(state.event);
                }
                break;

            case ConnectionState.DISCONNECTED:
                netStatsManager.stopMonitoring();
                state.event?.reply('wp-end', true);

                if (state.exitOnWpEnd) ipcMain.emit('exit');
                customEvent.emit('tray-icon', 'disconnected');
                break;
        }
    }

    private static setupChildProcessHandlers() {
        if (!state.child) return;

        state.child.stdout?.on('data', async (data: Buffer) => {
            const strData = data.toString();

            if (strData.includes(`${SUCCESS_MSG_PREFIX}${state.settings.hostIP}`)) {
                await this.handleSuccessMessage();
            }

            await this.handleEndpointUpdates(strData);
            handleWpErrors(strData, String(state.settings.port), state.event);

            if (showWpLogs || isDev()) {
                simpleLog.info(strData);
            }
        });

        state.child.stderr?.on('data', (err: Buffer) => {
            if (showWpLogs || isDev()) {
                simpleLog.error(`WarpPlus error: ${err.toString()}`);
            }
        });

        state.child.on('exit', () => this.handleChildExit());
    }

    private static async handleSuccessMessage() {
        if (state.settings.proxyMode === 'tun' && !(await singBoxManager.checkConnectionStatus())) {
            state.event?.reply('wp-end', true);
            this.killChild();
        } else {
            state.connectionState = ConnectionState.CONNECTED;
            this.sendConnectionSignal();
            await settings.set('restartCounter', 0);
        }
    }

    private static async handleEndpointUpdates(strData: string) {
        const endpointMatch = strData.match(endpointRegex);
        if (endpointMatch) {
            await settings.set('scanResult', endpointMatch[1]);
        }
    }

    private static async handleChildExit() {
        if (
            state.settings.proxyMode === 'tun' &&
            state.shouldStopSingBox &&
            !(await singBoxManager.stopSingBox())
        ) {
            state.event?.reply('wp-end', false);
        } else {
            await this.handleSystemProxy(false);
            state.connectionState = ConnectionState.DISCONNECTED;
            this.sendConnectionSignal();
            log.info('WarpPlus process exited.');
            state.child = null;
        }
    }

    private static handleStartupError() {
        state.event?.reply('guide-toast', state.appLang.log.error_wp_stopped);
        state.event?.reply('wp-end', true);

        if (fs.existsSync(wpBinPath)) {
            fs.rm(wpBinPath, (err) => {
                if (err) throw err;
                log.info('Deleted corrupt WarpPlus binary. Restarting app...');
                this.restartApp();
            });
        }
    }
}

// IPC Handlers
ipcMain.on('wp-start', async (event, arg) => {
    state.shouldStartSingBox = arg !== 'start-from-gool';
    state.exitOnWpEnd = false;
    state.event = event;

    const settingsValues = settings.getSync();
    state.appLang = getTranslate(String(settingsValues?.lang || defaultSettings.lang));
    state.settings = {
        proxyMode: String(settingsValues.proxyMode || defaultSettings.proxyMode),
        port: Number(settingsValues.port || defaultSettings.port),
        hostIP: String(settingsValues.hostIP || defaultSettings.hostIP),
        ipData: Boolean(settingsValues.ipData || defaultSettings.ipData),
        dataUsage: Boolean(settingsValues.dataUsage || defaultSettings.dataUsage),
        restartCounter: Number(settingsValues.restartCounter || defaultSettings.restartCounter)
    };

    await removeFileIfExists(logPath);
    log.info('Deleted past logs for new connection.');
    const osInfo = await getOsInfo();
    logMetadata(osInfo);

    await WarpPlusManager.handleSystemProxy(true);

    if (
        state.settings.proxyMode === 'tun' &&
        state.shouldStartSingBox &&
        !(await singBoxManager.startSingBox(state.appLang, event))
    ) {
        event.reply('wp-end', true);
        WarpPlusManager.killChild();
    } else {
        await WarpPlusManager.startWarpPlus();
    }
});

ipcMain.on('wp-end', async (event, arg) => {
    state.shouldStopSingBox = arg !== 'stop-from-gool';
    try {
        WarpPlusManager.killChild();
    } catch (error) {
        log.error('Error killing WarpPlus:', error);
        event.reply('wp-end', false);
    }
});

ipcMain.on('end-wp-and-exit-app', async (event) => {
    const closeHelper = (await settings.get('closeHelper')) ?? defaultSettings.closeHelper;

    try {
        if (state.child?.pid) {
            state.exitOnWpEnd = true;
            WarpPlusManager.killChild();
        } else {
            ipcMain.emit('exit');
        }

        if (closeHelper) {
            await singBoxManager.stopHelper();
        }
    } catch (error) {
        log.error('Error exiting app:', error);
        event.reply('wp-end', false);
    }
});

export default WarpPlusManager;
