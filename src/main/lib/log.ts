const fs = require('fs');

export function readLogFile() {
    return new Promise((resolve, reject) => {
        fs.readFile('log.txt', 'utf8', (err: any, data: any) => {
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
        fs.writeFile('log.txt', message + '\n', (err: any) => {
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
        fs.appendFile('log.txt', message + '\n', (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}
