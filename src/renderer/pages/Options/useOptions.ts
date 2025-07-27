import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

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
import useButtonKeyDown from '../../hooks/useButtonKeyDown';
import { withDefault } from '../../lib/withDefault';

const useOptions = () => {
    useGoBackOnEscape();

    const [theme, setTheme] = useState<string>();
    const [lang, setLang] = useState<string>('');
    const [openAtLogin, setOpenAtLogin] = useState<boolean>();
    const [autoConnect, setAutoConnect] = useState<boolean>();
    const [startMinimized, setStartMinimized] = useState<boolean>();
    const [forceClose, setForceClose] = useState<boolean>();
    const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
    const [shortcut, setShortcut] = useState<boolean>(false);
    const [soundEffect, setSoundEffect] = useState<boolean>(false);
    const [proxyMode, setProxyMode] = useState<string>('');
    const [betaRelease, setBetaRelease] = useState<boolean>(false);
    const [hookConnectSuccess, setHookConnectSuccess] = useState<string>('');
    const [hookConnectSuccessArgs, setHookConnectSuccessArgs] = useState<string>('');
    const [hookConnectFail, setHookConnectFail] = useState<string>('');
    const [hookConnectFailArgs, setHookConnectFailArgs] = useState<string>('');
    const [hookDisconnect, setHookDisconnect] = useState<string>('');
    const [hookDisconnectArgs, setHookDisconnectArgs] = useState<string>('');
    const [hookConnectionError, setHookConnectionError] = useState<string>('');
    const [hookConnectionErrorArgs, setHookConnectionErrorArgs] = useState<string>('');

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
                'startMinimized',
                'forceClose',
                'shortcut',
                'soundEffect',
                'proxyMode',
                'betaRelease',
                'hookConnectSuccess',
                'hookConnectSuccessArgs',
                'hookConnectFail',
                'hookConnectFailArgs',
                'hookDisconnect',
                'hookDisconnectArgs',
                'hookConnectionError',
                'hookConnectionErrorArgs'
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
                setProxyMode(withDefault(values.proxyMode, defaultSettings.proxyMode));
                setBetaRelease(withDefault(values.betaRelease, defaultSettings.betaRelease));
                setHookConnectSuccess(withDefault(values.hookConnectSuccess, defaultSettings.hookConnectSuccess));
                setHookConnectSuccessArgs(withDefault(values.hookConnectSuccessArgs, defaultSettings.hookConnectSuccessArgs));
                setHookConnectFail(withDefault(values.hookConnectFailArgs, defaultSettings.hookConnectFailArgs));
                setHookConnectFailArgs(withDefault(values.hookConnectFailArgs, defaultSettings.hookConnectFailArgs));
                setHookDisconnect(withDefault(values.hookDisconnect, defaultSettings.hookDisconnect));
                setHookDisconnectArgs(withDefault(values.hookDisconnectArgs, defaultSettings.hookDisconnectArgs));
                setHookConnectionError(withDefault(values.hookDisconnectArgs, defaultSettings.hookDisconnectArgs));
                setHookConnectionErrorArgs(withDefault(values.hookConnectionErrorArgs, defaultSettings.hookConnectionErrorArgs));

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

    const onClickBetaReleaseButton = useCallback(() => {
        setBetaRelease(!betaRelease);
        settings.set('betaRelease', !betaRelease);
        localStorage.setItem('OBLIVION_CHECKUPDATE', 'true');
    }, [betaRelease]);

    const onKeyDownBetaReleaseButton = useButtonKeyDown(onClickBetaReleaseButton);

    const onBrowseExecutable = useCallback(async (hookType: string) => {
        try {
            const result = await ipcRenderer.invoke('show-open-dialog', {
                title: 'Select Executable',
                buttonLabel: 'Select'
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const selectedPath = result.filePaths[0];
                switch (hookType) {
                    case 'connectSuccess':
                        setHookConnectSuccess(selectedPath);
                        settings.set('hookConnectSuccess', selectedPath);
                        break;
                    case 'connectFail':
                        setHookConnectFail(selectedPath);
                        settings.set('hookConnectFail', selectedPath);
                        break;
                    case 'disconnect':
                        setHookDisconnect(selectedPath);
                        settings.set('hookDisconnect', selectedPath);
                        break;
                    case 'connectionError':
                        setHookConnectionError(selectedPath);
                        settings.set('hookConnectionError', selectedPath);
                        break;
                    default:
                        console.warn('Unknown hook type:', hookType);
                }
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    }, []);

    const onHookExecutableChange = useCallback((hookType: string, value: string) => {
        switch (hookType) {
            case 'connectSuccess':
                setHookConnectSuccess(value);
                settings.set('hookConnectSuccess', value);
                break;
            case 'connectFail':
                setHookConnectFail(value);
                settings.set('hookConnectFail', value);
                break;
            case 'disconnect':
                setHookDisconnect(value);
                settings.set('hookDisconnect', value);
                break;
            case 'connectionError':
                setHookConnectionError(value);
                settings.set('hookConnectionError', value);
                break;
            default:
                console.warn('Unknown hook type:', hookType);
        }
    }, []);

    const onHookArgsChange = useCallback((hookType: string, value: string) => {
        switch (hookType) {
            case 'connectSuccess':
                setHookConnectSuccessArgs(value);
                settings.set('hookConnectSuccessArgs', value);
                break;
            case 'connectFail':
                setHookConnectFailArgs(value);
                settings.set('hookConnectFailArgs', value);
                break;
            case 'disconnect':
                setHookDisconnectArgs(value);
                settings.set('hookDisconnectArgs', value);
                break;
            case 'connectionError':
                setHookConnectionErrorArgs(value);
                settings.set('hookConnectionErrorArgs', value);
                break;
            default:
                console.warn('Unknown hook type:', hookType);
        }
    }, []);

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
        onKeyDownStartMinimizedButton,
        hookConnectSuccess,
        hookConnectSuccessArgs,
        hookConnectFail,
        hookConnectFailArgs,
        hookDisconnect,
        hookDisconnectArgs,
        hookConnectionError,
        hookConnectionErrorArgs,
        onBrowseExecutable,
        onHookExecutableChange,
        onHookArgsChange,
        setHookConnectSuccess,
        setHookConnectSuccessArgs,
        setHookConnectFail,
        setHookConnectFailArgs,
        setHookDisconnect,
        setHookDisconnectArgs,
        setHookConnectionError,
        setHookConnectionErrorArgs
    };
};

export default useOptions;
