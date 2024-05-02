import { ipcMain } from 'electron';
import { doesFileExist } from '../lib/utils';
import { readLogFile, wpLogPath } from '../lib/log';

ipcMain.on('log', async (event, arg) => {
    const bool = await doesFileExist(wpLogPath);
    if (bool) {
        const data = await readLogFile();
        event.reply('log', data);
    }
});
