/* eslint-disable import/no-duplicates */
// warp-plus

import { app, ipcMain } from 'electron';
import treeKill from 'tree-kill';
import path from 'path';
import settings from 'electron-settings';
import log from 'electron-log';
import { removeFileIfExists, shouldProxySystem } from '../lib/utils';
import { disableProxy, enableProxy } from '../lib/proxy';
import { logPath } from './log';
import { getUserSettings, handleWpErrors } from '../lib/wp';
import { defaultSettings } from '../../defaultSettings';

const simpleLog = log.create('simpleLog');
simpleLog.transports.console.format = '{text}';
simpleLog.transports.file.format = '{text}';

const { spawn } = require('child_process');

let child: any;

export const wpFileName = `warp-plus${process.platform === 'win32' ? '.exe' : ''}`;

export const wpAssetPath = path.join(
    app.getAppPath().replace('/app.asar', '').replace('\\app.asar', ''),
    'assets',
    'bin',
    wpFileName
);

export const wpDirPath = path.join(app.getPath('userData'));
export const wpBinPath = path.join(wpDirPath, wpFileName);

export const stuffPath = path.join(wpDirPath, 'stuff');

let connectedFlags: boolean[];
let disconnectedFlags: boolean[];
ipcMain.on('wp-start', async (event) => {
    connectedFlags = [false, false];
    disconnectedFlags = [false, false];

    const sendConnectedSignalToRenderer = () => {
        if (connectedFlags[0] && connectedFlags[1]) {
            event.reply('wp-start', true);
        }
    };

    const sendDisconnectedSignalToRenderer = () => {
        if (disconnectedFlags[0] && disconnectedFlags[1]) {
            event.reply('wp-end', true);
        }
    };

    await removeFileIfExists(logPath);
    log.info('past logs was deleted for new connection.');

    const args = await getUserSettings();

    const port = (await settings.get('port')) || defaultSettings.port;
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;
    //const autoSetProxy = await settings.get('autoSetProxy');
    const proxyMode = await settings.get('proxyMode');

    if (shouldProxySystem(proxyMode)) {
        enableProxy(event).then(() => {
            connectedFlags[0] = true;
            sendConnectedSignalToRenderer();
        });
    } else {
        connectedFlags[0] = true;
        sendConnectedSignalToRenderer();
    }

    const command = path.join(wpDirPath, wpFileName);

    log.info('starting wp process...');
    log.info(`${command + args.join(' ')}`);

    child = spawn(command, args, { cwd: wpDirPath });

    const successMessage = `level=INFO msg="serving proxy" address=${hostIP}`;
    const successTunMessage = `level=INFO msg="serving tun"`;

    child.stdout.on('data', async (data: any) => {
        const strData = data.toString();
        if (strData.includes(successMessage)) {
            connectedFlags[1] = true;
            sendConnectedSignalToRenderer();
        }

        handleWpErrors(strData, event, String(port));

        simpleLog.info(strData);
    });

    child.stderr.on('data', (err: any) => {
        simpleLog.error(`err: ${err.toString()}`);
    });

    child.on('exit', async () => {
        disconnectedFlags[1] = true;
        sendDisconnectedSignalToRenderer();
        log.info('wp process exit successfully.');

        if (shouldProxySystem(proxyMode)) {
            disableProxy(event).then(() => {
                disconnectedFlags[0] = true;
                sendDisconnectedSignalToRenderer();
            });
        } else {
            disconnectedFlags[0] = true;
            sendDisconnectedSignalToRenderer();
        }
    });
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
