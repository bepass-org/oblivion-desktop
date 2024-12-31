import fs from 'fs';
import os from 'os';
import si from 'systeminformation';
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import settings from 'electron-settings';
import {
    calculateMethod,
    checkDataUsage,
    checkEndpoint,
    checkProxyMode,
    checkRoutingRules,
    doesFileExist,
    hasLicense,
    checkReserved,
    checkGeoStatus,
    checkIpType
} from '../lib/utils';
import packageJsonData from '../../../package.json';
import { binAssetPath, logPath } from '../../constants';
import { wpVersion, sbVersion, helperVersion } from '../config';

export function readLogFile(value: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(value, 'utf8', (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export const getOsInfo = async () => {
    let getOsInfo = '';
    await si.osInfo()
    .then((data) => {
        getOsInfo += data.distro ? data.distro + ' ' : '';
        getOsInfo += (data.release ? '('+data.release+')' : os.release()) + ' ';
        getOsInfo += data.arch ? data.arch : process.arch;
    })
    .catch((err) => {
        log.error(err);
        getOsInfo = process.platform + ' ' + os.release() + ' ' + process.arch;
    });
    return getOsInfo;
}

export const logMetadata = (osInfo:string) => {
    const method = settings.get('method');
    const proxyMode = settings.get('proxyMode');
    const license = settings.get('license');
    const endpoint = settings.get('endpoint');
    const routingRules = settings.get('routingRules');
    const asn = settings.get('asn');
    const dataUsage = settings.get('dataUsage');
    const reserved = settings.get('reserved');
    const singBoxGeoIp = settings.get('singBoxGeoIp');
    const singBoxGeoSite = settings.get('singBoxGeoSite');
    const singBoxGeoBlock = settings.get('singBoxGeoBlock');
    const ipType = settings.get('ipType');

    Promise.all([
        method,
        proxyMode,
        license,
        endpoint,
        routingRules,
        asn,
        dataUsage,
        reserved,
        singBoxGeoIp,
        singBoxGeoSite,
        singBoxGeoBlock,
        ipType
    ])
        .then((data) => {
            log.info('------------------------MetaData------------------------');
            log.info(`running on: ${osInfo}`);
            log.info(`at od: v${packageJsonData.version}`);
            log.info(`at wp: v${wpVersion}`);
            log.info(`at sb: v${sbVersion}`);
            log.info(`at hp: v${helperVersion}`);
            log.info(`ls assets/bin: ${fs.readdirSync(binAssetPath, { recursive: true })}`);
            log.info('method:', calculateMethod(data[0]));
            log.info('proxyMode:', checkProxyMode(data[1]));
            log.info('routingRules:', checkRoutingRules(data[4]));
            log.info('endpoint:', checkEndpoint(data[3]));
            log.info('ipType:', checkIpType(data[11], data[3]));
            log.info('dataUsage:', checkDataUsage(data[6]));
            log.info('asn:', data[5] ? data[5] : 'UNK');
            log.info('license:', hasLicense(data[2]));
            log.info('reserved:', checkReserved(data[7]));
            log.info('geo', checkGeoStatus(data[8], data[9], data[10]));
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

const parseLogDate = (logLine: string) => {
    const dateRegex =
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2})|(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/;
    const match = logLine.match(dateRegex);
    if (match) {
        if (match[1]) {
            return new Date(match[1]);
        } else if (match[2]) {
            return new Date(match[2]);
        }
    }
    return new Date(0);
};

ipcMain.on('get-logs', async (event) => {
    const wpLogPathExist = await doesFileExist(logPath);
    let wpLogs = '';
    if (wpLogPathExist) {
        wpLogs = String(await readLogFile(logPath));
    }
    const wpLogLines = wpLogs.split('\n');
    const allLogLines = [...wpLogLines]
        .filter((line) => line.trim() !== '')
        .sort((a, b) => {
            const dateA = parseLogDate(a);
            const dateB = parseLogDate(b);
            return dateA.getTime() - dateB.getTime();
        });
    const mergedLogs = allLogLines.join('\n');
    event.reply('get-logs', mergedLogs);
});
