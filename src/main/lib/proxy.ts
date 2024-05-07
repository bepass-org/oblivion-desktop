import settings from 'electron-settings';
import { defaultSettings } from '../../defaultSettings';

const { spawn } = require('child_process');

// tweaking windows proxy settings using powershell
const windowsProxySettings = (args: string[]) => {
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
            console.log('err', err.toString());
            reject(err);
        });
    });
};

export const disableProxy = async () => {
    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await windowsProxySettings(['ProxyEnable', '-value', '0']);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    } else {
        console.log('changing proxy is not supported on your platform yet');
    }
};

export const enableProxy = async () => {
    //const psiphon = (await settings.get('psiphon')) || defaultSettings.psiphon;
    const method = (await settings.get('method')) || defaultSettings.method;
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;
    const port = (await settings.get('port')) || defaultSettings.port;

    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await windowsProxySettings([
                    'ProxyServer',
                    '-value',
                    `${method === 'psiphon' ? 'socks=' : ''}${hostIP}:${port}`
                ]);
                await windowsProxySettings([
                    'ProxyOverride',
                    '"localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>"'
                ]);
                await windowsProxySettings(['ProxyEnable', '-value', '1']);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    } else {
        console.log('🚀 - enableProxy - port:', port);
        console.log('changing proxy is not supported on your platform yet');
    }
};
