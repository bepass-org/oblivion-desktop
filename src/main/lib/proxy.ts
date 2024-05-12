import settings from 'electron-settings';
import { IpcMainEvent } from 'electron';
import { defaultSettings } from '../../defaultSettings';
import { appLog } from './log';

const { spawn } = require('child_process');

// tweaking windows proxy settings using powershell
const windowsProxySettings = (args: string[], ipcEvent?: IpcMainEvent) => {
    const child = spawn('powershell', [
        'Set-ItemProperty',
        '-Path',
        "'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'",
        ...args
    ]);

    return new Promise<void>((resolve, reject) => {
        child.on('exit', (e: any) => {
            resolve();
        });

        child.stderr.on('data', (err: any) => {
            appLog(`err ${err.toString()}`);
            reject(err);
        });

        child.on('error', (err: any) => {
            appLog(err);
            reject(err);
            if (typeof ipcEvent !== 'undefined' && String(err).includes('powershell')) {
                ipcEvent.reply(
                    'guide-toast',
                    `برنامه برای اجرا به نصب نرم‌افزار Powershell نیاز دارد.`
                );
            }
        });
    });
};

const macOSProxySettings = (args: string[]) => {
    const child = spawn('networksetup', args);

    return new Promise<void>((resolve, reject) => {
        child.on('exit', () => {
            resolve();
        });

        child.stderr.on('data', (err: any) => {
            appLog(`Error: ${err.toString()}`);
            reject(err);
        });

        child.on('error', (err: any) => {
            appLog(`Spawn Error: ${err}`);
            reject(err);
        });
    });
};

export const enableProxy = async (ipcEvent?: IpcMainEvent) => {
    //const psiphon = (await settings.get('psiphon')) || defaultSettings.psiphon;
    const method = (await settings.get('method')) || defaultSettings.method;
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;
    const port = (await settings.get('port')) || defaultSettings.port;

    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await windowsProxySettings(
                    [
                        'ProxyServer',
                        '-value',
                        `${method === 'psiphon' ? 'socks=' : ''}${hostIP.toString()}:${port.toString()}`
                    ],
                    ipcEvent
                );
                await windowsProxySettings(
                    [
                        'ProxyOverride',
                        '"localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>"'
                    ],
                    ipcEvent
                );
                await windowsProxySettings(['ProxyEnable', '-value', '1'], ipcEvent);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    } else if (process.platform === 'darwin') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await macOSProxySettings([
                    '-setsocksfirewallproxy',
                    'Wi-Fi',
                    hostIP.toString(),
                    port.toString()
                ]);
                await macOSProxySettings([
                    '-setproxybypassdomains',
                    'Wi-Fi',
                    'localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>'
                ]);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    } else {
        appLog('Proxy setting not supported on your platform');
    }
};

export const disableProxy = async (ipcEvent?: IpcMainEvent) => {
    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await windowsProxySettings(['ProxyEnable', '-value', '0'], ipcEvent);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    } else if (process.platform === 'darwin') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await macOSProxySettings(['-setsocksfirewallproxy', 'Wi-Fi', 'off']);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    } else {
        appLog('changing proxy is not supported on your platform yet');
    }
};
