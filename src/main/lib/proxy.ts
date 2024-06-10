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
import { getTranslate } from '../../localization';

const execPromise = promisify(exec);

const { spawn } = require('child_process');

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

const isGnome = (): boolean => {
    try {
        exec('gsettings --version');
        log.info(`gsettings found!`);
        return true;
    } catch (error) {
        return false;
    }
};

const isKDE = async () => {
    const checkKwriteConfig = async (v = '5') => {
        return new Promise((resolve) => {
            try {
                exec(`kwriteconfig${v} --help`, (err) => {
                    if (!err) {
                        log.info(`kwriteconfig${v} found!`);
                        resolve(v);
                    } else {
                        resolve(false);
                    }
                });
            } catch (error) {
                resolve(false);
            }
        });
    };

    return new Promise(async (resolve) => {
        const isPlasma5 = await checkKwriteConfig('5');
        const isPlasma6 = await checkKwriteConfig('6');

        if (typeof isPlasma5 === 'string' && isPlasma5 === '5') resolve(isPlasma5);
        else if (typeof isPlasma6 === 'string' && isPlasma6 === '6') resolve(isPlasma6);
        else resolve(false);
    });
};

// TODO refactor
const enableGnomeProxy = async (ip: string, port: string, routingRules: any): Promise<void> => {
    const proxySettings = {
        mode: 'manual',
        socks: `socks5://${ip}:${port}`,
        host: ip,
        port: port
    };

    try {
        await execPromise(`gsettings set org.gnome.system.proxy mode '${proxySettings.mode}'`);

        await execPromise(`gsettings set org.gnome.system.proxy.socks host ${proxySettings.host}`);

        await execPromise(`gsettings set org.gnome.system.proxy.socks port ${proxySettings.port}`);

        // https://wiki.archlinux.org/title/Proxy_server#Proxy_settings_on_GNOME3
        const normalizeRoutingRules = (rules: any) => {
            let str = `"[`;
            const arrRules = String(rules).split(',');
            arrRules.forEach((r, index) => {
                if (index === arrRules.length - 1) {
                    str += `'${r}'`;
                } else {
                    str += `'${r}', `;
                }
            });
            str += `]"`;
            return str;
        };

        const normalizedRoutingRules = normalizeRoutingRules(routingRules);

        await execPromise(
            `gsettings set org.gnome.system.proxy ignore-hosts ${normalizedRoutingRules}`
        );
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

// TODO refactor
const enableKDEProxy = async (
    host: string,
    port: string,
    routingRules: any,
    v = '5'
): Promise<void> => {
    try {
        await execPromise(
            `kwriteconfig${v} --file kioslaverc --group "Proxy Settings" --key ProxyType 1`
        );
        await execPromise(
            `kwriteconfig${v} --file kioslaverc --group "Proxy Settings" --key socksProxy "${host}:${port}"`
        );
        await execPromise(
            `kwriteconfig${v} --file kioslaverc --group "Proxy Settings" --key Authmode 0`
        );
        await execPromise(
            `kwriteconfig${v} --file kioslaverc --group "Proxy Settings" --key NoProxyFor '${routingRules}'`
        );
    } catch (err) {
        log.error(`Error setting SOCKS proxy for KDE: ${err}`);
        throw err;
    }
};

const disableKDEProxy = async (v = '5'): Promise<string> => {
    try {
        await execPromise(
            `kwriteconfig${v} --file kioslaverc --group "Proxy Settings" --key ProxyType 0`
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

const appLang = getTranslate('en');
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
        let notSupported = true;
        let shouldResolve = false;
        return new Promise<void>(async (resolve, reject) => {
            if (isGnome()) {
                await enableGnomeProxy(
                    hostIP.toString(),
                    port.toString(),
                    setRoutingRules(routingRules)
                )
                    .then(() => {
                        notSupported = false;
                        log.info('Enabled proxy for GNOME.');
                        shouldResolve = true;
                    })
                    .catch(() => {
                        log.error('Failed to enable proxy for GNOME');
                        ipcEvent?.reply('guide-toast', appLang.log.error_configuration_encountered);
                    });
            }

            const plasmaVersion = await isKDE();
            if (typeof plasmaVersion === 'string') {
                await enableKDEProxy(
                    hostIP.toString(),
                    port.toString(),
                    setRoutingRules(routingRules),
                    plasmaVersion
                )
                    .then(() => {
                        notSupported = false;
                        log.info('Enabled proxy for KDE.');
                        shouldResolve = true;
                    })
                    .catch(() => {
                        log.error('Failed to enable proxy for KDE');
                        ipcEvent?.reply('guide-toast', appLang.log.error_configuration_encountered);
                        reject();
                    });
            }
            if (shouldResolve) {
                resolve();
            } else {
                reject();
            }
            if (notSupported) {
                log.error('Desktop Environment not supported.');
                ipcEvent?.reply('guide-toast', appLang.log.error_desktop_not_supported);
                reject();
            }
        });
    } else {
        return new Promise<void>((resolve) => {
            log.error('system proxy is not supported on your platform.');
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
        let notSupported = true;
        let shouldResolve = false;
        return new Promise<void>(async (resolve, reject) => {
            if (isGnome()) {
                await disableGNOMEProxy()
                    .then(() => {
                        notSupported = false;
                        log.info('Disabled proxy for GNOME.');
                        shouldResolve = true;
                    })
                    .catch(() => {
                        log.error('Failed to disabled proxy for GNOME');
                        shouldResolve = false;
                    });
            }

            const plasmaVersion = await isKDE();
            if (typeof plasmaVersion === 'string') {
                await disableKDEProxy(plasmaVersion)
                    .then(() => {
                        notSupported = false;
                        log.info('Disabled proxy for KDE.');
                        shouldResolve = true;
                    })
                    .catch(() => {
                        log.error('Failed to disabled proxy for KDE');
                        shouldResolve = false;
                    });
            }
            if (shouldResolve) resolve();
            if (notSupported) {
                log.error('Desktop Environment not supported.');
                ipcEvent?.reply('guide-toast', appLang.log.error_desktop_not_supported);
                reject();
            }
        });
    } else {
        return new Promise<void>((resolve) => {
            log.error('system proxy is not supported on your platform.');
            resolve();
        });
    }
};
