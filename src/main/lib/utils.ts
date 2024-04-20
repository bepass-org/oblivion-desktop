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
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err: any) => {
            if (err && err.code === 'ENOENT') {
                resolve(false);
            } else if (err) {
                reject(err);
            } else {
                fs.unlink(filePath, (err2: any) => {
                    if (err2) {
                        reject(err2);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
    });
}
