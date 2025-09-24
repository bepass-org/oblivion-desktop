import { getDirectionByLang } from '../../localization';
import { defaultSettings } from '../../defaultSettings';
import { settings } from './settings';
import { typeIsUndefined } from './isAnyUndefined';

const detectingSystemTheme =
    typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;

export const loadTheme = () => {
    settings.get('theme').then((theme) => {
        document.documentElement.setAttribute(
            'data-bs-theme',
            typeIsUndefined(theme) ? (detectingSystemTheme ? 'dark' : 'light') : theme
        );
    });
};

export const loadLang = () => {
    settings.get('lang').then((data) => {
        if (typeIsUndefined(data)) {
            data = defaultSettings.lang;
        }
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', data);
        }
        const langDir = getDirectionByLang(data);
        document.documentElement.setAttribute('lang', data);
        document.documentElement.setAttribute('dir', langDir);
    });
};

type SettingsKeys = keyof typeof defaultSettings;
export const loadSettings = async () => {
    const keyList: SettingsKeys[] = [
        'hostIP',
        'port',
        'method',
        'proxyMode',
        'ipData',
        'reserved',
        'closeHelper',
        'restartCounter',
        'testUrl',
        'lang',
        'theme'
    ];
    try {
        const values = await settings.getMultiple(keyList);
        // eslint-disable-next-line no-restricted-syntax
        for (const key of keyList) {
            const value = values[key];
            if (typeIsUndefined(value)) {
                if (key === 'theme') {
                    const defaultTheme = detectingSystemTheme ? 'dark' : 'light';
                    // eslint-disable-next-line no-await-in-loop
                    await settings.set(key, defaultTheme);
                } else {
                    // eslint-disable-next-line no-await-in-loop
                    await settings.set(key, defaultSettings[key]);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
};
