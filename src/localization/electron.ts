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
import esCU from './es';
import amET from './am';
import myMM from './my';
import { defaultSettings } from '../defaultSettings';

type LanguageType =
    | 'fa'
    | 'en'
    | 'ru'
    | 'cn'
    | 'tr'
    | 'id'
    | 'ar'
    | 'vi'
    | 'pt'
    | 'ur'
    | 'es'
    | 'am'
    | 'my';

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
    ur: urPK,
    es: esCU,
    am: amET,
    my: myMM
};

export const getTranslateElectron = () => {
    const language = (
        ipcRenderer?.sendSync('lang') ? ipcRenderer?.sendSync('lang') : defaultSettings.lang
    ) as LanguageType;

    return translate[language];
};
