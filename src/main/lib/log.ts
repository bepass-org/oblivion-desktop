import fs from 'fs';
import { logPath } from '../ipcListeners/log';
import { doesFileExist } from './utils';

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

export function writeToLogFile(message: string) {
    return new Promise((resolve, reject) => {
        fs.writeFile(logPath, message + '\n', (err: any) => {
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
        fs.appendFile(logPath, message + '\n', (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

export async function appLog(message: string) {
    const isLogFileExist = await doesFileExist(logPath);
    if (!isLogFileExist) {
        return writeToLogFile(message + '\n');
    } else {
        return appendToLogFile(message + '\n');
    }
}
