import fs from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import { doesFileExist } from '../lib/utils';
import packageJsonData from '../../../package.json';
import { binAssetsPath } from '../main';
import { wpVersion } from '../config';

export const logPath = path.join(app?.getPath('logs'), 'main.log');

// TODO refactor
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

export const logMetadata = () => {
    log.info('------------------------MetaData------------------------');
    log.info(`running on: ${process.platform} ${process.arch}`);
    log.info(`at od: ${packageJsonData.version}`);
    log.info(`at wp: ${wpVersion}`);
    log.info(`ls assets/bin: ${fs.readdirSync(binAssetsPath)}`);
    log.info(`exe: ${app.getPath('exe')}`);
    log.info(`userData: ${app.getPath('userData')}`);
    log.info(`logs: ${app.getPath('logs')}`);
    log.info('------------------------MetaData------------------------');
    // log.info(process.env);
    // TODO add package type(exe/dev/rpm/dmg/zip/etc...) if possible
};

ipcMain.on('getLogs', async (event) => {
    const bool = await doesFileExist(logPath);
    if (bool) {
        const data = await readLogFile();
        event.reply('getLogs', data);
    }
});
