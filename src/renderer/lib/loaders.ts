import {  getDirectionByLang } from '../../localization';
import { settings } from './settings';
import { store } from './utils';

// import fa from '../../locale/fa.json';
// import en from '../../locale/en.json';
// import ru from '../../locale/ru.json';
// import cn from '../../locale/cn.json';
// import de from '../../locale/de.json';

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
    settings.get('lang').then((data) => {
        store.set('lang', data);
        const langDir = getDirectionByLang(data);
        document.documentElement.setAttribute('lang', data);
        document.documentElement.setAttribute('dir', langDir);
    });
};
