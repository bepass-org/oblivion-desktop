import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

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
import useButtonKeyDown from '../../hooks/useButtonKeyDown';
import { withDefault } from '../../lib/withDefault';
import { useStore } from '../../store';

const useOptions = () => {
    const { isCheckingForUpdates, setIsCheckingForUpdates, hasNewUpdate, proxyMode } = useStore();

    const [theme, setTheme] = useState<string>();
    const [lang, setLang] = useState<string>('');
    const [openAtLogin, setOpenAtLogin] = useState<boolean>();
    const [autoConnect, setAutoConnect] = useState<boolean>();
    const [startMinimized, setStartMinimized] = useState<boolean>();
    const [forceClose, setForceClose] = useState<boolean>();
    const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
    const [shortcut, setShortcut] = useState<boolean>(false);
    const [soundEffect, setSoundEffect] = useState<boolean>(false);
    const [betaRelease, setBetaRelease] = useState<boolean>(false);

    const appLang = useTranslate();

    const { state } = useLocation();
    const { targetId } = state || {};
    const langRef = useRef<HTMLDivElement>(null);
    const detectingSystemTheme = window?.matchMedia('(prefers-color-scheme: dark)')?.matches;

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
                'startMinimized',
                'forceClose',
                'shortcut',
                'soundEffect',
                'betaRelease'
            ])
            .then((values) => {
                setTheme(withDefault(values.theme, detectingSystemTheme ? 'dark' : 'light'));

                setLang(withDefault(values.lang, getLanguageName()));
                setOpenAtLogin(withDefault(values.openAtLogin, defaultSettings.openAtLogin));
                setAutoConnect(withDefault(values.autoConnect, defaultSettings.autoConnect));
                setStartMinimized(
                    withDefault(values.startMinimized, defaultSettings.startMinimized)
                );
                setForceClose(withDefault(values.forceClose, defaultSettings.forceClose));
                setShortcut(withDefault(values.shortcut, defaultSettings.shortcut));
                setSoundEffect(withDefault(values.soundEffect, defaultSettings.soundEffect));
                setBetaRelease(withDefault(values.betaRelease, defaultSettings.betaRelease));
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
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

    const onKeyDownChangeTheme = useButtonKeyDown(onClickChangeTheme);

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

    const onKeyDownAutoStartButton = useButtonKeyDown(onClickAutoStartButton);

    const onClickAutoConnectButton = useCallback(() => {
        setAutoConnect(!autoConnect);
        settings.set('autoConnect', !autoConnect);
    }, [autoConnect]);

    const onKeyDownAutoConnectButton = useButtonKeyDown(onClickAutoConnectButton);

    const onClickStartMinimizedButton = useCallback(() => {
        setStartMinimized(!startMinimized);
        settings.set('startMinimized', !startMinimized);
    }, [startMinimized]);

    const onKeyDownStartMinimizedButton = useButtonKeyDown(onClickStartMinimizedButton);

    const onClickForceCloseButton = useCallback(() => {
        setForceClose(!forceClose);
        settings.set('forceClose', !forceClose);
    }, [forceClose]);

    const onKeyDownForceCloseButton = useButtonKeyDown(onClickForceCloseButton);

    const onClickShortcutButton = useCallback(() => {
        setShortcut(!shortcut);
        settings.set('shortcut', !shortcut);
    }, [shortcut]);

    const onKeyDownShortcutButton = useButtonKeyDown(onClickShortcutButton);

    const onClickSoundEffectButton = useCallback(() => {
        setSoundEffect(!soundEffect);
        settings.set('soundEffect', !soundEffect);
    }, [soundEffect]);

    const onKeyDownSoundEffectButton = useButtonKeyDown(onClickSoundEffectButton);

    const onClickRestore = useCallback(() => setShowRestoreModal(true), []);

    const onKeyDownRestore = useButtonKeyDown(onClickRestore);

    const onClickBetaReleaseButton = useCallback(async () => {
        setBetaRelease(!betaRelease);
        await settings.set('betaRelease', !betaRelease);
        if (betaRelease != hasNewUpdate && !isCheckingForUpdates) {
            setIsCheckingForUpdates(true);
            ipcRenderer.sendMessage('check-update');
        }
    }, [betaRelease]);

    const onKeyDownBetaReleaseButton = useButtonKeyDown(onClickBetaReleaseButton);

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
        betaRelease,
        soundEffect,
        onClickSoundEffectButton,
        onKeyDownSoundEffectButton,
        startMinimized,
        setStartMinimized,
        onClickStartMinimizedButton,
        onKeyDownStartMinimizedButton
    };
};

export default useOptions;
