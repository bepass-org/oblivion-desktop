// https://www.electronjs.org/docs/latest/tutorial/ipc

import { app, ipcMain } from 'electron';

import './ipcListeners/wp';
import './ipcListeners/log';
import './ipcListeners/settings';
import { disableProxy } from './lib/proxy';

ipcMain.on('ipc-example', async (event, arg) => {
    event.reply('ipc-example', 'pong', arg);
});

ipcMain.on('quit', async () => {
    await disableProxy();
    app.exit(0);
});
