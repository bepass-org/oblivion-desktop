/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, ipcMain, screen, shell, Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import settings from 'electron-settings';
import log from 'electron-log';
import MenuBuilder from './menu';
import { isDev } from './lib/utils';
import { openDevToolsByDefault, useCustomWindowXY } from './dxConfig';
import { disableProxy } from './lib/proxy';
import './ipc';
import { wpAssetPath, wpBinPath } from './ipcListeners/wp';

let mainWindow: BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    log.info("did'nt create new instance since there was already one running.");
    app.exit(0);
} else {
    log.info('creating new oblivion desktop instance...');
    (async () => {
        log.info(`exe: ${app.getPath('exe')}`);
        log.info(`userData: ${app.getPath('userData')}`);
        log.info(`logs: ${app.getPath('logs')}`);
    })();

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // coping wp binary from assets dir to userData dir so it can run without sudo/administrator privilege
    fs.copyFile(wpAssetPath, wpBinPath, (err) => {
        if (err) throw err;
        log.info('wp binary was copied to userData directory.');
    });

    if (process.env.NODE_ENV === 'production') {
        const sourceMapSupport = require('source-map-support');
        sourceMapSupport.install();
    }

    const resolveHtmlPath = (htmlFileName: string) => {
        if (process.env.NODE_ENV === 'development') {
            const port = process.env.PORT || 1212;
            const url = new URL(`http://localhost:${port}`);
            url.pathname = htmlFileName;
            return url.href;
        }
        return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
    };

    const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    if (isDebug && openDevToolsByDefault) {
        require('electron-debug')();
    }

    const installExtensions = async () => {
        const installer = require('electron-devtools-installer');
        const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        const extensions = ['REACT_DEVELOPER_TOOLS'];

        return installer
            .default(
                extensions.map((name) => installer[name]),
                forceDownload
            )
            .catch(console.log);
    };

    const createWindow = async () => {
        if (isDebug) {
            await installExtensions();
        }

        const RESOURCES_PATH = app.isPackaged
            ? path.join(process.resourcesPath, 'assets')
            : path.join(__dirname, '../../assets');

        const getAssetPath = (...paths: string[]): string => {
            return path.join(RESOURCES_PATH, ...paths);
        };

        const windowWidth = 400;
        const windowHeight = 650;

        const config: any = {
            show: false,
            width: windowWidth,
            height: windowHeight,
            enableRemoteModule: true,
            autoHideMenuBar: true,
            transparent: false,
            center: true,
            frame: true,
            resizable: false,
            fullscreenable: false,
            icon: getAssetPath('oblivion.png'),
            webPreferences: {
                nativeWindowOpen: false,
                devTools: false,
                devToolsKeyCombination: false,
                preload: app.isPackaged
                    ? path.join(__dirname, 'preload.js')
                    : path.join(__dirname, '../../.erb/dll/preload.js')
            }
        };

        if (isDev()) {
            const primaryDisplay = screen.getPrimaryDisplay();
            const displayWidth = primaryDisplay.workAreaSize.width;
            const displayHeight = primaryDisplay.workAreaSize.height;
            if (useCustomWindowXY) {
                config.x = displayWidth - windowWidth - 60;
                config.y = displayHeight - windowHeight - 160;
            }
            config.webPreferences.devTools = true;
            config.webPreferences.devToolsKeyCombination = true;
        }

        let canOpenFromSystem = true;

        function createMainWindow() {
            if (!mainWindow) {
                mainWindow = new BrowserWindow(config);

                mainWindow.loadURL(resolveHtmlPath('index.html'));

                mainWindow.on('ready-to-show', async () => {
                    if (!mainWindow) {
                        throw new Error('"mainWindow" is not defined');
                    }
                    // await settings.get('systemTray')
                    if (process.env.START_MINIMIZED) {
                        mainWindow.minimize();
                    } else {
                        mainWindow.show();
                    }
                });

                ipcMain.on('open-devtools', async () => {
                    // TODO add toggle
                    mainWindow?.webContents.openDevTools();
                    // mainWindow.webContents.closeDevTools();
                });

                mainWindow.on('close', () => {
                    canOpenFromSystem = false;
                });

                mainWindow.on('closed', async () => {
                    await disableProxy();
                    mainWindow = null;
                });

                mainWindow.on('minimize', async (e: any) => {
                    e.preventDefault();
                    if (await settings.get('systemTray')) {
                        mainWindow?.hide();
                    }
                });

                const menuBuilder = new MenuBuilder(mainWindow);
                menuBuilder.buildMenu();

                // Open urls in the user's browser
                mainWindow.webContents.setWindowOpenHandler((e) => {
                    shell.openExternal(e.url);
                    return { action: 'deny' };
                });
            } else {
                mainWindow.show();
            }
        }

        createMainWindow();

        let appIcon = null;
        app?.whenReady().then(() => {
            const nativeImageIcon = nativeImage.createFromPath(getAssetPath('oblivion.png'));
            const resizedIcon = nativeImageIcon.resize({ width: 16, height: 16 }); // Resize icon for macOS tray compatibility
            appIcon = new Tray(resizedIcon);
            appIcon.on('click', () => {
                if (canOpenFromSystem) {
                    if (!mainWindow) {
                        createMainWindow();
                    } else {
                        mainWindow.show();
                    }
                }
            });
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: 'Oblivion Desktop',
                    type: 'normal',
                    click: () => {
                        if (!mainWindow) {
                            createMainWindow();
                        } else {
                            mainWindow.show();
                        }
                    }
                },
                // TODO
                /*{ label: '', type: 'separator' },
            {
                label: 'حالت پروکسی',
                submenu: [
                    { label: 'متصل است', type: 'radio' },
                    { label: 'عدم اتصال', type: 'radio' }
                ]
            },
            { label: '', type: 'separator' },
            {
                label: 'Proxy Mode',
                submenu: [
                    {
                        label: 'Set System Proxy',
                        type: 'normal',
                        click: async () => {
                            await enableProxy();
                        }
                    },
                    {
                        label: 'Disable',
                        type: 'normal',
                        click: async () => {
                            await disableProxy();
                        }
                    }
                ]
            },*/
                { label: '', type: 'separator' },
                {
                    label: 'Exit',
                    type: 'normal',
                    click: async () => {
                        await disableProxy();
                        app.exit(0);
                    }
                }
            ]);
            contextMenu.items[1].checked = false;
            appIcon.setToolTip('Oblivion Desktop');
            appIcon.setContextMenu(contextMenu);
        });

        // Remove this if your app does not use auto updates
        // eslint-disable-next-line
        // new AppUpdater();
        log.info('oblivion desktop is ready!');
    };

    /**
     * Add event listeners...
     */

    app.on('window-all-closed', async () => {
        log.info('window-all-closed. exiting the app...');

        await disableProxy();
        app.exit(0);
    });

    app.whenReady()
        .then(() => {
            createWindow();
            app.on('activate', () => {
                // On macOS it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (mainWindow === null) createWindow();
            });
        })
        .catch(console.log);
}
