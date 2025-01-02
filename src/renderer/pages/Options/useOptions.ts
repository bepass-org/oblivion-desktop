import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { ipcRenderer } from '../../lib/utils';
import {
    LanguageType,
    changeLang,
    getDirectionByLang,
    getLanguageName
} from '../../../localization';
import useTranslate from '../../../localization/useTranslate';

const useOptions = () => {
    useGoBackOnEscape();

    const [theme, setTheme] = useState<undefined | string>();
    const [lang, setLang] = useState<string>('');
    const [openAtLogin, setOpenAtLogin] = useState<undefined | boolean>();
    const [autoConnect, setAutoConnect] = useState<undefined | boolean>();
    const [forceClose, setForceClose] = useState<undefined | boolean>();
    const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
    const [shortcut, setShortcut] = useState<boolean>(false);
    const [proxyMode, setProxyMode] = useState<string>('');
    const [betaRelease, setBetaRelease] = useState<boolean>(false);

    const appLang = useTranslate();

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
        settings
            .getMultiple([
                'theme',
                'lang',
                'openAtLogin',
                'autoConnect',
                'forceClose',
                'shortcut',
                'proxyMode',
                'betaRelease'
            ])
            .then((values) => {
                setTheme(
                    typeof values.theme === 'undefined'
                        ? detectingSystemTheme
                            ? 'dark'
                            : 'light'
                        : values.theme
                );
                setLang(typeof values.lang === 'undefined' ? getLanguageName() : values.lang);
                setOpenAtLogin(
                    typeof values.openAtLogin === 'undefined'
                        ? defaultSettings.openAtLogin
                        : values.openAtLogin
                );
                setAutoConnect(
                    typeof values.autoConnect === 'undefined'
                        ? defaultSettings.autoConnect
                        : values.autoConnect
                );
                setForceClose(
                    typeof values.forceClose === 'undefined'
                        ? defaultSettings.forceClose
                        : values.forceClose
                );
                setShortcut(
                    typeof values.shortcut === 'undefined'
                        ? defaultSettings.shortcut
                        : values.shortcut
                );
                setProxyMode(
                    typeof values.proxyMode === 'undefined'
                        ? defaultSettings.proxyMode
                        : values.proxyMode
                );
                setBetaRelease(
                    typeof values.betaRelease === 'undefined'
                        ? defaultSettings.betaRelease
                        : values.betaRelease
                );
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });
    }, []);

    const onCloseRestoreModal = useCallback(() => {
        setShowRestoreModal(false);
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
        const language = e.target.value;
        setLang(language);
        changeLang(language);

        settings.set('lang', language);
        document.documentElement.setAttribute('lang', language);
        document.documentElement.setAttribute('dir', getDirectionByLang(language as LanguageType));
        ipcRenderer.sendMessage('localization', language);
    }, []);

    const onClickAutoStartButton = useCallback(() => {
        setOpenAtLogin(!openAtLogin);
        settings.set('openAtLogin', !openAtLogin);
        ipcRenderer.sendMessage('startup', !openAtLogin);
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

    const onClickAutoConnectButton = useCallback(() => {
        setAutoConnect(!autoConnect);
        settings.set('autoConnect', !autoConnect);
    }, [autoConnect]);

    const onKeyDownAutoConnectButton = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickAutoConnectButton();
            }
        },
        [onClickAutoConnectButton]
    );

    const onClickForceCloseButton = useCallback(() => {
        setForceClose(!forceClose);
        settings.set('forceClose', !forceClose);
    }, [forceClose]);

    const onKeyDownForceCloseButton = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickForceCloseButton();
            }
        },
        [onClickForceCloseButton]
    );

    const onClickShortcutButton = useCallback(() => {
        setShortcut(!shortcut);
        settings.set('shortcut', !shortcut);
    }, [shortcut]);

    const onKeyDownShortcutButton = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickShortcutButton();
            }
        },
        [onClickShortcutButton]
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

    const onClickBetaReleaseButton = useCallback(() => {
        setBetaRelease(!betaRelease);
        settings.set('betaRelease', !betaRelease);
        localStorage.setItem('OBLIVION_CHECKUPDATE', 'true');
    }, [betaRelease]);

    const onKeyDownBetaReleaseButton = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickBetaReleaseButton();
            }
        },
        [onClickBetaReleaseButton]
    );

    return {
        theme,
        lang,
        openAtLogin,
        autoConnect,
        forceClose,
        shortcut,
        showRestoreModal,
        appLang,
        langRef,
        onCloseRestoreModal,
        onClickChangeTheme,
        onKeyDownChangeTheme,
        onChangeLanguage,
        onClickAutoStartButton,
        onClickAutoConnectButton,
        onKeyDownAutoStartButton,
        onKeyDownAutoConnectButton,
        onClickForceCloseButton,
        onKeyDownForceCloseButton,
        onClickShortcutButton,
        onKeyDownShortcutButton,
        onClickRestore,
        onKeyDownRestore,
        setTheme,
        setLang,
        setOpenAtLogin,
        setAutoConnect,
        setForceClose,
        setShortcut,
        proxyMode,
        onClickBetaReleaseButton,
        onKeyDownBetaReleaseButton,
        betaRelease
    };
};

export default useOptions;
