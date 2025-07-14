import {
    app,
    BrowserWindow,
    ipcMain,
    screen,
    shell,
    Menu,
    Tray,
    nativeImage,
    IpcMainEvent,
    globalShortcut,
    BrowserWindowConstructorOptions,
    Event,
    NativeImage,
    MenuItemConstructorOptions,
    dialog
} from 'electron';
import path from 'path';
import fs, { existsSync } from 'fs';
import settings from 'electron-settings';
import log from 'electron-log';
//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
//import debug from 'electron-debug';
import { rimrafSync } from 'rimraf';
import { spawn } from 'child_process';
import https from 'https';
import regeditModule, { RegistryPutItem, promisified as regedit } from 'regedit';
import { networkInterfaces } from 'systeminformation';
import MenuBuilder from './menu';
import { exitTheApp, isDev, isDebug } from './lib/utils';
import { openDevToolsByDefault, openDevToolsInFullScreen, useCustomWindowXY } from './dxConfig';
import './ipc';
import { devPlayground } from './playground';
import { getOsInfo, logMetadata } from './ipcListeners/log';
import { customEvent } from './lib/customEvent';
import { getTranslate } from '../localization';
import { defaultSettings } from '../defaultSettings';
import {
    appVersion,
    wpAssetPath,
    wpBinPath,
    helperAssetPath,
    helperPath,
    versionFilePath,
    netStatsPath,
    netStatsAssetPath,
    singBoxManager,
    downloadedPath,
    updaterPath,
    regeditVbsDirPath,
    windowPosition,
    proxyResetPath,
    proxyResetAssetPath,
    isWindows,
    isDarwin,
    isLinux,
    gtk4Paths
} from '../constants';
import packageJsonData from '../../package.json';

const APP_TITLE = `Oblivion Desktop${isDev() ? ' ᴅᴇᴠ' : ''}`;
const WINDOW_DIMENSIONS = {
    width: 400,
    height: 650
};

if (isLinux) {
    const hasGtk4 = gtk4Paths.some((p) => existsSync(p));
    if (!hasGtk4) {
        app.commandLine.appendSwitch('gtk-version', '3');
    }
    //app.commandLine.appendSwitch('no-sandbox');
}

process.on('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection occurred!');
    console.error('Reason:', reason ?? 'No reason provided');
    console.error('Promise:', promise);
    if (reason instanceof Error) {
        console.error(reason.stack);
    }
});

interface WindowState {
    mainWindow: BrowserWindow | null;
    appIcon: Tray | null;
    connectionStatus: string;
    trayMenuEvent?: IpcMainEvent;
    userLang: string;
    proxyMode: string | null;
    appLang: ReturnType<typeof getTranslate>;
    isFirstRun: boolean;
    hasNewUpdate: boolean;
}

class OblivionDesktop {
    private state: WindowState = {
        mainWindow: null,
        appIcon: null,
        connectionStatus: 'disconnected',
        userLang: 'en',
        proxyMode: null,
        appLang: getTranslate('en'),
        isFirstRun: false,
        hasNewUpdate: false
    };

    constructor() {
        this.initialize().catch((err) => log.error('Initialization failed:', err));
    }

    private async initialize(): Promise<void> {
        if (!app.requestSingleInstanceLock()) {
            /*if (!isDev()) {
                dialog.showMessageBox({
                    type: 'info',
                    title: APP_TITLE,
                    message: this.state.appLang.toast.exit_pending,
                    buttons: ['Ok']
                });
            }*/
            log.info('Instance already running.');
            app.exit(0);
            return;
        }

        await this.setupInitialConfiguration();
        this.setupIpcEvents();
        this.setupAppEvents();
        //this.handleShutdown();
    }

    private async setupInitialConfiguration(): Promise<void> {
        devPlayground();
        log.info('Creating new od instance...');
        this.state.proxyMode = (await settings.get('proxyMode')) as string;
        await this.handleVersionCheck();
        this.copyRequiredFiles();
    }

    private async handleVersionCheck(): Promise<void> {
        this.state.isFirstRun = false;
        try {
            const dirPath = path.dirname(versionFilePath);
            await fs.promises.mkdir(dirPath, { recursive: true });
            let savedVersion: string | null = null;
            try {
                await fs.promises.access(versionFilePath, fs.constants.F_OK);
                savedVersion = await fs.promises.readFile(versionFilePath, 'utf-8');
            } catch (readErr: any) {
                log.error('Version file not found or unreadable:', readErr.message);
            }
            if (savedVersion === null || savedVersion !== appVersion) {
                this.state.isFirstRun = true;
                await singBoxManager.stopHelperOnStart();
                await this.cleanupOldFiles();
            }
            try {
                await fs.promises.writeFile(versionFilePath, appVersion, 'utf-8');
            } catch (writeErr: any) {
                log.error('Failed to write version file:', writeErr.message);
                throw writeErr;
            }
        } catch (err) {
            this.state.isFirstRun = false;
            log.error('Error during version check:', err);
        }
    }

    private async cleanupOldFiles(): Promise<void> {
        const filesToClean = [wpBinPath, helperPath, netStatsPath];
        if (isWindows) {
            filesToClean.push(proxyResetPath);
        }
        filesToClean.forEach((file) => {
            if (fs.existsSync(file)) {
                rimrafSync(file);
            }
        });
    }

    private copyRequiredFiles(): void {
        const filePairs = [
            { src: wpAssetPath, dest: wpBinPath, name: 'wp' },
            { src: helperAssetPath, dest: helperPath, name: 'helper' },
            { src: netStatsAssetPath, dest: netStatsPath, name: 'netStats' }
        ];
        if (isWindows) {
            filePairs.push({ src: proxyResetAssetPath, dest: proxyResetPath, name: 'proxyReset' });
        }

        filePairs.forEach(({ src, dest, name }) => {
            if (fs.existsSync(src) && !fs.existsSync(dest)) {
                fs.copyFile(src, dest, (err) => {
                    if (err) {
                        log.error(`Error copying ${name} binary:`, err);
                        return;
                    }
                    log.info(`${name} binary was copied to userData directory.`);
                });
            } else if (!fs.existsSync(src)) {
                log.info(`Copy halted: ${name} file does not exist.`);
            }
        });
    }

    private getLastWindowPosition(): { x: number; y: number } | null {
        if (fs.existsSync(windowPosition)) {
            try {
                const positionData = fs.readFileSync(windowPosition, 'utf-8');
                const { x, y } = JSON.parse(positionData);
                return { x, y };
            } catch (err) {
                console.error('Error reading window position:', err);
            }
        }
        return null;
    }

    private saveWindowPosition(x: any, y: any) {
        const positionData = JSON.stringify({ x, y });
        fs.writeFileSync(windowPosition, positionData, 'utf-8');
    }

    private getValidWindowPosition(x: number, y: number): { x: number; y: number } | null {
        const displays = screen.getAllDisplays();
        const windowWidth = WINDOW_DIMENSIONS.width;
        const windowHeight = WINDOW_DIMENSIONS.height;
        const windowRect = {
            left: x,
            top: y,
            right: x + windowWidth,
            bottom: y + windowHeight
        };
        const MIN_VISIBLE_AREA = windowWidth * windowHeight * 0.3;
        const isVisibleEnough = displays.some((display) => {
            const bounds = display.workArea;
            const overlapWidth = Math.max(
                0,
                Math.min(windowRect.right, bounds.x + bounds.width) -
                    Math.max(windowRect.left, bounds.x)
            );
            const overlapHeight = Math.max(
                0,
                Math.min(windowRect.bottom, bounds.y + bounds.height) -
                    Math.max(windowRect.top, bounds.y)
            );
            const overlapArea = overlapWidth * overlapHeight;
            return overlapArea >= MIN_VISIBLE_AREA;
        });
        if (!isVisibleEnough) {
            return null;
        }
        return { x, y };
    }

    private createWindowConfig(): BrowserWindowConstructorOptions {
        const config: any = {
            title: APP_TITLE,
            show: false,
            width: WINDOW_DIMENSIONS.width,
            height: WINDOW_DIMENSIONS.height,
            autoHideMenuBar: true,
            transparent: false,
            center: true,
            frame: true,
            resizable: true,
            fullscreenable: true,
            icon: this.getAssetPath(packageJsonData.shortName + '.png'),
            webPreferences: {
                nativeWindowOpen: false,
                devTools: isDev(),
                devToolsKeyCombination: isDev(),
                contextIsolation: true,
                enableRemoteModule: false,
                preload: app.isPackaged
                    ? path.join(__dirname, 'preload.js')
                    : path.join(__dirname, '../../.erb/dll/preload.js')
            }
        };

        const lastPosition = this.getLastWindowPosition();
        if (lastPosition) {
            const validPosition = this.getValidWindowPosition(lastPosition.x, lastPosition.y);
            if (validPosition) {
                config.x = validPosition.x;
                config.y = validPosition.y;
                config.center = false;
            }
        } else if (isDev() && useCustomWindowXY && !openDevToolsInFullScreen) {
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width: displayWidth, height: displayHeight } = primaryDisplay.workAreaSize;
            config.x = displayWidth - WINDOW_DIMENSIONS.width - 60;
            config.y = displayHeight - WINDOW_DIMENSIONS.height - 160;
        }

        return config;
    }

    private getAssetPath(...paths: string[]): string {
        const RESOURCES_PATH = app.isPackaged
            ? path.join(process.resourcesPath, 'assets')
            : path.join(__dirname, '../../assets');
        return path.join(RESOURCES_PATH, ...paths);
    }

    private resolveHtmlPath(htmlFileName: string): string {
        if (isDev()) {
            const port = process.env.PORT || 1212;
            const url = new URL(`http://localhost:${port}`);
            url.pathname = htmlFileName;
            return url.href;
        }
        return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
    }

    private async createWindow(): Promise<void> {
        // we don't have this package installed. anything missing?
        // if (!isDev()) {
        //     const sourceMapSupport = require('source-map-support');
        //     sourceMapSupport.install();
        // }

        // seems we don't need this. check openDevTools method.
        // if (isDebug() && openDevToolsByDefault) {
        //     debug();
        // }

        /* if (isDebug()) {
            await this.installDevTools();
        } */

        const config = this.createWindowConfig();
        this.state.mainWindow = new BrowserWindow(config);
        this.state.mainWindow.on('move', () => {
            if (this.state.mainWindow) {
                const position = this.state.mainWindow.getBounds();
                this.saveWindowPosition(position.x, position.y);
            }
        });
        await this.setupWindowEvents();
        await this.state.mainWindow.loadURL(this.resolveHtmlPath('index.html'));

        const menuBuilder = new MenuBuilder(this.state.mainWindow);
        menuBuilder.buildMenu();
    }

    /* private async installDevTools(): Promise<void> {
        // we used import instead of require. everything ok?
        // const installer = require('electron-devtools-installer');
        // const extensions = ['REACT_DEVELOPER_TOOLS'];

        // await installer
        //    .default(
        //        extensions.map((name) => installer[name]),
        //        !!process.env.UPGRADE_EXTENSIONS
        //    )
        //    .catch((err: Error) => log.error('InstallDevTools Error:', err.message));

        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => log.info(`Added Extension:  ${name}`))
            .catch((err: Error) => log.error('InstallDevTools Error:', err.message));
    } */

    private openDevTools(): void {
        if (isDebug() && openDevToolsByDefault) {
            this.state.mainWindow?.webContents.openDevTools();
            if (openDevToolsInFullScreen) {
                this.state.mainWindow?.setFullScreen(true);
            }
        }
    }

    private async setupWindowEvents(): Promise<void> {
        if (!this.state.mainWindow) return;

        this.state.mainWindow.setMinimumSize(WINDOW_DIMENSIONS.width, WINDOW_DIMENSIONS.height);

        this.state.mainWindow.on('will-resize', (event) => {
            event.preventDefault();
        });

        this.state.mainWindow.on('ready-to-show', async () => {
            const startMinimized = await settings.get('startMinimized');
            if (typeof startMinimized === 'boolean' && startMinimized) {
                this.state.mainWindow?.hide();
                this.state.mainWindow?.setSkipTaskbar(true);
            } else {
                this.state.mainWindow?.show();
                this.state.mainWindow?.setSkipTaskbar(false);
            }
            this.openDevTools();
        });

        this.state.mainWindow.on('close', this.handleWindowClose.bind(this));

        this.state.mainWindow.on('closed', async () => {
            this.state.mainWindow = null;
        });

        this.state.mainWindow.on('leave-full-screen', async () => {
            this.state.mainWindow?.setSize(WINDOW_DIMENSIONS.width, WINDOW_DIMENSIONS.height);
            this.state.mainWindow?.center();
        });

        (this.state.mainWindow as any).on('minimize', async (e: Event) => {
            e.preventDefault();
            //this.state.mainWindow?.setSkipTaskbar(false);
        });

        this.state.mainWindow.on('focus', () => this.registerQuitShortcut());

        this.state.mainWindow.on('blur', () => this.unregisterQuitShortcut());

        this.state.mainWindow.webContents.setWindowOpenHandler((e) => {
            shell.openExternal(e.url);
            return { action: 'deny' };
        });
    }

    private async exitProcess() {
        try {
            this.state.connectionStatus = 'disconnecting';
            this.state.mainWindow?.hide();
            this.state.appIcon?.destroy();
            this.state.appIcon = null;
            await exitTheApp();
            this.state.connectionStatus = 'disconnected';
            app.quit();
        } catch (error) {
            log.error('Error while exiting the app:', error);
            app.exit(1);
        }
    }

    private async handleWindowClose(e: Event): Promise<void> {
        e.preventDefault();
        const forceClose = await settings.get('forceClose');
        if (typeof forceClose === 'boolean' && forceClose) {
            try {
                this.exitProcess();
            } catch (err) {
                log.error('Error while exiting the app:', err);
            }
        } else {
            this.state.mainWindow?.hide();
            /*if (isDarwin) {
                app?.dock?.hide();
            }*/
        }
    }

    private registerQuitShortcut(): void {
        const shortcut = isDarwin ? 'CommandOrControl+Q' : 'Ctrl+Q';
        globalShortcut.register(shortcut, async () => {
            this.exitProcess();
        });
    }

    private unregisterQuitShortcut(): void {
        const shortcut = isDarwin ? 'CommandOrControl+Q' : 'Ctrl+Q';
        globalShortcut.unregister(shortcut);
    }

    private setupIpcEvents(): void {
        ipcMain.on('tray-menu', (event) => {
            try {
                this.state.trayMenuEvent = event;
            } catch (err) {
                log.error('Error handling tray-menu event:', err);
            }
        });

        ipcMain.on('localization', async (_, newLang) => {
            this.state.userLang = newLang;
            this.state.appLang = getTranslate(this.state.userLang);
            this.updateTrayMenu();
            this.state.appIcon?.focus();
        });

        ipcMain.on('tray-state', async (event, value: any) => {
            if (!this.state.mainWindow) return;
            if ('proxyMode' in value) {
                this.state.proxyMode = value.proxyMode;
            }
            this.updateTrayMenu();
        });

        ipcMain.on('startup', async (_, newStatus) => {
            if (!isDev()) {
                app.setLoginItemSettings({
                    openAtLogin: newStatus
                });
            }
        });

        ipcMain.on('open-devtools', async () => {
            this.state.mainWindow?.webContents.openDevTools();
        });

        customEvent.on('tray-icon', (newStatus: string) => {
            if (!this.state.appIcon) return;
            if (newStatus.startsWith('connected') || newStatus === 'disconnected') {
                const newIcon = this.createTrayIcon(newStatus);
                this.state.appIcon.setImage(newIcon);
            }
            this.state.connectionStatus = newStatus;
            this.updateTrayMenu();
        });

        ipcMain.on('download-update', async (_event, latestVersion: string) => {
            if (!this.state.mainWindow) return;
            this.state.hasNewUpdate = true;
            customEvent.emit('tray-icon', this.state.connectionStatus);
            if (!isWindows) return;
            try {
                const result: any = await dialog.showMessageBox({
                    type: 'question',
                    title: APP_TITLE,
                    buttons: ['No', 'Yes'],
                    defaultId: 0,
                    message: this.state.appLang.toast.new_update
                });
                if (result.response === 1) {
                    const launchUpdater = (filePath: string) => {
                        setTimeout(() => {
                            const child = spawn(filePath, [], {
                                detached: true,
                                stdio: 'ignore'
                            });
                            child.unref();
                            log.info('✅ Updater executed successfully.');
                            this.exitProcess();
                        }, 2500);
                    };

                    if (fs.existsSync(updaterPath)) {
                        const updaterVersion = await settings.get('updaterVersion');
                        if (updaterVersion === latestVersion) {
                            launchUpdater(updaterPath);
                            return;
                        }
                    }

                    this.redirectTo('/');
                    this.state.mainWindow?.setProgressBar(0);
                    await this.downloadUpdate(
                        `https://github.com/${packageJsonData.build.publish.owner}/${packageJsonData.build.publish.repo}/releases/download/${latestVersion}/${packageJsonData.name}-${isWindows ? 'win' : ''}-${process.arch}.exe`,
                        (percent: any) => {
                            log.info(`Download: ${percent}%`);
                            this.state.mainWindow?.setProgressBar(percent / 100);
                        },
                        async () => {
                            log.info('Download completed!');
                            this.state.mainWindow?.setProgressBar(-1);
                            fs.copyFile(downloadedPath, updaterPath, (copyErr) => {
                                if (copyErr) {
                                    log.error('⚠️ Failed to copy updater file:', copyErr);
                                    return;
                                }
                                log.info(`✅ Updater copied successfully: ${updaterPath}`);
                                fs.rm(downloadedPath, { force: true }, (unlinkErr) => {
                                    if (unlinkErr) {
                                        log.warn(
                                            '⚠️ Could not delete old updater file:',
                                            unlinkErr
                                        );
                                    } else {
                                        log.info('✅ Old updater file deleted.');
                                    }
                                    settings.set('updaterVersion', latestVersion);
                                    launchUpdater(updaterPath);
                                });
                            });
                        }
                    );
                }
            } catch (err) {
                log.error('Error handling download-update event:', err);
            }
        });
    }

    private async downloadUpdate(
        url: string,
        onProgress: (percent: number) => void,
        onDone: () => void
    ) {
        const file = fs.createWriteStream(downloadedPath);
        let receivedBytes = 0;
        let totalBytes = 0;
        let lastUpdateTime = Date.now();
        const request = https.get(url, (response) => {
            if (
                response.statusCode &&
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {
                log.info(`Redirecting to: ${response.headers.location}`);
                return this.downloadUpdate(response.headers.location, onProgress, onDone);
            }
            totalBytes = parseInt(response.headers['content-length'] || '0', 10);
            if (!totalBytes) {
                log.warn('Warning: Content-Length header is missing or zero.');
                return;
            }
            response.pipe(file);
            response.on('data', (chunk) => {
                receivedBytes += chunk.length;
                const percent = totalBytes ? ((receivedBytes / totalBytes) * 100).toFixed(2) : '0';
                if (Date.now() - lastUpdateTime >= 1500) {
                    lastUpdateTime = Date.now();
                    onProgress(Number(percent));
                    this.state.mainWindow?.webContents.send('download-progress', {
                        status: 'pending',
                        percent: Number(percent)
                    });
                }
            });
            file.on('finish', () => {
                log.info('File stream finished, closing...');
                //this.onDownloadError();
                if (file && typeof file.close === 'function') {
                    file.close();
                } else {
                    log.warn(
                        'Tried to close file, but file is undefined or close is not a function'
                    );
                }
            });
            file.on('close', () => {
                fs.stat(downloadedPath, (err, stats) => {
                    if (err) {
                        log.error('File stat error:', err);
                        this.onDownloadError();
                        return;
                    }
                    if (stats.size === 0) {
                        log.error('Download failed: File size is 0 bytes.');
                        this.onDownloadError();
                        return;
                    }
                    log.info(`File successfully written to disk: ${downloadedPath}`);
                    setTimeout(() => {
                        onDone();
                    }, 2500);
                });
            });
            response.on('error', (err) => {
                log.error('Download error:', err);
                this.onDownloadError();
            });
            file.on('error', (err) => {
                log.error('File write error:', err);
                this.onDownloadError();
            });
        });
        request.on('error', (err) => {
            log.error('Request error:', err);
            this.onDownloadError();
        });
        request.end();
    }

    private onDownloadError() {
        this.state.mainWindow?.webContents.send('download-progress', {
            status: 'error',
            percent: 0
        });
        this.state.mainWindow?.setProgressBar(0);
    }

    private setupAppEvents(): void {
        app.on('second-instance', () => {
            if (this.state.mainWindow) {
                if (this.state.mainWindow.isMinimized()) {
                    this.state.mainWindow.restore();
                }
                this.state.mainWindow.focus();
            }
        });

        app.on('activate', () => {
            // On macOS, it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (this.state.mainWindow === null)
                this.createWindow().catch((err) => log.error('Create Window Error:', err));
        });

        let isQuitting = false;
        app.on('window-all-closed', async () => {
            if (!isQuitting) {
                isQuitting = true;
                await this.exitProcess();
                app.quit();
            }
        });

        process.on('SIGTERM', async () => {
            if (!isQuitting) {
                isQuitting = true;
                await this.exitProcess();
                app.quit();
            }
        });

        app.on('before-quit', async (event) => {
            if (!isQuitting) {
                event.preventDefault();
                isQuitting = true;
                await this.exitProcess();
                app.quit();
            }
        });

        app.on('will-quit', async (event) => {
            /*event.preventDefault();
            try {
                await this.exitProcess();
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
            app.exit(0);*/
        });

        /*app.on('session-end', async () => {
            await this.disableProxyQuickly();
        });

        app.on('quit', async () => {
            await this.disableProxyQuickly();
        });*/

        app.setAsDefaultProtocolClient(packageJsonData.shortName);
        app.on('open-url', (event: Event) => {
            event.preventDefault();
            if (this.state.mainWindow) {
                this.state.mainWindow.show();
            }
        });
    }

    private async setupTray(): Promise<void> {
        try {
            this.state.userLang = String((await settings.get('lang')) || defaultSettings.lang);
            this.state.appLang = getTranslate(this.state.userLang);

            this.state.connectionStatus = 'disconnected';
            const trayIcon = this.createTrayIcon('disconnected');

            this.state.appIcon = new Tray(trayIcon);
            this.state.appIcon.setToolTip(APP_TITLE);
            this.state.appIcon.on('click', () => {
                if (this.state.hasNewUpdate) {
                    this.state.hasNewUpdate = false;
                    customEvent.emit('tray-icon', this.state.connectionStatus);
                }
                this.redirectTo('');
            });
            /*this.state.appIcon.on('right-click', () => {
                this.state.appIcon?.popUpContextMenu();
            });*/
            this.updateTrayMenu();
        } catch (err) {
            log.error('Error setting up tray:', err);
        }
    }

    private createTrayIcon(status: string): NativeImage {
        const iconPath = this.getAssetPath(
            `img/status/${this.state.hasNewUpdate ? 'badge/' : ''}${status}.png`
        );
        const icon = nativeImage.createFromPath(iconPath);
        if (icon.isEmpty()) log.error(`Failed to load trayIcon: ${iconPath}`);
        return !isWindows ? icon.resize({ width: 16, height: 16 }) : icon;
    }

    private updateTrayMenu(): void {
        if (!this.state.appIcon) return;
        if (this.state.appIcon.isDestroyed()) return;
        try {
            const template = this.createTrayMenuTemplate();
            this.state.appIcon.setContextMenu(Menu.buildFromTemplate(template));
        } catch (err) {
            log.error('Error updating tray menu:', err);
        }
    }

    private createTrayMenuTemplate(): MenuItemConstructorOptions[] {
        const connectLabel = this.getConnectionLabel();
        const canToggleConnection = !(
            this.state.connectionStatus === 'disconnecting' ||
            this.state.connectionStatus === 'connecting'
        );

        const changeProxyMode = (value: string) => {
            if (!this.state.mainWindow) return;
            this.state.mainWindow.webContents.send('change-proxy-mode', value);
            //this.state.proxyMode = value;
            //this.updateTrayMenu();
            this.redirectTo('/network');
        };

        const proxyModeLabel = (mode: string): string => {
            const labels: Record<string, string> = {
                system: 'System proxy',
                tun: 'Tun'
            };
            const label = labels[mode] ?? 'None';
            const prefix = this.state.proxyMode === mode ? '✓  ' : '   ';
            return `${prefix}${label}`;
        };

        return [
            {
                label: APP_TITLE,
                type: 'normal',
                click: () => this.redirectTo('/')
            },
            { type: 'separator' },
            {
                id: 'connectToggle',
                label: connectLabel,
                type: 'normal',
                enabled: canToggleConnection,
                click: () => {
                    this.handleConnectionToggle();
                    this.state.connectionStatus =
                        this.state.connectionStatus === 'disconnected'
                            ? 'connecting'
                            : 'disconnecting';
                    this.updateTrayMenu();
                }
            },
            {
                id: 'proxyMode',
                label: this.state.appLang.settings.proxy_mode,
                enabled: this.state.connectionStatus === 'disconnected',
                submenu: [
                    {
                        label: proxyModeLabel('none'),
                        type: 'normal',
                        click: () => changeProxyMode('none')
                    },
                    {
                        label: proxyModeLabel('system'),
                        type: 'normal',
                        click: () => changeProxyMode('system')
                    },
                    {
                        label: proxyModeLabel('tun'),
                        type: 'normal',
                        click: () => changeProxyMode('tun')
                    }
                ]
            },
            { label: '', type: 'separator' },
            {
                label: this.state.appLang.systemTray.settings,
                submenu: [
                    {
                        label: this.state.appLang.systemTray.settings_warp,
                        type: 'normal',
                        click: () => {
                            this.redirectTo('/settings');
                        }
                    },
                    {
                        label: this.state.appLang.systemTray.settings_network,
                        type: 'normal',
                        click: () => {
                            this.redirectTo('/network');
                        }
                    },
                    {
                        label: this.state.appLang.systemTray.settings_scanner,
                        type: 'normal',
                        click: () => {
                            this.redirectTo('/scanner');
                        }
                    },
                    {
                        label: this.state.appLang.systemTray.settings_app,
                        type: 'normal',
                        click: () => {
                            this.redirectTo('/options');
                        }
                    }
                ]
            },
            { label: '', type: 'separator' },
            {
                label: this.state.appLang.systemTray.speed_test,
                type: 'normal',
                click: () => {
                    this.redirectTo('/speed');
                }
            },
            {
                label: this.state.appLang.systemTray.about,
                type: 'normal',
                click: () => {
                    this.redirectTo('/about');
                }
            },
            {
                label: this.state.appLang.systemTray.log,
                type: 'normal',
                click: () => {
                    this.redirectTo('/debug');
                }
            },
            { label: '', type: 'separator' },
            {
                label: this.state.appLang.systemTray.exit,
                click: () => {
                    this.exitProcess();
                }
            }
        ];
    }

    private getConnectionLabel(): string {
        const connectionStatus = this.state.connectionStatus.split('-')[0];

        const labels = {
            connected: `✓ ${this.state.appLang.systemTray.connected}`,
            disconnected: this.state.appLang.systemTray.connect,
            connecting: this.state.appLang.systemTray.connecting,
            disconnecting: this.state.appLang.systemTray.disconnecting
        };
        return labels[connectionStatus as keyof typeof labels] || labels.disconnected;
    }

    private handleConnectionToggle(): void {
        const isConnected = this.state.connectionStatus.startsWith('connected');
        const event = isConnected ? 'disconnect' : 'connect';
        this.state.trayMenuEvent?.reply('tray-menu', {
            key: event,
            msg: 'Connect Tray Click!'
        });
        this.redirectTo('/');
    }

    private redirectTo(route: string): void {
        if (!this.state.mainWindow) {
            this.createWindow().catch((err) => log.error('Create Window Error:', err));
        } else {
            this.state.mainWindow.show();
            this.state.mainWindow?.setSkipTaskbar(false);
            /*if (isDarwin) {
                app?.dock?.show();
            }*/
            if (route) {
                this.state.trayMenuEvent?.reply('tray-menu', {
                    key: 'changePage',
                    msg: route
                });
            }
        }
    }

    private async checkStartUp(): Promise<void> {
        if (isDev()) return;
        const checkOpenAtLogin = await settings.get('openAtLogin');
        const loginItemSettings = app.getLoginItemSettings();

        if (
            typeof checkOpenAtLogin === 'boolean' &&
            checkOpenAtLogin &&
            !loginItemSettings.openAtLogin
        ) {
            app.setLoginItemSettings({
                openAtLogin: true
            });
        }
    }

    private async autoConnect(): Promise<void> {
        if (isDev()) return;

        const checkAutoConnect = await settings.get('autoConnect');
        if (typeof checkAutoConnect === 'boolean' && checkAutoConnect) {
            this.state.trayMenuEvent?.reply('tray-menu', {
                key: 'connect',
                msg: 'Connect Tray Click!'
            });
        }
    }

    private async setupMetaData(): Promise<void> {
        const osInfo = await getOsInfo();
        logMetadata(osInfo);
    }

    /*private async exitStrategy(): Promise<void> {
        try {
            if (isWindows) {
                const { systemEvents } = require('electron');
                systemEvents.on('session-end', async () => {
                    return new Promise<void>((resolve) => {
                        setTimeout(() => {
                            this.exitProcess();
                            resolve();
                        }, 1000);
                    });
                });
            }
        } catch (error) {
            log.error('Error setting up shutdown handlers:', error);
        }
    }*/

    /*private async disableProxyQuickly(): Promise<void> {
        if (!isWindows) return;
        try {
            const registryPath =
                'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings';
            const proxySettings: RegistryPutItem = {
                ProxyServer: { type: 'REG_SZ', value: '' },
                ProxyOverride: { type: 'REG_SZ', value: '' },
                AutoConfigURL: { type: 'REG_SZ', value: '' },
                ProxyEnable: { type: 'REG_DWORD', value: 0 }
            };
            regeditModule.setExternalVBSLocation(regeditVbsDirPath);
            await regedit.putValue({ [registryPath]: proxySettings });
        } catch (error) {
            log.error(`Error while disabling system proxy: ${error}`);
        }
    }*/

    private async registerStartupProxyReset(): Promise<void> {
        if (!isWindows) return;
        const appPath = `"${proxyResetPath}"`;
        const registryPath = `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`;
        const valueName = 'OblivionProxyReset';
        try {
            regeditModule.setExternalVBSLocation(regeditVbsDirPath);
            const result = await regedit.list([registryPath]);
            const existingValue = result[registryPath]?.values?.[valueName]?.value;
            if (existingValue === appPath) {
                //log.info('Proxy reset script already registered in startup.');
                return;
            }
            const values: RegistryPutItem = {
                [valueName]: {
                    value: appPath,
                    type: 'REG_SZ'
                }
            };
            await regedit.putValue({ [registryPath]: values });
            log.info('Proxy reset script registered in startup.');
        } catch (err) {
            console.error('Failed to register proxy reset:', err);
        }
    }

    private async getNetworkList() {
        const netData = await networkInterfaces();
        const interfaces = Array.isArray(netData) ? netData : netData ? [netData] : [];
        const getList = interfaces
            .filter((i) => i.ip4 && !i.internal && !i.ip4.startsWith('169.254.'))
            .map((i) => i.ip4);
        await settings.set('networkList', JSON.stringify(getList));
        return getList;
    }

    private sleep(ms: number): Promise<void> {
        // eslint-disable-next-line no-promise-executor-return
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public async handleAppReady(): Promise<void> {
        app.whenReady().then(async () => {
            try {
                await this.createWindow();
                if (this.state.isFirstRun) {
                    this.state.isFirstRun = false;
                    app.relaunch();
                    await this.sleep(1500);
                    app.exit(0);
                    return;
                }
                await this.setupTray();
                await this.checkStartUp();
                await this.autoConnect();
                await this.setupMetaData();
                await this.getNetworkList();
                //await this.exitStrategy();
                await this.registerStartupProxyReset();
                log.info('od is ready!');
            } catch (error) {
                log.error('Error during app ready handling:', error);
            }
        });
    }
}

const oblivionDesktop = new OblivionDesktop();
oblivionDesktop.handleAppReady().catch((error) => {
    log.error('Failed to start application:', error);
    process.exit(1);
});
