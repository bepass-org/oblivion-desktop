// warp-plus

import toast from 'react-hot-toast';
import { app, ipcMain } from 'electron';
import treeKill from 'tree-kill';
import path from 'path';
import settings from 'electron-settings';
import log from 'electron-log';
import fs from 'fs';
import { spawn } from 'child_process';
import { isDev, removeFileIfExists, shouldProxySystem } from '../lib/utils';
import { disableProxy as disableSystemProxy, enableProxy as enableSystemProxy } from '../lib/proxy';
import { logMetadata, logPath } from './log';
import { getUserSettings, handleWpErrors } from '../lib/wp';
import { defaultSettings } from '../../defaultSettings';
import { customEvent } from '../lib/customEvent';
import { regeditVbsDirPath } from '../main';
import { showWpLogs } from '../dxConfig';
import { getTranslate } from '../../localization';
import SingBoxManager from '../lib/sbManager';

const simpleLog = log.create('simpleLog');
simpleLog.transports.console.format = '{text}';
simpleLog.transports.file.format = '{text}';

let child: any;

export const wpFileName = `warp-plus${process.platform === 'win32' ? '.exe' : ''}`;
export const sbAssetFileName = `sing-box${process.platform === 'win32' ? '.exe' : ''}`;
export const sbWDFileName = `oblivion-sing-box${process.platform === 'win32' ? '.exe' : ''}`;
export const helperFileName = `oblivion-helper${process.platform === 'win32' ? '.exe' : ''}`;
export const sbConfigName = 'sbConfig.json';

export const wpAssetPath = path.join(
    app.getAppPath().replace('/app.asar', '').replace('\\app.asar', ''),
    'assets',
    'bin',
    wpFileName
);
export const sbAssetPath = path.join(
    app.getAppPath().replace('/app.asar', '').replace('\\app.asar', ''),
    'assets',
    'bin',
    'sing-box',
    sbAssetFileName
);
export const helperAssetPath = path.join(
    app.getAppPath().replace('/app.asar', '').replace('\\app.asar', ''),
    'assets',
    'bin',
    helperFileName
);

export const wpDirPath = path.join(app.getPath('userData'));
export const wpBinPath = path.join(wpDirPath, wpFileName);
export const stuffPath = path.join(wpDirPath, 'stuff');
export const sbBinPath = path.join(wpDirPath, sbWDFileName);
export const sbConfigPath = path.join(wpDirPath, sbConfigName);
export const helperPath = path.join(wpDirPath, helperFileName);

const singBoxManager = new SingBoxManager(
    helperPath,
    helperFileName,
    sbWDFileName,
    sbConfigName,
    wpDirPath
);

let exitOnWpEnd = false;

let appLang = getTranslate('en');

let connectedFlags: boolean[];
let disconnectedFlags: boolean[];
ipcMain.on('wp-start', async (event) => {
    const port = (await settings.get('port')) || defaultSettings.port;
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;
    //const autoSetProxy = await settings.get('autoSetProxy');
    const proxyMode = await settings.get('proxyMode');
    const lang = await settings.get('lang');
    appLang = getTranslate(String(typeof lang !== 'undefined' ? lang : defaultSettings.lang));

    /*if (! net.isOnline()) {
        event.reply('guide-toast', appLang.toast.offline);
        event.reply('wp-end', true);
        return;
    }*/

    if (!fs.existsSync(wpBinPath)) {
        event.reply('guide-toast', appLang.log.error_wp_stopped);
        event.reply('wp-end', true);
        return;
    }

    exitOnWpEnd = false;
    connectedFlags = [false, false];
    disconnectedFlags = [false, false];

    const sendConnectedSignalToRenderer = () => {
        customEvent.emit('tray-icon', 'connecting');
        if (connectedFlags[0] && connectedFlags[1]) {
            event.reply('wp-start', true);
            customEvent.emit(
                'tray-icon',
                `connected-${typeof proxyMode !== 'undefined' ? proxyMode : defaultSettings.proxyMode}`
            );
            toast.remove('GUIDE');
        }
    };

    const sendDisconnectedSignalToRenderer = () => {
        customEvent.emit('tray-icon', 'disconnecting');
        if (disconnectedFlags[0] && disconnectedFlags[1]) {
            event.reply('wp-end', true);

            // send signal to `exitTheApp` function
            if (exitOnWpEnd) ipcMain.emit('exit');
            customEvent.emit('tray-icon', 'disconnected');
        }
    };

    await removeFileIfExists(logPath);
    log.info('past logs was deleted for new connection.');
    logMetadata();

    const args = await getUserSettings();

    /*const license = await settings.get('license');
    if (typeof license === 'string' && license !== '') {
        setStuffPath(args);
    }*/

    const handleSystemProxyDisconnect = async () => {
        if (shouldProxySystem(proxyMode)) {
            disableSystemProxy(regeditVbsDirPath, event).then(() => {
                disconnectedFlags[0] = true;
                sendDisconnectedSignalToRenderer();
            });
        } else {
            disconnectedFlags[0] = true;
            sendDisconnectedSignalToRenderer();
        }
    };

    if (shouldProxySystem(proxyMode)) {
        enableSystemProxy(regeditVbsDirPath, event)
            .then(() => {
                connectedFlags[0] = true;
                sendConnectedSignalToRenderer();
            })
            .catch(() => {
                handleSystemProxyDisconnect();
            });
    } else {
        connectedFlags[0] = true;
        sendConnectedSignalToRenderer();
    }

    const command = path.join(wpDirPath, wpFileName);

    log.info('starting wp process...');
    log.info(`${command + ' ' + args.join(' ')}`);

    console.log(proxyMode);

    try {
        child = spawn(command, args, { cwd: wpDirPath });
        const successMessage = `level=INFO msg="serving proxy" address=${hostIP}`;
        //const endpointMessage = `level=INFO msg="using warp endpoints" endpoints=`;
        // const successTunMessage = `level=INFO msg="serving tun"`;

        if (proxyMode === 'tun' && !(await singBoxManager.startSingBox())) {
            event.reply('guide-toast', appLang.log.error_singbox_failed_start);
            event.reply('wp-end', true);
            if (typeof child?.pid !== 'undefined') {
                treeKill(child.pid, 'SIGKILL');
                exitOnWpEnd = true;
            }
        }

        child.stdout.on('data', async (data: any) => {
            const strData = data.toString();

            /*if (strData.includes(endpointMessage) && proxyMode === 'tun' && !isSingBoxRunning) {
                const uniquePorts = extractPortsFromEndpoints(strData);
                createSbConfig(Number(port), uniquePorts);
            }*/

            if (strData.includes(successMessage)) {
                if (proxyMode === 'tun' && !(await singBoxManager.checkConnectionStatus())) {
                    event.reply('guide-toast', appLang.log.error_singbox_failed_start);
                    event.reply('wp-end', true);
                    if (typeof child?.pid !== 'undefined') {
                        treeKill(child.pid, 'SIGKILL');
                        exitOnWpEnd = true;
                    }
                } else {
                    connectedFlags[1] = true;
                    sendConnectedSignalToRenderer();
                }
            }

            // Save the last endpoint that was successfully connected
            const endpointRegex =
                /msg="scan results" endpoints="\[\{AddrPort:(\d{1,3}(?:\.\d{1,3}){3}:\d{1,5})/;
            const match = strData.match(endpointRegex);
            if (match) {
                await settings.set('scanResult', match[1]);
            }

            handleWpErrors(strData, event, String(port));

            if (!showWpLogs && isDev()) return;
            simpleLog.info(strData);
        });

        child.stderr.on('data', (err: any) => {
            if (!showWpLogs && isDev()) return;
            simpleLog.error(`err: ${err.toString()}`);
        });

        child.on('exit', async () => {
            if (proxyMode === 'tun' && !(await singBoxManager.stopSingBox())) {
                event.reply('guide-toast', appLang.log.error_singbox_failed_stop);
                event.reply('wp-end', false);
                event.reply('wp-start', true);
            }
            disconnectedFlags[1] = true;
            sendDisconnectedSignalToRenderer();
            log.info('wp process exited.');
            // manually setting pid to undefined
            child.pid = undefined;
            await handleSystemProxyDisconnect();
        });
    } catch (error) {
        event.reply('guide-toast', appLang.log.error_wp_not_found);
        event.reply('wp-end', true);
    }
});

ipcMain.on('wp-end', async (event) => {
    try {
        if (typeof child?.pid !== 'undefined') {
            treeKill(child.pid, 'SIGKILL');
        }
    } catch (error) {
        log.error(error);
        event.reply('wp-end', false);
    }
});

ipcMain.on('end-wp-and-exit-app', async (event) => {
    try {
        if (typeof child?.pid !== 'undefined') {
            treeKill(child.pid, 'SIGKILL');
            exitOnWpEnd = true;
        } else {
            // send signal to `exitTheApp` function
            ipcMain.emit('exit');
        }
        await singBoxManager.stopHelper();
    } catch (error) {
        log.error(error);
        event.reply('wp-end', false);
    }
});
