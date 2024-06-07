import settings from 'electron-settings';
import { IpcMainEvent } from 'electron';
import log from 'electron-log';
import regeditModule, { RegistryPutItem, promisified as regedit } from 'regedit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { defaultSettings } from '../../defaultSettings';
import { shouldProxySystem } from './utils';
import { createPacScript, killPacScriptServer, servePacScript } from './pacScript';
import { getTranslateElectron } from '../../localization/electron';

const execPromise = promisify(exec);

const { spawn } = require('child_process');

// TODO reset to prev proxy settings on disable
// TODO refactor (move each os functions to it's own file)

// tweaking windows proxy settings using regedit
const windowsProxySettings = (args: RegistryPutItem, regeditVbsDirPath: string) => {
    regeditModule.setExternalVBSLocation(regeditVbsDirPath);

    return regedit.putValue({
        'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings': {
            ...args
        }
    });
};

// const systemCheckGSettingsDeps = (): boolean => {
//     try {
//         exec('gsettings --version');
//         return true;
//     } catch (error) {
//         return false;
//     }
// };

// const systemCheckKWriteDeps = (): boolean => {
//     try {
//         exec('kwriteconfig5 --version');
//         return true;
//     } catch (error) {
//         return false;
//     }
// };

const detectDesktopEnvironment = () => {
    return new Promise((resolve, reject) => {
        exec('echo $DESKTOP_SESSION', (err, stdout) => {
            stdout = stdout.trim();
            if (err) {
                log.error(err);
                reject(err);
            }
            log.info('DE:', String(stdout));
            resolve(String(stdout));
        });
    });
};

const enableGnomeProxy = async (ip: string, port: string): Promise<void> => {
    const proxySettings = {
        mode: 'manual',
        socks: `socks5://${ip}:${port}`,
        host: ip,
        port: port
    };

    try {
        await execPromise(`gsettings set org.gnome.system.proxy mode '${proxySettings.mode}'`);
        log.info(`Proxy mode set to ${proxySettings.mode}`);

        await execPromise(`gsettings set org.gnome.system.proxy.socks host ${proxySettings.host}`);
        log.info(`SOCKS host set to ${proxySettings.host}`);

        await execPromise(`gsettings set org.gnome.system.proxy.socks port ${proxySettings.port}`);
        log.info(`SOCKS port set to ${proxySettings.port}`);

        log.info(`Proxy settings enabled for GNOME with SOCKS5 proxy: ${proxySettings.socks}`);
    } catch (err) {
        log.error(`Error setting proxy: ${err}`);
        throw err;
    }
};

const disableGNOMEProxy = async (): Promise<void> => {
    try {
        await execPromise(`gsettings set org.gnome.system.proxy mode 'none'`);
        log.info('Proxy settings disabled for GNOME');
    } catch (err) {
        log.error(`Error disabling proxy settings for GNOME: ${err}`);
        throw err;
    }
};

const enableKDEProxy = async (ip: string, port: string): Promise<void> => {
    const proxySettings = {
        socksProxy: `socks://${ip}:${port}`
    };

    try {
        await execPromise(
            `kwriteconfig5 --file kioslaverc --group 'Proxy Settings' --key 'socksProxy' '${proxySettings.socksProxy}'`
        );
        log.info(`Proxy settings enabled for KDE with SOCKS5 proxy: ${proxySettings.socksProxy}`);
    } catch (err) {
        log.error(`Error setting SOCKS proxy for KDE: ${err}`);
        throw err;
    }
};

const disableKDEProxy = async (): Promise<string> => {
    try {
        await execPromise(
            `kwriteconfig5 --file kioslaverc --group 'Proxy Settings' --key 'socksProxy' ''`
        );
        log.info('Proxy settings disabled for KDE');
        return 'Proxy disabled for KDE';
    } catch (error) {
        log.error(`Error disabling SOCKS proxy for KDE: ${error}`);
        throw error;
    }
};

// https://github.com/SagerNet/sing-box/blob/dev-next/common/settings/proxy_darwin.go
const macOSNetworkSetup = (args: string[]) => {
    const child = spawn('networksetup', args);

    return new Promise((resolve, reject) => {
        let output = '';
        child.stdout.on('data', async (data: any) => {
            const strData = data.toString();
            output += strData;
        });

        child.on('exit', () => {
            resolve(output);
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

const getMacOSActiveNetworkHardwarePorts = () => {
    return new Promise((resolve, reject) => {
        // REVIEW: convert this bash command to typescript using existing os API library.
        const command = `
        for interface in $(networksetup -listallhardwareports | awk '/Device/ {print $2}'); do
          if ifconfig $interface | grep -q "inet "; then
            networksetup -listallhardwareports | awk -v iface=$interface '
              /Hardware Port/ {port=$3; for(i=4;i<=NF;i++) port=port" "$i}
              /Device/ {if ($2 == iface) {print port}}'
          fi
        done
      `;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                log.error(`Error executing command: ${error}`);
                return reject(error.toString());
            }
            if (stderr) {
                log.error(`Error in command output: ${stderr}`);
                return reject(stderr.toString());
            }
            const results = stdout.trim().split('\n'); // Get all active hardware ports
            if (results.length > 0) {
                log.info(`Active Hardware Ports: ${results.join(', ')}`);
                resolve(results);
            } else {
                log.error('Active Network Devices not found.');
                reject('Active Network Devices not found.');
            }
        });
    });
};

const setRoutingRules = (value: any) => {
    const defValue =
        'localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>';
    if (typeof value === 'string' && value !== '') {
        const myRules = value
            .replace(/domain:/g, '')
            .replace(/geoip:/g, '')
            .replace(/ip:/g, '')
            .replace(/range:/g, '')
            .replace(/\n|<br>/g, '')
            .trim();
        return defValue + ',' + myRules;
    } else {
        return defValue;
    }
};

const appLang = getTranslateElectron();
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
    const routingRules = await settings.get('routingRules');

    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            try {
                let pacServeUrl = '';
                if (method === 'psiphon') {
                    await createPacScript(String(hostIP), String(port));
                    pacServeUrl = await servePacScript(Number(port) + 1);
                    log.info('pacServeUrl:', pacServeUrl);
                }

                await windowsProxySettings(
                    {
                        ProxyServer: {
                            type: 'REG_SZ',
                            value: `${method === 'psiphon' ? 'socks=' : ''}${hostIP.toString()}:${port.toString()}`
                        },
                        ProxyOverride: {
                            type: 'REG_SZ',
                            value: String(setRoutingRules(routingRules))
                        },
                        AutoConfigURL: {
                            type: 'REG_SZ',
                            value: `${method === 'psiphon' ? pacServeUrl + '/proxy.txt' : ''}`
                        },
                        ProxyEnable: {
                            type: 'REG_DWORD',
                            value: 1
                        }
                    },
                    regeditVbsDirPath
                );
                log.info('system proxy has been set.');

                resolve();
            } catch (error) {
                log.error(`error while trying to set system proxy: , ${error}`);
                reject(error);
                ipcEvent?.reply('guide-toast', appLang.log.error_configuration_encountered);
            }
        });
    } else if (process.platform === 'darwin') {
        return new Promise<void>(async (resolve) => {
            const hardwarePorts: string[] =
                (await getMacOSActiveNetworkHardwarePorts()) as string[];
            log.info('using hardwarePort:', hardwarePorts);
            hardwarePorts.forEach(async (hardwarePort) => {
                log.info('using hardwarePort:', hardwarePort);

                try {
                    await macOSNetworkSetup([
                        '-setsocksfirewallproxy',
                        hardwarePort,
                        hostIP.toString(),
                        port.toString()
                    ]);
                    await macOSNetworkSetup([
                        '-setproxybypassdomains',
                        hardwarePort,
                        String(setRoutingRules(routingRules))
                    ]);
                    await macOSNetworkSetup(['-setsocksfirewallproxystate', hardwarePort, 'on']);
                    log.info(`System proxy has been set for ${hardwarePort}.`);
                } catch (error) {
                    log.error(
                        `Error while trying to set system proxy for ${hardwarePort}: ${error}`
                    );
                    ipcEvent?.reply(
                        'guide-toast',
                        appLang.log.error_configuring_proxy(hardwarePort)
                    );
                }
            });
            resolve();
        });
    } else if (process.platform === 'linux') {
        return new Promise<void>(async (resolve, reject) => {
            const DE = await detectDesktopEnvironment();

            switch (DE) {
                case 'gnome':
                    await enableGnomeProxy(hostIP.toString(), port.toString())
                        .then(() => {
                            log.info('Successfully enabled proxy for GNOME');
                            resolve();
                        })
                        .catch(() => {
                            log.error('Failed to enable proxy for GNOME');
                            reject();
                        });
                    break;

                case 'plasma': // (kde)
                    await enableKDEProxy(hostIP.toString(), port.toString())
                        .then(() => {
                            log.info('Successfully enabled proxy for KDE');
                            resolve();
                        })
                        .catch(() => {
                            log.error('Failed to enable proxy for KDE');
                            ipcEvent?.reply(
                                'guide-toast',
                                appLang.log.error_configuration_encountered
                            );
                            reject();
                        });
                    break;

                default:
                    log.error('Desktop Environment not supported.');
                    ipcEvent?.reply('guide-toast', appLang.log.error_desktop_not_supported);
                    reject();
                    break;
            }
            // if (systemCheckGSettingsDeps()) {

            // } else if (systemCheckKWriteDeps()) {

            // } else {

            // }
        });
    } else {
        return new Promise<void>((resolve) => {
            log.error('system proxy is not supported on your platform yet...');
            ipcEvent?.reply('guide-toast', appLang.log.error_configuration_not_supported);
            resolve();
        });
    }
};

export const disableProxy = async (regeditVbsDirPath: string, ipcEvent?: IpcMainEvent) => {
    const proxyMode = await settings.get('proxyMode');
    if (!shouldProxySystem(proxyMode)) {
        log.info('skipping system proxy disable.');
        return;
    }

    const method = (await settings.get('method')) || defaultSettings.method;

    log.info('trying to disable system proxy...');

    if (process.platform === 'win32') {
        return new Promise<void>(async (resolve, reject) => {
            if (method === 'psiphon') {
                killPacScriptServer();
            }

            try {
                await windowsProxySettings(
                    {
                        AutoConfigURL: {
                            type: 'REG_SZ',
                            value: ''
                        },
                        // disable use script setup?
                        ProxyEnable: {
                            type: 'REG_DWORD',
                            value: 0
                        }
                    },
                    regeditVbsDirPath
                );
                log.info('system proxy has been disabled on your system.');
                resolve();
            } catch (error) {
                log.error(`error while trying to disable system proxy: , ${error}`);
                reject(error);
                ipcEvent?.reply('guide-toast', appLang.log.error_configuration_encountered);
            }
        });
    } else if (process.platform === 'darwin') {
        return new Promise<void>(async (resolve, reject) => {
            const hardwarePorts: string[] =
                (await getMacOSActiveNetworkHardwarePorts()) as string[];
            log.info('using hardwarePort:', hardwarePorts);
            hardwarePorts.forEach(async (hardwarePort) => {
                log.info('using hardwarePort:', hardwarePort);

                try {
                    await macOSNetworkSetup(['-setsocksfirewallproxy', hardwarePort, '']);
                    await macOSNetworkSetup(['-setsocksfirewallproxystate', hardwarePort, 'off']);
                    log.info('system proxy has been disabled on your system.');
                    resolve();
                } catch (error) {
                    log.error(`error while trying to disable system proxy: , ${error}`);
                    reject(error);
                    ipcEvent?.reply('guide-toast', appLang.log.error_configuration_encountered);
                }
            });
            resolve();
        });
    } else if (process.platform === 'linux') {
        return new Promise<void>(async (resolve, reject) => {
            const DE = await detectDesktopEnvironment();

            switch (DE) {
                case 'gnome':
                    await disableGNOMEProxy()
                        .then(() => {
                            log.info('Successfully disabled proxy for GNOME');
                            resolve();
                        })
                        .catch(() => {
                            log.error('Failed to disabled proxy for GNOME');
                            reject();
                        });
                    break;

                case 'plasma':
                    await disableKDEProxy()
                        .then(() => {
                            log.info('Successfully disabled proxy for KDE');
                            resolve();
                        })
                        .catch(() => {
                            log.error('Failed to disabled proxy for KDE');
                            reject();
                        });
                    break;

                default:
                    log.error('Desktop Environment not supported.');
                    ipcEvent?.reply('guide-toast', appLang.log.error_desktop_not_supported);
                    reject();
                    break;
            }

            // if (systemCheckGSettingsDeps()) {

            // } else if (systemCheckKWriteDeps()) {

            // } else {

            // }
        });
    } else {
        return new Promise<void>((resolve) => {
            log.error('system proxy is not supported on your platform yet...');
            resolve();
        });
    }
};
