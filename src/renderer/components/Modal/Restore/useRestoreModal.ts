import { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
    defaultSettings,
    dnsServers,
    singBoxGeoIp,
    singBoxGeoSite,
    singBoxLog,
    singBoxStack
} from '../../../../defaultSettings';
import { settings } from '../../../lib/settings';
import { ipcRenderer } from '../../../lib/utils';
import { changeLang, getDirectionByLang, LanguageType } from '../../../../localization';
import useTranslate from '../../../../localization/useTranslate';
import { useNavigate } from 'react-router-dom';
import { loadingToast, stopLoadingToast } from '../../../lib/toasts';

interface RestoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTheme: (value: string) => void;
    setLang: (value: string) => void;
    setOpenAtLogin: (value: boolean) => void;
    setAutoConnect: (value: boolean) => void;
    setForceClose: (value: boolean) => void;
    setShortcut: (value: boolean) => void;
}

const useRestoreModal = (props: RestoreModalProps) => {
    const {
        isOpen,
        onClose,
        setTheme,
        setLang,
        setOpenAtLogin,
        setAutoConnect,
        setForceClose,
        setShortcut
    } = props;
    const detectingSystemTheme = useMemo(
        () => window?.matchMedia('(prefers-color-scheme: dark)')?.matches,
        []
    );

    const [showModal, setShowModal] = useState<boolean>(isOpen);
    const navigate = useNavigate();

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onCancelKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleOnClose();
            }
        },
        [handleOnClose]
    );

    const onSaveModal = useCallback(async () => {
        loadingToast(appLang?.toast?.please_wait);
        // in this page
        setForceClose(defaultSettings.forceClose);
        setShortcut(defaultSettings.shortcut);
        setLang(defaultSettings.lang);
        setOpenAtLogin(defaultSettings.openAtLogin);
        setAutoConnect(defaultSettings.autoConnect);
        // TODO Promise.all
        await settings.set('theme', detectingSystemTheme ? 'dark' : 'light');
        setTheme(detectingSystemTheme ? 'dark' : 'light');
        document.documentElement.setAttribute(
            'data-bs-theme',
            detectingSystemTheme ? 'dark' : 'light'
        );
        await settings.set('forceClose', defaultSettings.forceClose);
        await settings.set('shortcut', defaultSettings.shortcut);
        await settings.set('lang', defaultSettings.lang);
        changeLang(defaultSettings.lang);
        document.documentElement.setAttribute('lang', defaultSettings.lang);
        document.documentElement.setAttribute(
            'dir',
            getDirectionByLang(defaultSettings.lang as LanguageType)
        );
        await settings.set('openAtLogin', defaultSettings.openAtLogin);
        await settings.set('autoConnect', defaultSettings.autoConnect);
        handleOnClose();
        // other settings
        //await settings.set('scan', defaultSettings.scan);
        await settings.set('endpoint', defaultSettings.endpoint);
        //await settings.set('psiphon', defaultSettings.psiphon);
        await settings.set('location', defaultSettings.location);
        await settings.set('license', defaultSettings.license);
        //await settings.set('gool', defaultSettings.gool);
        await settings.set('method', defaultSettings.method);
        await settings.set('hostIP', defaultSettings.hostIP);
        await settings.set('ipType', defaultSettings.ipType);
        await settings.set('rtt', defaultSettings.rtt);
        await settings.set('ipData', defaultSettings.ipData);
        await settings.set('port', defaultSettings.port);
        await settings.set('proxyMode', defaultSettings.proxyMode);
        await settings.set('shareVPN', defaultSettings.shareVPN);
        await settings.set('routingRules', defaultSettings.routingRules);
        await settings.set('reserved', defaultSettings.reserved);
        await settings.set('scanResult', defaultSettings.scanResult);
        await settings.set('profiles', defaultSettings.profiles);
        await settings.set('dns', dnsServers[0].value);
        await settings.set('dataUsage', defaultSettings.dataUsage);
        await settings.set('asn', defaultSettings.asn);
        await settings.set('closeHelper', defaultSettings.closeHelper);
        await settings.set('singBoxMTU', defaultSettings.singBoxMTU);
        await settings.set('singBoxGeoIp', singBoxGeoIp[0].geoIp);
        await settings.set('singBoxGeoSite', singBoxGeoSite[0].geoSite);
        await settings.set('singBoxGeoBlock', defaultSettings.singBoxGeoBlock);
        await settings.set('singBoxLog', singBoxLog[0].value);
        await settings.set('singBoxStack', singBoxStack[0].value);
        await settings.set('singBoxSniff', defaultSettings.singBoxSniff);
        await settings.set('restartCounter', defaultSettings.restartCounter);
        //
        ipcRenderer.sendMessage('wp-end');
        ipcRenderer.sendMessage('localization', defaultSettings.lang);
        ipcRenderer.sendMessage('startup', defaultSettings.openAtLogin);
        //
        setTimeout(function () {
            stopLoadingToast();
            navigate('/');
        }, 1500);
    }, [
        setForceClose,
        setShortcut,
        setLang,
        setOpenAtLogin,
        setAutoConnect,
        detectingSystemTheme,
        setTheme,
        handleOnClose
    ]);

    const onConfirmKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onSaveModal();
            }
        },
        [onSaveModal]
    );

    return {
        showModal,
        handleOnClose,
        onSaveModal,
        onConfirmKeyDown,
        onCancelKeyDown,
        appLang
    };
};

export default useRestoreModal;
