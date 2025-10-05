import { app, ipcMain, BrowserWindow, dialog, shell } from 'electron';
import { spawn, ChildProcess, execSync, execFile } from 'child_process';
import toast from 'react-hot-toast';
import treeKill from 'tree-kill';
import settings from 'electron-settings';
import log from 'electron-log';
import fs from 'fs';
import sound from 'sound-play';
import Aplay from 'node-aplay';
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
    logPath,
    isLinux,
    soundEffect,
    isWindows,
    exclusionsPath,
    mpPath,
    mpAssetPath,
    usquePath,
    usqueAssetPath
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
    shouldApplySystemProxy: boolean;
    connectionState: ConnectionState;
    settings: {
        proxyMode: string;
        port: number;
        hostIP: string;
        ipData: boolean;
        dataUsage: boolean;
        restartCounter: number;
        soundEffect: boolean;
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
    shouldApplySystemProxy: true,
    connectionState: ConnectionState.DISCONNECTED,
    settings: { ...defaultSettings }
};

// Logger configuration
const simpleLog = log.create({ logId: 'simpleLog' });
simpleLog.transports.console.format = '{text}';
simpleLog.transports.file.format = '{text}';

class WarpPlusManager {
    //Public-Methods
    static restartApp(delay = 5000) {
        let retryCount = 0;
        const attemptRestart = async () => {
            try {
                BrowserWindow.getAllWindows().forEach((win) => {
                    if (!win.isDestroyed()) win.destroy();
                });
                log.info('Relaunching app due to warp-plus error.');
                app.relaunch();
                app.exit(0);
            } catch (error) {
                retryCount++;
                log.error(`Error during app restart (attempt ${retryCount}):`, error);
                if (retryCount < MAX_RETRIES) {
                    log.info('Retrying app quit...');
                    setTimeout(attemptRestart, 3000);
                } else {
                    log.error('Max retry limit reached. Could not restart app.');
                }
            }
        };
        setTimeout(attemptRestart, delay);
    }

    private static getWinDrive() {
        try {
            const drive = execSync('powershell -Command "$env:SystemDrive"', {
                encoding: 'utf8'
            }).trim();
            return drive || 'C:\\';
        } catch (error) {
            return 'C:\\';
        }
    }

    static async addToExclusions() {
        const exclusionPaths = [
            wpAssetPath,
            wpBinPath,
            mpAssetPath,
            mpPath,
            usqueAssetPath,
            usquePath
        ];
        const result: any = await dialog.showMessageBox({
            type: 'question',
            buttons: ['No', 'Yes', 'View Guide'],
            defaultId: 1,
            title: 'Add to Exceptions',
            message: state.appLang.log.error_wp_exclusions
        });
        if (typeof result.response === 'number') {
            if (result.response === 0) {
                this.restartApp(1000);
                return;
            }
            if (result.response === 2) {
                try {
                    await shell.openExternal(
                        'https://github.com/bepass-org/oblivion-desktop/wiki/The-warp-plus-file-is-not-found'
                    );
                } catch (err) {
                    log.error('Failed to open link:', (err as Error).message || err);
                }
                this.restartApp();
                return;
            }
        }
        const windowsDrive = this.getWinDrive();
        const defenderCommands = exclusionPaths
            .map((p) => `powershell -Command "Add-MpPreference -ExclusionPath '${p}'"`)
            .join('\n');
        const bitdefenderCommands = exclusionPaths
            .map(
                (p) =>
                    `"${windowsDrive}\\Program Files\\Bitdefender\\Bitdefender Security\\bdagent.exe" /addexclusion "${p}"`
            )
            .join('\n');
        const batContent = `@echo off
            chcp 65001 >nul
            set win_drive=${windowsDrive}
            :: Define color codes
            set COLOR_GREEN=powershell -NoProfile -Command "Write-Host '[Success]' -ForegroundColor Green"
            set COLOR_RED=powershell -NoProfile -Command "Write-Host '[Error]' -ForegroundColor Red"
            set COLOR_RESET=REM
            :: Check for admin privileges
            net session >nul 2>&1
            if %errorLevel% neq 0 (
                powershell -Command "Start-Process '%~f0' -Verb RunAs"
                exit /b
            )
            %COLOR_GREEN% Running with administrator privileges.
            :: === Windows Defender Check ===
            powershell -Command "Get-MpComputerStatus" >nul 2>&1
            if %errorLevel% neq 0 (
                set defender_missing=1
            ) else (
                ${defenderCommands}
                %COLOR_GREEN% Windows Defender exclusions added.
                timeout /t 3 >nul
            )
            :: === Bitdefender Check ===
            if exist "%win_drive%\\Program Files\\Bitdefender\\Bitdefender Security\\bdagent.exe" (
                ${bitdefenderCommands}
                %COLOR_GREEN% Bitdefender exclusions added.
                timeout /t 3 >nul
            ) else (
                set bitdefender_missing=1
            )
            :: Exit if both security programs are missing
            if defined defender_missing if defined bitdefender_missing (
                %COLOR_RED% No compatible antivirus found. Exiting ...
                timeout /t 3 >nul
                exit /b
            )
        exit`;
        fs.writeFileSync(exclusionsPath, batContent, { encoding: 'utf8' });
        const process = execFile(
            'powershell',
            ['-Command', `Start-Process '${exclusionsPath}' -Verb RunAs -Wait`],
            (err) => {
                if (err) {
                    log.error('⚠️ Failed to execute exclusion script:', err);
                    this.restartApp(1500);
                }
            }
        );
        process.on('close', (code) => {
            if (code !== 0) {
                log.error(`❌ Script exited with code ${code}`);
            }
            if (fs.existsSync(exclusionsPath)) {
                fs.rm(exclusionsPath, { force: true }, (unlinkErr) => {
                    log.warn('⚠️ Could not delete exclusionsPath file:', unlinkErr);
                });
            }
            this.restartApp(1500);
        });
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
            state.event?.reply('wp-end', true);
            if (enable) await this.handleSystemProxy(false);
        }
    }

    static async handleMissingFile(assetPath: string, errorMsg: string) {
        state.event?.reply('guide-toast', errorMsg);
        state.event?.reply('wp-end', true);
        if (fs.existsSync(assetPath) && state.settings.restartCounter < 2) {
            await settings.setSync('restartCounter', state.settings.restartCounter + 1);
            if (isWindows) {
                this.addToExclusions();
            } else {
                this.restartApp();
            }
        }
        return true;
    }

    static async startWarpPlus() {
        const method = (await settings.get('method')) || defaultSettings.method;
        if (method === 'masque') {
            if (!fs.existsSync(mpPath)) {
                if (await this.handleMissingFile(mpAssetPath, state.appLang.log.error_mp_not_found))
                    return;
            }
            if (!fs.existsSync(usquePath)) {
                if (
                    await this.handleMissingFile(
                        usqueAssetPath,
                        state.appLang.log.error_usque_not_found
                    )
                )
                    return;
            }
        } else {
            if (!fs.existsSync(wpBinPath)) {
                if (await this.handleMissingFile(wpAssetPath, state.appLang.log.error_wp_not_found))
                    return;
            }
        }

        try {
            const args = await getUserSettings();
            if (method === 'masque') {
                log.info('Starting MasquePlus process ...');
                log.info(`${mpPath} ${args.join(' ')}`);
                state.child = spawn(mpPath, args, { cwd: workingDirPath });
            } else {
                log.info('Starting WarpPlus process ...');
                log.info(`${wpBinPath} ${args.join(' ')}`);
                state.child = spawn(wpBinPath, args, { cwd: workingDirPath });
            }
            this.setupChildProcessHandlers();
        } catch (error) {
            log.error('Error while starting Core:', error);
            this.handleStartupError();
        }
    }

    static killChild() {
        if (state.child?.pid) {
            treeKill(state.child.pid, 'SIGKILL');
        }
    }

    private static playSoundEffect() {
        if (!state.settings.soundEffect) return;
        try {
            if (isLinux) {
                const music = new Aplay(soundEffect);
                music.play();
            } else {
                sound.play(soundEffect);
            }
        } catch (error) {
            console.error('Error playing sound:', error);
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
                customEvent.emit('tray-icon', 'disconnecting');
                break;

            case ConnectionState.CONNECTED:
                state.event?.reply('wp-start', true);
                customEvent.emit('tray-icon', `connected-${state.settings.proxyMode}`);
                this.playSoundEffect();
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
            await settings.setSync('restartCounter', 0);
        }
    }

    private static async handleEndpointUpdates(strData: string) {
        const endpointMatch = strData.match(endpointRegex);
        if (endpointMatch) {
            await settings.setSync('scanResult', endpointMatch[1]);
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
            if (!state.shouldApplySystemProxy) {
                log.info(
                    'The commands to disable and then re-enable the systemProxy were skipped, which occurred under conditions where the location had reverted from the gool method to Iran.'
                );
            } else {
                await this.handleSystemProxy(false);
            }
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
        restartCounter: Number(settingsValues.restartCounter || defaultSettings.restartCounter),
        soundEffect: Boolean(settingsValues.soundEffect || defaultSettings.soundEffect)
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
    state.shouldApplySystemProxy = arg !== 'stop-from-gool';
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
