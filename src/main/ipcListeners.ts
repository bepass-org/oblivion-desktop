// https://www.electronjs.org/docs/latest/tutorial/ipc

import { ipcMain } from 'electron';

ipcMain.on('ipc-example', async (event, arg) => {
  event.reply('ipc-example', 'pong', arg);
});
