// https://www.electronjs.org/docs/latest/tutorial/ipc

import { ipcMain } from 'electron';

const { spawn } = require('child_process');

ipcMain.on('ipc-example', async (event, arg) => {
    event.reply('ipc-example', 'pong', arg);
});

let wp: any;

ipcMain.on('wp-start', async (event, arg) => {
    console.log('🚀 - ipcMain.on - arg:', arg);

    // https://stackoverflow.com/questions/55328916/electron-run-shell-commands-with-arguments
    wp = spawn('./bin/warp-plus', ['--scan', '--gool']);

    // TODO better approach
    const successMessage =
        'level=INFO msg="serving proxy" address=127.0.0.1:8086';
    wp.stdout.on('data', (data: any) => {
        console.log('data', data.toString());
        if (data.toString().includes(successMessage)) {
            event.reply('wp-start', true);
        }
    });

    wp.stderr.on('data', (err: any) => {
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
        if (code === 0) {
            event.reply('wp-end', true);
        } else {
            console.log('🚀 - wp.on - code:', code);
        }
    });
});
