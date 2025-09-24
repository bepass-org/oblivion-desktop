import fs from 'fs';
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import { defaultSettings, dnsServers } from '../../defaultSettings';
import {
    isAnyUndefined,
    typeIsNotUndefined,
    typeIsUndefined
} from '../../renderer/lib/isAnyUndefined';

export const isDev = () => process.env.NODE_ENV === 'development';

export const isDebug = () =>
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export function doesFileExist(filePath: string) {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err: any) => {
            if (err && err.code === 'ENOENT') {
                resolve(false);
            } else if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

export const doesDirectoryExist = doesFileExist;
export const doesFolderExist = doesFileExist;

export function removeFileIfExists(filePath: string) {
    return new Promise(async (resolve, reject) => {
        if (await doesFileExist(filePath)) {
            fs.unlink(filePath, (err2: any) => {
                if (err2) {
                    reject(err2);
                } else {
                    resolve(true);
                }
            });
        } else {
            resolve(true);
        }
    });
}

export function removeDirIfExists(dirPath: string) {
    return new Promise(async (resolve, reject) => {
        if (await doesDirectoryExist(dirPath)) {
            fs.rm(dirPath, { recursive: true, force: true }, (err2: any) => {
                if (err2) {
                    reject(err2);
                } else {
                    resolve(true);
                }
            });
        }
    });
}

export function shouldProxySystem(proxyMode: any) {
    return isAnyUndefined(proxyMode) || (typeof proxyMode === 'string' && proxyMode === 'system');
}

export function hasLicense(license: any) {
    return typeIsNotUndefined(license) && license !== '';
}

export function checkRoutingRules(value: any) {
    return typeof value === 'string' && value !== '' ? 'Customized' : 'Default';
}

export function checkEndpoint(endpoint: any) {
    return typeIsUndefined(endpoint) ||
        (typeof endpoint === 'string' && endpoint === defaultSettings.endpoint)
        ? 'default'
        : 'custom';
}

export function checkDataUsage(value: any) {
    return typeof value === 'boolean'
        ? value
            ? 'true'
            : 'false'
        : defaultSettings.dataUsage
          ? 'true'
          : 'false';
}

export function checkProxyMode(value: any) {
    return typeof value === 'string' ? value : defaultSettings.proxyMode;
}

export function checkReserved(value: any) {
    return typeof value === 'boolean'
        ? value
            ? 'true'
            : 'false'
        : defaultSettings.reserved
          ? 'true'
          : 'false';
}

export function checkGeoStatus(ip: any, site: any, block: any, nsfw: any) {
    let status = '';
    status = 'Ip: ' + (typeof ip === 'string' ? String(ip) : 'none') + ', ';
    status += 'Site: ' + (typeof site === 'string' ? String(site) : 'none') + ', ';
    status +=
        'Block: ' +
        (typeof block === 'boolean'
            ? block
                ? 'true'
                : 'false'
            : defaultSettings.singBoxGeoBlock
              ? 'true'
              : 'false') +
        ', ';
    status +=
        'NSFW: ' +
        (typeof nsfw === 'boolean'
            ? nsfw
                ? 'true'
                : 'false'
            : defaultSettings.singBoxGeoNSFW
              ? 'true'
              : 'false');
    return status;
}

export function calculateMethod(method: any) {
    if (typeIsUndefined(method)) {
        return defaultSettings.method;
    }
    switch (method) {
        case 'gool':
            return 'gool';
        case 'psiphon':
            return 'psiphon';
        case 'masque':
            return 'masque';
        default:
            return 'warp';
    }
}

export function isSocksProxy(method: any) {
    if (typeIsUndefined(method)) {
        return defaultSettings.method;
    }
    switch (method) {
        case 'psiphon':
            return true;
        case 'masque':
            return true;
        default:
            return false;
    }
}

export function checkIpType(value: any, endpoint: any) {
    if (checkEndpoint(endpoint) !== 'custom') {
        switch (value) {
            case '-6':
                return 'v6';
            case '-4':
                return 'v4';
            default:
                return 'v4/v6';
        }
    } else {
        if (endpoint.startsWith('[')) {
            return 'v6';
        } else {
            return 'v4';
        }
    }
}

export function checkTunAddrType(addrType: any): string {
    if (typeof addrType !== 'string') return 'v64';

    return addrType;
}

export function checkTestUrl(value: any) {
    return typeof value === 'string' ? value : defaultSettings.testUrl;
}

export function checkDNS(value: any) {
    return typeof value === 'string' ? value : dnsServers[0].value;
}

export const exitTheApp = async () => {
    log.info('exiting the app...');

    // Emit 'wp-end' and wait
    ipcMain.emit('wp-end', true);

    // Emit 'end-wp-and-exit-app' and wait
    ipcMain.emit('end-wp-and-exit-app');

    // make sure to kill wp process before exit (for linux(windows and mac kill child processes by default))
    if (process.platform === 'darwin') {
        log.info('Exiting the application...');
        app.exit(0);
    } else {
        ipcMain.on('exit', () => {
            log.info('Exiting the application...');
            app.exit(0);
        });
    }
};

export function extractPortsFromEndpoints(strData: string): number[] {
    const endpointsRegex = /endpoints="\[(.*?)]"/;
    const endpointsMatch = strData.match(endpointsRegex);

    if (endpointsMatch) {
        const endpointsStr = endpointsMatch[1];
        const portRegex = /(?:\b(?:\d{1,3}\.){3}\d{1,3}|\[[a-fA-F0-9:]+]|[a-fA-F0-9:]+):(\d{1,5})/g;

        const ports = new Set<number>();

        let match = portRegex.exec(endpointsStr);
        do {
            if (match) {
                ports.add(parseInt(match[1], 10));
            }
            match = portRegex.exec(endpointsStr);
        } while (match);

        if (ports.size > 0) {
            return Array.from(ports);
        }
    }

    return [];
}

export function formatEndpointForConfig(endpoint: string): string {
    const ip = endpoint.replace(/:\d+$/, '').replace(/^\[/, '').replace(/\]$/, '');

    return ip.includes(':') ? `${ip}/128` : `${ip}/32`;
}

export function mapGrpcErrorCodeToLabel(code: number | undefined): string {
    if (code === undefined) {
        return 'Unknown Error';
    }
    switch (code) {
        case 0:
            return 'OK';
        case 1:
            return 'Cancelled';
        case 2:
            return 'Unknown Error';
        case 3:
            return 'Invalid Argument';
        case 4:
            return 'Deadline Exceeded';
        case 5:
            return 'Not Found';
        case 6:
            return 'Already Exists';
        case 7:
            return 'Permission Denied';
        case 8:
            return 'Resource Exhausted';
        case 9:
            return 'Failed Precondition';
        case 10:
            return 'Aborted';
        case 11:
            return 'Out of Range';
        case 12:
            return 'Unimplemented';
        case 13:
            return 'Internal Error';
        case 14:
            return 'Unavailable';
        case 15:
            return 'Data Loss';
        case 16:
            return 'Unauthenticated';
        default:
            return 'Unknown Error';
    }
}

export function isIpBasedDoH(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        const ipv4Pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Pattern = /^\[?[a-fA-F0-9:]+\]?$/;

        return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
    } catch (error) {
        return false;
    }
}

export function versionComparison(localVersion: any, apiVersion: any): boolean {
    const parts1 = localVersion
        .toLowerCase()
        .replace('v', '')
        .replace('-beta', '')
        .split('.')
        .map(Number);
    const parts2 = apiVersion
        .toLowerCase()
        .replace('v', '')
        .replace('-beta', '')
        .split('.')
        .map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        if (part1 > part2) {
            return false;
        } else if (part1 < part2) {
            return true;
        }
    }
    return false;
}
