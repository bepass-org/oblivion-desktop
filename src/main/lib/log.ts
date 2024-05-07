import fs from 'fs';
import { wpLogPath } from '../ipcListeners/log';

export function readLogFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(wpLogPath, 'utf8', (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export function writeToLogFile(message: string) {
    return new Promise((resolve, reject) => {
        fs.writeFile(wpLogPath, message + '\n', (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

export function appendToLogFile(message: string) {
    return new Promise((resolve, reject) => {
        fs.appendFile(wpLogPath, message + '\n', (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}
