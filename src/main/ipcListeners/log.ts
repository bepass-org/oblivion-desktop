import { app, ipcMain } from 'electron';
import path from 'path';
import { doesFileExist } from '../lib/utils';
import { readLogFile } from '../lib/log';

export const logPath = path.join(app.getPath('logs'), 'app.log');

ipcMain.on('log', async (event) => {
    const bool = await doesFileExist(logPath);
    if (bool) {
        const data = await readLogFile();
        event.reply('log', data);
    }
});
