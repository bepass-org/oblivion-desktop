import { ipcRenderer } from 'electron';

import enUS from './en';
import faIR from './fa';
import ruRU from './ru';
import cnCN from './cn';
import trTR from './tr';
import idID from './id';
import arSA from './ar';
import viVN from './vi';
import ptBR from './pt';
import urPK from './ur';
import { defaultSettings } from '../defaultSettings';

type LanguageType = 'fa' | 'en' | 'ru' | 'cn' | 'tr' | 'id' | 'ar' | 'vi' | 'pt' | 'ur';

const translate = {
    fa: faIR,
    en: enUS,
    ru: ruRU,
    cn: cnCN,
    tr: trTR,
    id: idID,
    ar: arSA,
    vi: viVN,
    pt: ptBR,
    ur: urPK
};

export const getTranslateElectron = () => {
    const language = (
        ipcRenderer?.sendSync('lang') ? ipcRenderer?.sendSync('lang') : defaultSettings.lang
    ) as LanguageType;

    return translate[language];
};
