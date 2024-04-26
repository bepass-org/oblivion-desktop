/* eslint-disable no-unused-expressions */
// warp-plus

import { ipcMain } from 'electron';
import treeKill from 'tree-kill';
import path from 'path';
import settings from 'electron-settings';
import { appendToLogFile, writeToLogFile } from '../lib/log';
import { doesFileExist } from '../lib/utils';
import { disableProxy, enableProxy } from '../lib/proxy';

const { spawn } = require('child_process');

let child: any;

const platform = process.platform; // linux / win32 / darwin / else(not supported...)

ipcMain.on('wp-start', async (event, arg) => {
    console.log('🚀 - ipcMain.on - arg:', arg);

    // in case user is using another proxy
    disableProxy();

    // reading user settings for warp
    const args = [];
    const endpoint = await settings.get('endpoint');
    const port = await settings.get('port');
    console.log('🚀 - ipcMain.on - port:', port);
    const psiphon = await settings.get('psiphon');
    const location = await settings.get('location');
    const license = await settings.get('license');
    const gool = await settings.get('gool');

    // https://stackoverflow.com/questions/55328916/electron-run-shell-commands-with-arguments
    if (typeof port === 'string' || typeof port === 'number') {
        args.push(`--bind`);
        args.push(`127.0.0.1:${port}`);
    }
    if (typeof endpoint === 'string' && endpoint.length > 0) {
        args.push(`--endpoint`);
        args.push(`${endpoint}`);
    }
    if (typeof license === 'string') {
        args.push(`--key`);
        args.push(`${license}`);
    }
    if (typeof gool === 'boolean' && gool === true) {
        args.push('--gool');
    }
    if (
        typeof psiphon === 'boolean' &&
        psiphon === true &&
        typeof location === 'string' &&
        location !== '' &&
        typeof gool === 'boolean' &&
        gool === false
    ) {
        args.push(`--cfon`);
        args.push(`--country`);
        args.push(`${location}`);
    }
    console.log('args:', args);

    let command = '';
    if (platform === 'win32') {
        command = path.join('assets', 'bin', 'warp-plus.exe');
    } else {
        command = path.join('assets', 'bin', 'warp-plus');
    }
    child = spawn(command, args);

    // TODO better approach
    const successMessage = 'level=INFO msg="serving proxy" address=127.0.0.1';
    child.stdout.on('data', async (data: any) => {
        const strData = data.toString();
        console.log(strData);
        if (strData.includes(successMessage)) {
            event.reply('wp-start', true);
            enableProxy();
        }
        // write to log file
        const tmp = await doesFileExist('log.txt');
        if (!tmp) {
            writeToLogFile(strData);
        } else {
            appendToLogFile(strData);
        }
    });

    // child.stderr.on((err: any) => {
    //     console.log('err', err.toString());
    // });
});

ipcMain.on('wp-end', async (event, arg) => {
    try {
        treeKill(child.pid);
    } catch (error) {
        event.reply('wp-end', false);
    }

    child.on('exit', (code: any) => {
        if (code === 0 || code === 1) {
            event.reply('wp-end', true);
            disableProxy();
        } else {
            console.log('🚀 - wp.on - code:', code);
        }
    });
});
