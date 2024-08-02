import { useState, useEffect } from 'react';
import { defaultSettings } from '../defaultSettings';
import enUS from './en';
import faIR from './fa';
import ruRU from './ru';
import cnCN from './cn';
import deDE from './de';
import trTR from './tr';
import idID from './id';
import { Language } from './type';

type LanguageType = 'fa' | 'en' | 'ru' | 'cn' | 'de' | 'tr' | 'id';

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
        de: deDE,
        tr: trTR,
        id: idID
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
