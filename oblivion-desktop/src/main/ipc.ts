// https://www.electronjs.org/docs/latest/tutorial/ipc

import { ipcMain } from 'electron';
import './lib/wpManager';
import './ipcListeners/log';
import './ipcListeners/settings';

ipcMain.once('ipc-example', async (event, arg) => {
    event.reply('ipc-example', 'pong', arg);
});
