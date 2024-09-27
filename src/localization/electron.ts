import { ipcRenderer } from 'electron';

import enUS from './en';
import faIR from './fa';
import ruRU from './ru';
import cnCN from './cn';
import deDE from './de';
import trTR from './tr';
import idID from './id';
import arSA from './ar';
import viVN from './vi';
import ptBR from './pt';
import { defaultSettings } from '../defaultSettings';

type LanguageType = 'fa' | 'en' | 'ru' | 'cn' | 'de' | 'tr' | 'id' | 'ar' | 'vi' | 'pt';

const translate = {
    fa: faIR,
    en: enUS,
    ru: ruRU,
    cn: cnCN,
    de: deDE,
    tr: trTR,
    id: idID,
    ar: arSA,
    vi: viVN,
    pt: ptBR
};

export const getTranslateElectron = () => {
    const language = (
        ipcRenderer?.sendSync('lang') ? ipcRenderer?.sendSync('lang') : defaultSettings.lang
    ) as LanguageType;

    return translate[language];
};
