import { getDirectionByLang } from '../../localization';
import { defaultSettings } from '../../defaultSettings';
import { settings } from './settings';

export const clearUpdateNotifOnStartup = () => {
    if (typeof window === 'undefined') return;
    localStorage?.removeItem('OBLIVION_CHECKUPDATE');
    localStorage?.removeItem('OBLIVION_NEWUPDATE');
};

const detectingSystemTheme =
    typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;

export const loadTheme = () => {
    settings.get('theme').then((theme) => {
        document.documentElement.setAttribute(
            'data-bs-theme',
            typeof theme === 'undefined' ? (detectingSystemTheme ? 'dark' : 'light') : theme
        );
    });
};

export const loadLang = () => {
    settings.get('lang').then((data) => {
        if (typeof data === 'undefined') {
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
export const loadSettings = () => {
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
    settings
        .getMultiple(keyList)
        .then(async (values) => {
            for (const key of keyList) {
                if (key === 'theme') {
                    if (typeof values['theme'] === 'undefined') {
                        const defaultTheme = detectingSystemTheme ? 'dark' : 'light';
                        await settings.set('theme', defaultTheme);
                    }
                } else {
                    if (typeof values[key] === 'undefined') {
                        await settings.set(key, defaultSettings[key]);
                    }
                }
            }
        })
        .catch((error) => {
            console.error('Error fetching settings:', error);
        });
};
