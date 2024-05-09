import { defaultSettings } from '../../defaultSettings';
import { settings } from './settings';

import fa from '../../locale/fa.json';
import en from '../../locale/en.json';

export const loadTheme = () => {
    settings.get('theme').then((theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme || defaultSettings.theme);
    });
};

export const loadLang = () => {
    settings.get('lang').then((value) => {
        let langData = {};
        let langDir = '';
        const key = (typeof value !== 'undefined' ? value : defaultSettings.lang);
        if (key === 'fa') {
            langData = fa;
            langDir = 'rtl';
        } else if (key === 'en') {
            langData = en;
            langDir = 'ltr';
        }
        localStorage.setItem('OBLIVION_LANG', JSON.stringify(langData));
        document.documentElement.setAttribute('lang', key);
        document.documentElement.setAttribute('dir', langDir);
    });
};
