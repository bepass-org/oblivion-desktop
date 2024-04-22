// https://www.electronjs.org/docs/latest/tutorial/ipc

import { ipcMain } from 'electron';

import './ipcListeners/wp';
import './ipcListeners/log';
import './ipcListeners/settings';

ipcMain.on('ipc-example', async (event, arg) => {
    event.reply('ipc-example', 'pong', arg);
});
