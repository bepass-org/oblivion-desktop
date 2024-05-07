import { app, ipcMain } from 'electron';
import path from 'path';
import { doesFileExist } from '../lib/utils';
import { readLogFile } from '../lib/log';

export const wpLogPath = path.join(app.getPath('logs'), 'warp-plus.log');

ipcMain.on('log', async (event) => {
    const bool = await doesFileExist(wpLogPath);
    if (bool) {
        const data = await readLogFile();
        event.reply('log', data);
    }
});
