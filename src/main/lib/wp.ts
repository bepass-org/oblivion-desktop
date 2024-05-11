import { IpcMainEvent } from 'electron';
import settings from 'electron-settings';
import { countries, defaultSettings } from '../../defaultSettings';

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
    const hostIP = (await settings.get('hostIP')) || defaultSettings.hostIP;

    // ! push one arg(flag) at a time
    // https://stackoverflow.com/questions/55328916/electron-run-shell-commands-with-arguments
    // ipType
    if (typeof ipType === 'string' && ipType !== '') {
        args.push(ipType);
    }
    // port, hostIP
    args.push('--bind');
    args.push(
        typeof port === 'string' || typeof port === 'number'
            ? `${hostIP}:${port}`
            : `${hostIP}:${defaultSettings.port}`
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
        return `پورت ${port} توسط برنامه دیگری درحال استفاده است؛ پورت دیگری را از تنظیمات برنامه انتخاب کنید.`;
    },
    'Invalid license': () => {
        return `لایسنس وارد شده معتبر نیست.`;
    },
    'Too many connected devices': () => {
        return `سقف استفاده از لایسنس پر شده است.`;
    },
    'Access is denied': () => {
        return `مسیر stuff یافت نشد؛ برنامه را به‌صورت Run as Administrator اجرا کنید.`;
    },
    'failed to set endpoint': () => {
        return `تنظیم‌کردن اندپوینت با خطا مواجه شد؛ از اندپوینت پیشفرض استفاده کنید.`;
    },
    /*'load primary warp identity': () => {
        return `هویت‌سنجی در کلودفلر با خطا مواجه شد.`;
    },*/
    'script failed to run': () => {
        return `برنامه با خطا مواجه شد؛ مجدداً تلاش کنید.`;
    },
    'object null is not iterable': () => {
        return `برنامه با خطا مواجه شد؛ مجدداً تلاش کنید.`;
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
        }
    });
};
