import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export const wpLogPath = path.join(app.getPath('logs'), 'warp-plus.log');

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
