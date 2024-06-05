import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { getLang, loadLang } from '../../lib/loaders';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { loadingToast } from '../../lib/toasts';
import { ipcRenderer } from '../../lib/utils';

const useOptions = () => {
    useGoBackOnEscape();

    const [theme, setTheme] = useState<undefined | string>();
    const [lang, setLang] = useState<string>('');
    const [systemTray, setSystemTray] = useState<undefined | boolean>();
    const [openAtLogin, setOpenAtLogin] = useState<undefined | boolean>();
    const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
    const [appLang, setAppLang] = useState(getLang());

    const { state } = useLocation();
    const { targetId } = state || {};
    const langRef = useRef<HTMLDivElement>(null);
    const detectingSystemTheme = window?.matchMedia('(prefers-color-scheme: dark)')?.matches;

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(function () {
            if (langRef && targetId === 'languages') {
                langRef?.current?.scrollIntoView();
                langRef?.current?.classList?.add('highlight');
                setTimeout(function () {
                    langRef?.current?.classList?.remove('highlight');
                }, 3000);
            }
        }, 1000);
    }, [targetId]);

    useEffect(() => {
        settings.get('theme').then((value) => {
            setTheme(
                typeof value === 'undefined' ? (detectingSystemTheme ? 'dark' : 'light') : value
            );
        });
        settings.get('lang').then((value) => {
            setLang(typeof value === 'undefined' ? defaultSettings.lang : value);
        });
        settings.get('systemTray').then((value) => {
            setSystemTray(typeof value === 'undefined' ? defaultSettings.systemTray : value);
        });
        settings.get('openAtLogin').then((value) => {
            setOpenAtLogin(typeof value === 'undefined' ? defaultSettings.openAtLogin : value);
        });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });
    }, []);

    const onCloseRestoreModal = useCallback(() => {
        setShowRestoreModal(false);
        setTimeout(function () {
            loadLang();
        }, 750);
        setTimeout(function () {
            setAppLang(getLang());
        }, 1500);
    }, []);

    const onClickChangeTheme = useCallback(() => {
        const tmp = theme === 'light' ? 'dark' : 'light';
        setTheme(tmp);
        settings.set('theme', tmp);
        document.documentElement.setAttribute('data-bs-theme', tmp);
    }, [theme]);

    const onKeyDownChangeTheme = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickChangeTheme();
            }
        },
        [onClickChangeTheme]
    );

    const onChangeLanguage = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setLang(e.target.value);
        settings.set('lang', e.target.value);
        loadingToast();

        setTimeout(function () {
            loadLang();
        }, 750);

        setTimeout(function () {
            setAppLang(getLang());
            toast.remove('LOADING');
        }, 1500);
    }, []);

    const onClickAutoStartButton = useCallback(() => {
        setOpenAtLogin(!openAtLogin);
        settings.set('openAtLogin', !openAtLogin);
    }, [openAtLogin]);

    const onKeyDownAutoStartButton = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickAutoStartButton();
            }
        },
        [onClickAutoStartButton]
    );

    const onClickSystemTrayButton = useCallback(() => {
        setSystemTray(!systemTray);
        settings.set('systemTray', !systemTray);
    }, [systemTray]);

    const onKeyDownSystemTrayButton = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickSystemTrayButton();
            }
        },
        [onClickSystemTrayButton]
    );

    const onClickRestore = useCallback(() => setShowRestoreModal(true), []);

    const onKeyDownRestore = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickRestore();
            }
        },
        [onClickRestore]
    );

    return {
        theme,
        lang,
        systemTray,
        openAtLogin,
        showRestoreModal,
        appLang,
        langRef,
        onCloseRestoreModal,
        onClickChangeTheme,
        onKeyDownChangeTheme,
        onChangeLanguage,
        onClickAutoStartButton,
        onKeyDownAutoStartButton,
        onClickSystemTrayButton,
        onKeyDownSystemTrayButton,
        onClickRestore,
        onKeyDownRestore,
        setTheme,
        setSystemTray,
        setLang,
        setOpenAtLogin
    };
};

export default useOptions;
