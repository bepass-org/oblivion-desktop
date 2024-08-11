import { getDirectionByLang } from '../../localization';
import { getIspName } from './getIspName';
import { settings } from './settings';

export const loadTheme = () => {
    const detectingSystemTheme = window?.matchMedia('(prefers-color-scheme: dark)')?.matches;
    settings.get('theme').then((theme) => {
        document.documentElement.setAttribute(
            'data-bs-theme',
            typeof theme === 'undefined' ? (detectingSystemTheme ? 'dark' : 'light') : theme
        );
    });
};

const date = new Date();
const getTimeZone = date?.toString().toLowerCase();

export const loadLang = () => {
    settings.get('lang').then((data) => {
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', getTimeZone?.includes('iran') ? 'fa' : 'en');
        }

        const langDir = getDirectionByLang(data);
        document.documentElement.setAttribute('lang', data);
        document.documentElement.setAttribute('dir', langDir);
    });
};
