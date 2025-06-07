import { useState, useEffect } from 'react';
import { defaultSettings } from '../defaultSettings';
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
import { Language } from './type';

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

const useTranslate = () => {
    const getLanguage = () => {
        return (localStorage.getItem('lang') || defaultSettings.lang) as LanguageType;
    };

    const [lang, setLang] = useState<LanguageType>(getLanguage());

    const translations: Record<LanguageType, Language> = {
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

    useEffect(() => {
        const handleStorageChange = () => {
            setLang(getLanguage());
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return translations[lang];
};

export default useTranslate;
