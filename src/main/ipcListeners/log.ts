import fs from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';
import { doesFileExist } from '../lib/utils';

export const logPath = path.join(app?.getPath('logs'), 'main.log');

export function readLogFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(logPath, 'utf8', (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

ipcMain.on('getLogs', async (event) => {
    const bool = await doesFileExist(logPath);
    if (bool) {
        const data = await readLogFile();
        event.reply('getLogs', data);
    }
});
