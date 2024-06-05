import { IpcMainEvent } from 'electron';
import settings from 'electron-settings';
import fs from 'fs';
import { countries, defaultSettings } from '../../defaultSettings';
import { doesDirectoryExist, removeDirIfExists } from './utils';
import { stuffPath } from '../ipcListeners/wp';

export const getUserSettings = async () => {
    const randomCountry = () => {
        const randomIndex = Math.floor(Math.random() * countries.length);
        return countries[randomIndex]?.value ? countries[randomIndex]?.value : 'DE';
    };

    // reading user settings for warp
    const args = [];
    //const scan = await settings.get('scan');
    const endpoint = await settings.get('endpoint');
    const ipType = await settings.get('ipType');
    const port = await settings.get('port');
    //const psiphon = await settings.get('psiphon');
    const location = await settings.get('location');
    const license = await settings.get('license');
    //const gool = await settings.get('gool');
    const method = await settings.get('method');
    const hostIP = await settings.get('hostIP');
    const rtt = await settings.get('rtt');
    const reserved = await settings.get('reserved');

    // ! push one arg(flag) at a time
    // https://stackoverflow.com/questions/55328916/electron-run-shell-commands-with-arguments

    // hostIP & port
    args.push('--bind');
    args.push(
        `${typeof hostIP === 'string' && hostIP.length > 0 ? hostIP : defaultSettings.hostIP}:${typeof port === 'string' || typeof port === 'number' ? port : defaultSettings.port}`
    );
    // license
    if (typeof license === 'string' && license !== '') {
        args.push('--key');
        args.push(license);
    }

    // TODO refactor
    // gool or psiphon
    if (typeof method === 'string') {
        if (method === 'gool') {
            args.push('--gool');
        } else if (method === 'psiphon') {
            args.push(`--cfon`);
            if (typeof location === 'string' && location !== '') {
                args.push('--country');
                args.push(location);
            } else {
                args.push('--country');
                args.push(randomCountry());
            }
        }
    } else {
        args.push('--gool');
    }
    // scan
    if (
        (typeof endpoint === 'string' &&
            (endpoint === '' || endpoint === defaultSettings.endpoint)) ||
        typeof endpoint === 'undefined'
    ) {
        args.push(`--scan`);
        if (typeof ipType === 'string' && ipType !== '') {
            args.push(ipType);
        }
        if (typeof rtt === 'string') {
            args.push('--rtt');
            args.push(rtt);
        }
    } else {
        // endpoint
        args.push('--endpoint');
        args.push(
            typeof endpoint === 'string' && endpoint.length > 0
                ? endpoint
                : defaultSettings.endpoint
        );
    }
    if (typeof reserved === 'boolean' && !reserved) {
        args.push('--reserved');
        args.push('0,0,0');
    }

    return args;
};

export const setStuffPath = (args: string[]) => {
    args.push('--cache-dir');
    args.push(stuffPath);
    doesDirectoryExist(stuffPath).then((isExist) => {
        if (!isExist)
            fs.mkdir(stuffPath, { recursive: true }, (err) => {
                if (err) {
                    console.error(`Error creating directory ${stuffPath}:`, err);
                }
            });
    });
};

// ! make sure you get the args like ({ port = '' })
export const wpErrorTranslation: any = {
    'bind: address already in use': ({ port = '' }) => {
        // TODO locale
        return `Port ${port} is being used by another program; Change it.`;
    },
    'Only one usage of each socket address': () => {
        // TODO locale
        return `Use another port.`;
    },
    'Invalid license': () => {
        // TODO locale
        return `the entered license is not valid; Remove it.`;
    },
    'Too many connected devices': () => {
        // TODO locale
        return `the license usage limit is filled; Remove it.`;
    },
    'Access is denied': () => {
        // TODO locale
        return `Run the program as Run as Administrator.`;
    },
    'failed to set endpoint': () => {
        // TODO locale
        return `Check or replace the endpoint value, or try again.`;
    },
    'load primary warp identity': () => {
        // TODO locale
        return `Authentication error in cloudflare; Try again.`;
    },
    'script failed to run': () => {
        // TODO locale
        return `the program encountered an error; Try again.`;
    },
    'object null is not iterable': () => {
        // TODO locale
        return `the program encountered an error; Try again.`;
    },
    'parse args: unknown flag': () => {
        // TODO locale
        return `an invalid command was executed in the background.`;
    },
    'context deadline exceeded': () => {
        // TODO locale
        return `Connection timed out; Try again.`;
    }
};

export const handleWpErrors = (strData: string, ipcEvent: IpcMainEvent, port: string) => {
    Object.keys(wpErrorTranslation).forEach((errorMsg: string) => {
        if (strData.includes(errorMsg)) {
            ipcEvent.reply(
                'guide-toast',
                wpErrorTranslation[errorMsg]({
                    port: port,
                    // keys will only use the value they need and ignore reset so pass any arg you want here
                    thisWillGetPassedButWillNotCauseError: 'some value'
                })
            );
            removeDirIfExists(stuffPath);
        }
    });
};
