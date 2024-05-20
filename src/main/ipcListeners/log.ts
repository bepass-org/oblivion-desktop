import fs from 'fs';
import path from 'path';
import os from 'os';
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import settings from 'electron-settings';
import { calculateMethod, doesFileExist, shouldProxySystem } from '../lib/utils';
import packageJsonData from '../../../package.json';
import { binAssetsPath } from '../main';
import { wpVersion } from '../config';
import { getUserSettings } from '../lib/wp';
import { defaultSettings } from '../../defaultSettings';

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
    const method = settings.get('method');
    const proxyMode = settings.get('proxyMode');

    Promise.all([method, proxyMode])
        .then((data) => {
            log.info('------------------------MetaData------------------------');
            log.info(`running on: ${process.platform} ${process.arch} ${os.release()}`);
            log.info(`at od: ${packageJsonData.version}`);
            log.info(`at wp: ${wpVersion}`);
            log.info(`ls assets/bin: ${fs.readdirSync(binAssetsPath)}`);
            log.info('method:', calculateMethod(data[0]));
            // TODO rename to network configuration when tun comes
            log.info('proxyMode:', shouldProxySystem(data[1]));
            log.info(`exe: ${app.getPath('exe')}`);
            log.info(`userData: ${app.getPath('userData')}`);
            log.info(`logs: ${app.getPath('logs')}`);
            log.info('------------------------MetaData------------------------');
            // TODO add package type(exe/dev/rpm/dmg/zip/etc...) if possible
        })
        .catch((err) => {
            log.error(err);
        });
};

ipcMain.on('getLogs', async (event) => {
    const bool = await doesFileExist(logPath);
    if (bool) {
        const data = await readLogFile();
        event.reply('getLogs', data);
    }
});
