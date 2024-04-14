import { ipcMain } from 'electron';
import { doesFileExist } from '../lib/utils';
import { readLogFile } from '../lib/log';

ipcMain.on('log', async (event, arg) => {
    const bool = await doesFileExist('log.txt');
    if (bool) {
        const data = await readLogFile();
        event.reply('log', data);
    }
});
