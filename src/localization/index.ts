import enUS from './en';
import faIR from './fa';
import ruRU from './ru';
import cnCN from './cn';
import deDE from './de';

type LanguageType = 'fa' | 'en' | 'ru' | 'cn' | 'de';
type directionType = 'rtl' | 'ltr';

const lang = (localStorage.getItem('lang') ? localStorage.getItem('lang') : 'en') as LanguageType;

export { lang };

const direction = {
    fa: 'rtl',
    en: 'ltr',
    ru: 'ltr',
    cn: 'ltr',
    de: 'ltr'
};

const getDirection = () => {
    return direction[lang] as directionType;
};

export { getDirection };

const getLanguageName = (): LanguageType => {
    return lang;
};

export { getLanguageName };
// const fonts = {
//     fa: 'IRANSans',
//     en: 'Ubuntu'
// };

// const getFonts = () => {
//     return fonts[lang];
// };

// export { getFonts };

const translate = {
    fa: faIR,
    en: enUS,
    ru: ruRU,
    cn: cnCN,
    de: deDE
};

const getTranslate = () => {
    return translate[lang];
};

export { getTranslate };

const changeLang = (language: string) => {
    localStorage.setItem('lang', language);
    window.location.reload();
};

export { changeLang };
