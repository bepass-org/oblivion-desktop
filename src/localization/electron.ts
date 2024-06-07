import { ipcRenderer } from 'electron';

import enUS from './en';
import faIR from './fa';
import ruRU from './ru';
import cnCN from './cn';
import deDE from './de';
import { defaultSettings } from '../defaultSettings';

type LanguageType = 'fa' | 'en' | 'ru' | 'cn' | 'de';

const translate = {
    fa: faIR,
    en: enUS,
    ru: ruRU,
    cn: cnCN,
    de: deDE
};

export const getTranslateElectron = () => {
    const language = (
        ipcRenderer?.sendSync('lang') ? ipcRenderer?.sendSync('lang') : defaultSettings.lang
    ) as LanguageType;

    return translate[language];
};

