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
    powerMonitor,
    BrowserWindowConstructorOptions,
    Event,
    NativeImage,
    MenuItemConstructorOptions
} from 'electron';
import path from 'path';
import fs from 'fs';
import settings from 'electron-settings';
import log from 'electron-log';
//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
//import debug from 'electron-debug';
import { rimrafSync } from 'rimraf';
import MenuBuilder from './menu';
import { exitTheApp, isDev, isDebug } from './lib/utils';
import { openDevToolsByDefault, openDevToolsInFullScreen, useCustomWindowXY } from './dxConfig';
import './ipc';
import { devPlayground } from './playground';
import { getOsInfo, logMetadata } from './ipcListeners/log';
import { customEvent } from './lib/customEvent';
import { getTranslate } from '../localization';
import { defaultSettings } from '../defaultSettings';
import { geoDBs } from './config';
import {
    appVersion,
    wpAssetPath,
    wpBinPath,
    sbAssetPath,
    sbBinPath,
    helperAssetPath,
    helperPath,
    versionFilePath,
    netStatsPath,
    netStatsAssetPath,
    singBoxManager,
    workingDirPath,
    dbAssetDirPath
} from '../constants';

const APP_TITLE = `Oblivion Desktop${isDev() ? ' ᴅᴇᴠ' : ''}`;
const WINDOW_DIMENSIONS = {
    width: 400,
    height: 650
};

interface WindowState {
    mainWindow: BrowserWindow | null;
    appIcon: Tray | null;
    connectionStatus: string;
    trayMenuEvent?: IpcMainEvent;
    userLang: string;
    appLang: ReturnType<typeof getTranslate>;
}

class OblivionDesktop {
    private state: WindowState = {
        mainWindow: null,
        appIcon: null,
        connectionStatus: 'disconnected',
        userLang: 'en',
        appLang: getTranslate('en')
    };

    constructor() {
        this.initialize().catch((err) => log.error('Initialization failed:', err));
    }

    private async initialize(): Promise<void> {
        if (!app.requestSingleInstanceLock()) {
            log.info('Instance already running.');
            app.exit(0);
            return;
        }

        await this.setupInitialConfiguration();
        this.setupIpcEvents();
        this.setupAppEvents();
    }

    private async setupInitialConfiguration(): Promise<void> {
        devPlayground();
        log.info('Creating new od instance...');
        const osInfo = await getOsInfo();
        logMetadata(osInfo);

        await this.handleVersionCheck();
        this.copyRequiredFiles();
    }

    private async handleVersionCheck(): Promise<void> {
        if (fs.existsSync(versionFilePath)) {
            const savedVersion = fs.readFileSync(versionFilePath, 'utf-8');
            if (savedVersion !== appVersion) {
                await singBoxManager.stopHelperOnStart();
                await this.cleanupOldFiles();
            }
        }
        fs.writeFileSync(versionFilePath, appVersion, 'utf-8');
    }

    private async cleanupOldFiles(): Promise<void> {
        const filesToClean = [wpBinPath, sbBinPath, helperPath, netStatsPath];
        filesToClean.forEach((file) => {
            if (fs.existsSync(file)) {
                rimrafSync(file);
            }
        });

        geoDBs.forEach((fileName) => {
            const dbPath = path.join(workingDirPath, fileName);
            if (fs.existsSync(dbPath)) {
                rimrafSync(dbPath);
            }
        });
    }

    private copyRequiredFiles(): void {
        const filePairs = [
            { src: wpAssetPath, dest: wpBinPath, name: 'wp' },
            { src: sbAssetPath, dest: sbBinPath, name: 'sb' },
            { src: helperAssetPath, dest: helperPath, name: 'helper' },
            { src: netStatsAssetPath, dest: netStatsPath, name: 'netStats' }
        ];

        filePairs.forEach(({ src, dest, name }) => {
            if (fs.existsSync(src) && !fs.existsSync(dest)) {
                fs.copyFile(src, dest, (err) => {
                    if (err) throw err;
                    log.info(`${name} binary was copied to userData directory.`);
                });
            } else if (!fs.existsSync(src)) {
                log.info(`Copy halted: ${name} file does not exist.`);
            }
        });

        geoDBs.forEach((fileName) => {
            const dbAssetPath = path.join(dbAssetDirPath, fileName);
            const dbWDPath = path.join(workingDirPath, fileName);
            if (fs.existsSync(dbAssetPath) && !fs.existsSync(dbWDPath)) {
                fs.copyFile(dbAssetPath, dbWDPath, (err) => {
                    if (err) throw err;
                    log.info(`${fileName} was copied to userData directory.`);
                });
            } else if (!fs.existsSync(dbAssetPath)) {
                log.info(`Copy halted: ${fileName} file does not exist.`);
            }
        });
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
            icon: this.getAssetPath('oblivion.png'),
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

        if (isDev() && useCustomWindowXY && !openDevToolsInFullScreen) {
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
            this.state.mainWindow?.show();
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
        });

        this.state.mainWindow.on('focus', () => this.registerQuitShortcut());

        this.state.mainWindow.on('blur', () => this.unregisterQuitShortcut());

        this.state.mainWindow.webContents.setWindowOpenHandler((e) => {
            shell.openExternal(e.url);
            return { action: 'deny' };
        });
    }

    private async handleWindowClose(e: Event): Promise<void> {
        e.preventDefault();
        const forceClose = await settings.get('forceClose');
        if (typeof forceClose === 'boolean' && forceClose) {
            try {
                await exitTheApp(this.state.mainWindow);
                app.exit(0);
            } catch (err) {
                log.error('Error while exiting the app:', err);
            }
        } else {
            this.state.mainWindow?.hide();
        }
    }

    private registerQuitShortcut(): void {
        const shortcut = process.platform === 'darwin' ? 'CommandOrControl+Q' : 'Ctrl+Q';
        globalShortcut.register(shortcut, async () => {
            await exitTheApp(this.state.mainWindow);
        });
    }

    private unregisterQuitShortcut(): void {
        const shortcut = process.platform === 'darwin' ? 'CommandOrControl+Q' : 'Ctrl+Q';
        globalShortcut.unregister(shortcut);
    }

    private setupIpcEvents(): void {
        ipcMain.on('tray-menu', (event) => {
            this.state.trayMenuEvent = event;
        });

        ipcMain.on('localization', async (_, newLang) => {
            this.state.userLang = newLang;
            this.state.appLang = getTranslate(this.state.userLang);
            this.updateTrayMenu();
            this.state.appIcon?.focus();
        });

        ipcMain.on('startup', async (_, newStatus) => {
            if (process.env.NODE_ENV !== 'development') {
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

        app.on('window-all-closed', async () => {
            await exitTheApp(this.state.mainWindow);
        });

        app.on('before-quit', async (event) => {
            this.state.connectionStatus = 'disconnected';
            if (process.platform === 'win32') {
                event.preventDefault();
                try {
                    await exitTheApp(this.state.mainWindow);
                    app.exit(0);
                } catch (error) {
                    log.error('Error while exiting the app:', error);
                    app.exit(1);
                }
            }
        });

        if (process.platform !== 'win32') {
            powerMonitor.on('shutdown', async (event: Event) => {
                event.preventDefault();
                try {
                    await exitTheApp(this.state.mainWindow);
                    app.quit();
                } catch {
                    app.quit();
                }
            });
        } else {
            app.on('session-end', async () => {
                try {
                    await exitTheApp(this.state.mainWindow);
                    app.quit();
                } catch {
                    app.quit();
                }
            });
        }

        app.setAsDefaultProtocolClient('oblivion');
        app.on('open-url', (event: Event) => {
            event.preventDefault();
            if (this.state.mainWindow) {
                this.state.mainWindow.show();
            }
        });
    }

    private async setupTray(): Promise<void> {
        this.state.userLang = String((await settings.get('lang')) || defaultSettings.lang);
        this.state.appLang = getTranslate(this.state.userLang);

        const trayIcon = this.createTrayIcon('disconnected');
        this.state.appIcon = new Tray(trayIcon);
        this.state.appIcon.setToolTip(APP_TITLE);
        this.state.appIcon.on('click', () => this.redirectTo(''));
        this.updateTrayMenu();
    }

    private createTrayIcon(status: string): NativeImage {
        const iconPath = this.getAssetPath(`img/status/${status}.png`);
        const icon = nativeImage.createFromPath(iconPath);
        if (icon.isEmpty()) log.error(`Failed to load trayIcon: ${iconPath}`);
        return process.platform !== 'win32' ? icon.resize({ width: 16, height: 16 }) : icon;
    }

    private updateTrayMenu(): void {
        if (!this.state.appIcon) return;

        const template = this.createTrayMenuTemplate();
        this.state.appIcon.setContextMenu(Menu.buildFromTemplate(template));
    }

    private createTrayMenuTemplate(): MenuItemConstructorOptions[] {
        const connectLabel = this.getConnectionLabel();
        const canToggleConnection = !(
            this.state.connectionStatus === 'disconnecting' ||
            this.state.connectionStatus === 'connecting'
        );

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
                click: () => this.handleConnectionToggle()
            },
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
                click: async () => {
                    await exitTheApp(this.state.mainWindow);
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
            if (route) {
                this.state.trayMenuEvent?.reply('tray-menu', {
                    key: 'changePage',
                    msg: route
                });
            }
        }
    }

    private async checkStartUp(): Promise<void> {
        if (process.env.NODE_ENV !== 'development') {
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

    public async handleAppReady(): Promise<void> {
        app.whenReady().then(async () => {
            await this.createWindow();
            await this.setupTray();
            await this.checkStartUp();
            await this.autoConnect();
            log.info('od is ready!');
        });
    }
}

const oblivionDesktop = new OblivionDesktop();
oblivionDesktop.handleAppReady().catch((error) => {
    log.error('Failed to start application:', error);
    process.exit(1);
});
