// warp-plus

import { app, ipcMain } from 'electron';
import treeKill from 'tree-kill';
import path from 'path';
import settings from 'electron-settings';
import { appLog } from '../lib/log';
import { isDev, removeFileIfExists } from '../lib/utils';
import { disableProxy, enableProxy } from '../lib/proxy';
import { logPath } from './log';
import { getUserSettings, handleWpErrors } from '../lib/wp';
import { defaultSettings } from '../../defaultSettings';

const { spawn } = require('child_process');

let child: any;

export const wpFileName = `warp-plus${process.platform === 'win32' ? '.exe' : ''}`;
export const wpDirPath = isDev()
    ? path.join(
          app.getAppPath().replace('/app.asar', '').replace('\\app.asar', ''),
          'assets',
          'bin'
      )
    : path.join(app.getPath('userData'));
export const stuffPath = path.join(wpDirPath, 'stuff');

ipcMain.on('wp-start', async (event) => {
    await removeFileIfExists(logPath);

    const args = await getUserSettings();

    const port = (await settings.get('port')) || defaultSettings.port;
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;
    const autoSetProxy = await settings.get('autoSetProxy');

    if (typeof autoSetProxy === 'undefined' && defaultSettings.autoSetProxy) {
        await enableProxy(event);
    } else if (typeof autoSetProxy === 'boolean' && autoSetProxy === true) {
        await enableProxy(event);
    }

    const command = path.join(wpDirPath, wpFileName);

    appLog(`command: ${command + args.join(' ')}`);

    child = spawn(command, args, { cwd: wpDirPath });

    const successMessage = `level=INFO msg="serving proxy" address=${hostIP}`;

    child.stdout.on('data', async (data: any) => {
        const strData = data.toString();
        if (strData.includes(successMessage)) {
            event.reply('wp-start', true);
        }

        handleWpErrors(strData, event, String(port));
        appLog(strData);
    });

    child.stderr.on('data', (err: any) => {
        appLog(`err: ${err.toString()}`);
    });

    child.on('exit', async () => {
        await disableProxy(event);
        event.reply('wp-end', true);
    });
});

ipcMain.on('wp-end', async (event) => {
    try {
        if (typeof child?.pid !== 'undefined') {
            treeKill(child.pid, 'SIGKILL');
        }
    } catch (error) {
        console.error(error);
        event.reply('wp-end', false);
    }
});
