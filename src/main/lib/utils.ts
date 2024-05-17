const fs = require('fs');

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
    let bool = false;
    if (
        typeof proxyMode === 'undefined' ||
        (typeof proxyMode === 'string' && proxyMode === 'system')
    ) {
        bool = true;
    }
    return bool;
}
