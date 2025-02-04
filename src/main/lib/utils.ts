import fs from 'fs';
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import { defaultSettings } from '../../defaultSettings';

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
    return (
        typeof proxyMode === 'undefined' ||
        (typeof proxyMode === 'string' && proxyMode === 'system')
    );
}

export function hasLicense(license: any) {
    return typeof license !== 'undefined' && license !== '';
}

export function checkRoutingRules(value: any) {
    return typeof value === 'string' && value !== '' ? 'Customized' : 'Default';
}

export function checkEndpoint(endpoint: any) {
    return typeof endpoint === 'undefined' ||
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
    if (typeof method === 'undefined') {
        return defaultSettings.method;
    }
    switch (method) {
        case 'gool':
            return 'gool';
        case 'psiphon':
            return 'psiphon';
        default:
            return 'warp';
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

export const exitTheApp = async () => {
    log.info('exiting the app...');

    // Emit 'wp-end' and wait
    ipcMain.emit('wp-end', true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Emit 'end-wp-and-exit-app' and wait
    ipcMain.emit('end-wp-and-exit-app');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // make sure to kill wp process before exit(for linux(windows and mac kill child processes by default))
    ipcMain.on('exit', () => {
        log.info('Exiting the application...');
        app.exit(0);
    });
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
