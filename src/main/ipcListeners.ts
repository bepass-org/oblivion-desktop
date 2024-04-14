// https://www.electronjs.org/docs/latest/tutorial/ipc

import { ipcMain } from 'electron';

const spawn = require('child_process').spawn;

ipcMain.on('ipc-example', async (event, arg) => {
    event.reply('ipc-example', 'pong', arg);
});

ipcMain.on('wp-start', async (event, arg) => {
    console.log('🚀 - ipcMain.on - arg:', arg);
    event.reply('wp-start', 'start', arg);
});
