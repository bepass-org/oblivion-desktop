import settings from 'electron-settings';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import path from 'path';
import regedit, { RegistryPutItem } from 'regedit';
import { defaultSettings } from '../../defaultSettings';
import { shouldProxySystem } from './utils';

const { spawn } = require('child_process');

// TODO reset to prev proxy settings on disable

// tweaking windows proxy settings using regedit
const windowsProxySettings = (
    args: RegistryPutItem,
    regeditVbsDirPath: string,
    ipcEvent?: IpcMainEvent
) => {
    return new Promise<void>((resolve, reject) => {
        try {
            regedit.setExternalVBSLocation(regeditVbsDirPath);
            regedit.putValue(
                {
                    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings': {
                        ...args
                    }
                },
                () => {
                    resolve();
                }
            );
        } catch (error) {
            reject(error);
        }
    });

    // const child = spawn('powershell', [
    //     'Set-ItemProperty',
    //     '-Path',
    //     "'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'",
    //     ...args
    // ]);

    // return new Promise<void>((resolve, reject) => {
    //     child.on('exit', (e: any) => {
    //         resolve();
    //     });

    //     child.stderr.on('data', (err: any) => {
    //         log.error(`err ${err.toString()}`);
    //         reject(err);
    //     });

    //     child.on('error', (err: any) => {
    //         log.error(err);
    //         reject(err);
    //         if (typeof ipcEvent !== 'undefined' && String(err).includes('powershell')) {
    //             ipcEvent.reply(
    //                 'guide-toast',
    //                 `برنامه برای اجرا به نصب نرم‌افزار Powershell نیاز دارد.`
    //             );
    //         }
    //     });
    // });
};

const macOSProxySettings = (args: string[]) => {
    const child = spawn('networksetup', args);

    return new Promise<void>((resolve, reject) => {
        child.on('exit', () => {
            resolve();
        });

        child.stderr.on('data', (err: any) => {
            log.error(`Error: ${err.toString()}`);
            reject(err);
        });

        child.on('error', (err: any) => {
            log.error(`Spawn Error: ${err}`);
            reject(err);
        });
    });
};

export const enableProxy = async (regeditVbsDirPath: string, ipcEvent?: IpcMainEvent) => {
    const proxyMode = await settings.get('proxyMode');
    if (!shouldProxySystem(proxyMode)) {
        log.info('skipping set system proxy');
        return;
    }

    log.info('trying to set system proxy...');

    //const psiphon = (await settings.get('psiphon')) || defaultSettings.psiphon;
    const method = (await settings.get('method')) || defaultSettings.method;
    //const proxyMode = (await settings.get('proxyMode')) || defaultSettings.proxyMode;
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;
    const port = (await settings.get('port')) || defaultSettings.port;

    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await windowsProxySettings(
                    {
                        ProxyServer: {
                            type: 'REG_SZ',
                            value: `${method === 'psiphon' ? 'socks=' : ''}${hostIP.toString()}:${port.toString()}`
                        },
                        ProxyOverride: {
                            type: 'REG_SZ',
                            // TODO read from user settings
                            value: 'localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>'
                        },
                        ProxyEnable: {
                            type: 'REG_DWORD',
                            value: 1
                        }
                    },
                    regeditVbsDirPath
                );
                // await windowsProxySettings(
                //     [
                //         'ProxyServer',
                //         '-value',
                //         `${method === 'psiphon' ? 'socks=' : ''}${hostIP.toString()}:${port.toString()}`
                //     ],
                //     ipcEvent
                // );
                // await windowsProxySettings(
                //     [
                //         'ProxyOverride',
                //         '"localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>"'
                //     ],
                //     ipcEvent
                // );
                // await windowsProxySettings(['ProxyEnable', '-value', '1'], ipcEvent);
                log.info('proxy has been set for your system successfully!');

                resolve();
            } catch (error) {
                log.error(`error while trying to set system proxy: , ${JSON.stringify(error)}`);
                reject(error);
                ipcEvent?.reply('guide-toast', `پیکربندی پروکسی با خطا روبرو شد!`);
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
                    // TODO read from user settings
                    'localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>'
                ]);
                log.info('proxy has been set for your system successfully!');
                resolve();
            } catch (error) {
                log.error(`error while trying to set system proxy: , ${JSON.stringify(error)}`);
                reject(error);
                ipcEvent?.reply('guide-toast', `پیکربندی پروکسی با خطا روبرو شد!`);
            }
        });
    } else {
        return new Promise<void>((resolve, reject) => {
            log.error('changing proxy is not supported on your platform yet...');
            ipcEvent?.reply(
                'guide-toast',
                `پیکربندی پروکسی در سیستم‌عامل شما پشتیبانی نمیشود، اما می‌توانید به‌صورت دستی از پروکسی وارپ استفاده کنید.`
            );
            resolve();
        });
    }
};

export const disableProxy = async (regeditVbsDirPath: string, ipcEvent?: IpcMainEvent) => {
    const proxyMode = await settings.get('proxyMode');
    if (!shouldProxySystem(proxyMode)) {
        log.info('skipping disabling system proxy');
        return;
    }

    log.info('trying to disable system proxy...');

    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await windowsProxySettings(
                    {
                        ProxyEnable: {
                            type: 'REG_DWORD',
                            value: 0
                        }
                    },
                    regeditVbsDirPath
                );
                // await windowsProxySettings(['ProxyEnable', '-value', '0'], ipcEvent);
                log.info('proxy has been disabled for your system successfully!');
                resolve();
            } catch (error) {
                log.error(`error while trying to disable system proxy: , ${JSON.stringify(error)}`);
                reject(error);
                ipcEvent?.reply('guide-toast', `پیکربندی پروکسی با خطا روبرو شد!`);
            }
        });
    } else if (process.platform === 'darwin') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await macOSProxySettings(['-setsocksfirewallproxy', 'Wi-Fi', 'off']);
                log.info('proxy has been disabled for your system successfully!');
                resolve();
            } catch (error) {
                log.error(`error while trying to disable system proxy: , ${JSON.stringify(error)}`);
                reject(error);
                ipcEvent?.reply('guide-toast', `پیکربندی پروکسی با خطا روبرو شد!`);
            }
        });
    } else {
        return new Promise<void>((resolve, reject) => {
            log.error('changing proxy is not supported on your platform yet...');
            resolve();
        });
    }
};
