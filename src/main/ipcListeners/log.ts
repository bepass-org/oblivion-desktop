import fs from 'fs';
import path from 'path';
import os from 'os';
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import settings from 'electron-settings';
import {
    calculateMethod,
    checkEndpoint,
    checkRoutingRules,
    doesFileExist,
    hasLicense,
    shouldProxySystem
} from '../lib/utils';
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
    const method = settings.get('method');
    const proxyMode = settings.get('proxyMode');
    const license = settings.get('license');
    const endpoint = settings.get('endpoint');
    const routingRules = settings.get('routingRules');
    const asn = settings.get('asn');

    Promise.all([method, proxyMode, license, endpoint, routingRules, asn])
        .then((data) => {
            log.info('------------------------MetaData------------------------');
            log.info(`running on: ${process.platform} ${os.release()} ${process.arch}`);
            log.info(`at od: ${packageJsonData.version}`);
            log.info(`at wp: v${wpVersion}`);
            log.info(`ls assets/bin: ${fs.readdirSync(binAssetsPath)}`);
            log.info('method:', calculateMethod(data[0]));
            // TODO rename to network configuration when tun comes
            log.info('proxyMode:', shouldProxySystem(data[1]));
            log.info('routingRules:', checkRoutingRules(data[4]));
            log.info('endpoint:', checkEndpoint(data[3]));
            log.info('asn:', data[5] ? data[5] : 'UNK');
            log.info('license:', hasLicense(data[2]));
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

ipcMain.on('get-logs', async (event) => {
    const bool = await doesFileExist(logPath);
    if (bool) {
        const data = await readLogFile();
        event.reply('get-logs', data);
    }
});
