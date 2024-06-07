import enUS from './en';
import faIR from './fa';
import ruRU from './ru';
import cnCN from './cn';
import deDE from './de';
import { defaultSettings } from '../defaultSettings';
import { store } from '../renderer/lib/utils';

type LanguageType = 'fa' | 'en' | 'ru' | 'cn' | 'de';
type directionType = 'rtl' | 'ltr';

const lang = (store.get('lang') ? store.get('lang') : defaultSettings.lang) as LanguageType;

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

const getDirectionByLang = (language: LanguageType) => {
    return direction[language] as directionType;
};
export { getDirection, getDirectionByLang };

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
    const language = (
        store.get('lang') ? store.get('lang') : defaultSettings.lang
    ) as LanguageType;

    return translate[language];
};

export { getTranslate };

const changeLang = (language: string) => {
    store.set('lang', language);
    window.location.reload();
};

export { changeLang };
