import { ipcMain } from 'electron';
import { appendToLogFile, readLogFile, writeToLogFile } from '../lib/log';
import { doesFileExist } from '../lib/utils';

const { spawn } = require('child_process');

let wp: any;

ipcMain.on('wp-start', async (event, arg) => {
    console.log('🚀 - ipcMain.on - arg:', arg);

    // https://stackoverflow.com/questions/55328916/electron-run-shell-commands-with-arguments
    wp = spawn('./bin/warp-plus', ['--scan', '--gool']);

    // TODO better approach
    const successMessage =
        'level=INFO msg="serving proxy" address=127.0.0.1:8086';
    wp.stdout.on('data', async (data: any) => {
        const strData = data.toString();
        console.log('mmd', strData);
        if (strData.includes(successMessage)) {
            event.reply('wp-start', true);
        }
        // write to log file
        const tmp = await doesFileExist('log.txt');
        if (!tmp) {
            // create
            writeToLogFile(strData);
        } else {
            appendToLogFile(strData);
            // append
        }
        console.log('🚀 - wp.stdout.on - tmp:', tmp);
    });

    wp.stderr.on((err: any) => {
        console.log('err', err.toString());
    });
});

ipcMain.on('wp-end', async (event, arg) => {
    try {
        await wp.kill('SIGTERM');

        // Or
        // wp.kill('SIGKILL'); // force kill
    } catch (error) {
        event.reply('wp-end', false);
    }

    wp.on('exit', (code: any) => {
        console.log('🚀 - wp.on - code:', code);
        if (code === 0 || code === 1) {
            event.reply('wp-end', true);
        } else {
            console.log('🚀 - wp.on - code:', code);
        }
    });
});
