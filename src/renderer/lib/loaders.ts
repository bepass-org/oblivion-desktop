import { defaultSettings } from '../../defaultSettings';
import { settings } from './settings';

import fa from '../../locale/fa.json';
import en from '../../locale/en.json';
import ru from '../../locale/ru.json';
import cn from '../../locale/cn.json';
import de from '../../locale/de.json';

export const loadTheme = () => {
    const detectingSystemTheme = window?.matchMedia('(prefers-color-scheme: dark)')?.matches;
    settings.get('theme').then((theme) => {
        document.documentElement.setAttribute(
            'data-bs-theme',
            typeof theme === 'undefined' ? (detectingSystemTheme ? 'dark' : 'light') : theme
        );
    });
};

export const loadLang = () => {
    settings.get('lang').then((value) => {
        let langData = {};
        let langDir = 'ltr';
        const key = typeof value !== 'undefined' ? value : defaultSettings.lang;
        if (key === 'fa') {
            langData = fa;
            langDir = 'rtl';
        } else if (key === 'en') {
            langData = en;
        } else if (key === 'cn') {
            langData = cn;
        } else if (key === 'ru') {
            langData = ru;
        } else if (key === 'de') {
            langData = de;
        }
        localStorage.setItem('OBLIVION_LANG', JSON.stringify(langData));
        document.documentElement.setAttribute('lang', key);
        document.documentElement.setAttribute('dir', langDir);
    });
};

export const getLang = () => {
    const lang = localStorage.getItem('OBLIVION_LANG');
    if (!lang || typeof lang === 'undefined') {
        loadLang();
        return;
    }
    return JSON.parse(String(lang));
};
