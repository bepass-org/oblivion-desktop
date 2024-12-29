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

export type LanguageType =
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
type directionType = 'rtl' | 'ltr';

const lang = defaultSettings.lang as LanguageType;
export { lang };

const direction = {
    fa: 'rtl',
    en: 'ltr',
    ru: 'ltr',
    cn: 'ltr',
    tr: 'ltr',
    id: 'ltr',
    ar: 'rtl',
    vi: 'ltr',
    pt: 'ltr',
    ur: 'rtl',
    es: 'ltr',
    am: 'ltr',
    my: 'ltr'
};

const getDirection = () => {
    return direction[lang] as directionType;
};

const getDirectionByLang = (language: LanguageType) => {
    return direction[language] as directionType;
};
export { getDirection, getDirectionByLang };

const getLanguageName = (): LanguageType => {
    return lang;
};

export { getLanguageName };

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

const getTranslate = (forceLang?: string) => {
    let language;
    if (typeof forceLang === 'string' && forceLang !== '') {
        language = forceLang;
    } else {
        language = defaultSettings.lang;
    }
    return translate[language as LanguageType];
};

export { getTranslate };

const changeLang = (language: string) => {
    // store.set('lang', language);
    localStorage.setItem('lang', language);
    window.dispatchEvent(new Event('storage'));

    // window.location.reload();
};

export { changeLang };
