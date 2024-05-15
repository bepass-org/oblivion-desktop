// https://www.electronjs.org/docs/latest/tutorial/ipc

import { app, ipcMain } from 'electron';
import log from 'electron-log';
import './ipcListeners/wp';
import './ipcListeners/log';
import './ipcListeners/settings';
import { disableProxy } from './lib/proxy';

ipcMain.on('ipc-example', async (event, arg) => {
    event.reply('ipc-example', 'pong', arg);
});

ipcMain.on('exit', async () => {
    log.info('exiting the app...');
    await disableProxy();
    app.exit(0);
});
