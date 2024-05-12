// warp-plus

import { app, ipcMain } from 'electron';
import treeKill from 'tree-kill';
import path from 'path';
import settings from 'electron-settings';
import { appendToLogFile, writeToLogFile } from '../lib/log';
import { doesFileExist, isDev, removeDirIfExists, removeFileIfExists } from '../lib/utils';
import { disableProxy, enableProxy } from '../lib/proxy';
import { wpLogPath } from './log';
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
    : path.join(app.getPath('temp'));
export const stuffPath = path.join(wpDirPath, 'stuff');

ipcMain.on('wp-start', async (event) => {
    removeFileIfExists(wpLogPath);

    // in case user is using another proxy
    // await disableProxy();

    const args = await getUserSettings();

    const port = (await settings.get('port')) || defaultSettings.port;
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;
    const autoSetProxy = (await settings.get('autoSetProxy')) || defaultSettings.autoSetProxy;

    if (typeof autoSetProxy === 'boolean' && autoSetProxy) {
        await enableProxy(event);
    }

    const command = path.join(wpDirPath, wpFileName);

    console.log('command: ', command, args);

    child = spawn(command, args, { cwd: wpDirPath });

    const successMessage = `level=INFO msg="serving proxy" address=${hostIP}`;

    child.stdout.on('data', async (data: any) => {
        const strData = data.toString();
        console.log(strData);
        if (strData.includes(successMessage)) {
            event.reply('wp-start', true);
            /*if (
                (typeof autoSetProxy === 'boolean' && autoSetProxy) ||
                typeof autoSetProxy === 'undefined'
            ) {
                await enableProxy();
            }*/
        }

        handleWpErrors(strData, event, String(port));

        const isWpLogFileExist = await doesFileExist(wpLogPath);
        if (!isWpLogFileExist) {
            writeToLogFile(strData);
        } else {
            appendToLogFile(strData);
        }
    });

    child.stderr.on('data', (err: any) => {
        console.log('err', err.toString());
    });

    child.on('exit', async () => {
        await disableProxy(event);
        event.reply('wp-end', true);
        //removeDirIfExists(stuffPath);
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
