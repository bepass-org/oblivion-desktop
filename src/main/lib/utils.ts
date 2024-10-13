import fs from 'fs';
import { BrowserWindow, app, ipcMain } from 'electron';
import log from 'electron-log';
import { powerShellRelease } from 'systeminformation';
import { defaultSettings } from '../../defaultSettings';

export const isDev = () => process.env.NODE_ENV === 'development';

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

// TODO refactor/remove
export function calculateMethod(method: any) {
    switch (method) {
        case 'gool':
            return 'gool';
        case 'psiphon':
            return 'psiphon';

        default:
            return 'warp';
    }
}

export const exitTheApp = async (mainWindow: BrowserWindow | null) => {
    log.info('exiting the app...');
    if (mainWindow) {
        mainWindow.hide();
    }

    // make sure to kill wp process before exit(for linux(windows and mac kill child processes by default))
    ipcMain.on('exit', () => {
        if (process.platform === 'win32') {
            powerShellRelease();
        }
        app.exit(0);
    });

    ipcMain.emit('end-wp-and-exit-app');
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
