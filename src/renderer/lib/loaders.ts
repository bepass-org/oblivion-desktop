import { defaultSettings } from '../../defaultSettings';
import { settings } from './settings';

export const loadTheme = () => {
    settings.get('theme').then((theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme || defaultSettings.theme);
    });
};
