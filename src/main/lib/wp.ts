import { IpcMainEvent } from 'electron';
import settings from 'electron-settings';
import { countries, defaultSettings } from '../../defaultSettings';
import { removeDirIfExists } from './utils';
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

    // ! push one arg(flag) at a time
    // https://stackoverflow.com/questions/55328916/electron-run-shell-commands-with-arguments
    // ipType
    if (typeof ipType === 'string' && ipType !== '') {
        args.push(ipType);
    }
    // port, hostIP
    args.push('--bind');
    args.push(
        `${typeof hostIP === 'string' && hostIP.length > 0 ? hostIP : defaultSettings.hostIP}:${typeof port === 'string' || typeof port === 'number' ? port : defaultSettings.port}`
    );
    // license
    if (typeof license === 'string' && license !== '') {
        args.push('--key');
        args.push(license);
    }
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
    } else {
        // endpoint
        args.push('--endpoint');
        args.push(
            typeof endpoint === 'string' && endpoint.length > 0
                ? endpoint
                : defaultSettings.endpoint
        );
    }

    return args;
};

// ! make sure you get the args like ({ port = '' })
export const wpErrorTranslation: any = {
    'bind: address already in use': ({ port = '' }) => {
        return `پورت ${port} توسط برنامه دیگری درحال استفاده است؛ آن‌را تغییر دهید.`;
    },
    'Invalid license': () => {
        return `لایسنس وارد شده معتبر نیست؛ آن‌را حذف کنید.`;
    },
    'Too many connected devices': () => {
        return `سقف استفاده از لایسنس پر شده؛ آن‌را حذف کنید.`;
    },
    'Access is denied': () => {
        return `برنامه را به‌صورت Run as Administrator اجرا کنید.`;
    },
    'failed to set endpoint': () => {
        return `خطای تنظیم اندپوینت؛ مقدار آن‌را بررسی کرده یا دوباره تلاش کنید.`;
    },
    'load primary warp identity': () => {
        return `خطای احراز هویت در کلودفلر؛ دوباره تلاش کنید.`;
    },
    'script failed to run': () => {
        return `برنامه با خطا مواجه شد؛ دوباره تلاش کنید.`;
    },
    'object null is not iterable': () => {
        return `برنامه با خطا مواجه شد؛ دوباره تلاش کنید.`;
    },
    'parse args: unknown flag': () => {
        return `یک دستور نادرست در پس‌زمینه اجرا شده است.`;
    },
    'context deadline exceeded': () => {
        return `مهلت اتصال پایان یافت؛ دوباره تلاش کنید.`;
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
