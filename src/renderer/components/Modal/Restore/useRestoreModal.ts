import { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { defaultSettings } from '../../../../defaultSettings';
import { settings } from '../../../lib/settings';
import { getLang } from '../../../lib/loaders';
import { ipcRenderer } from '../../../lib/utils';

interface RestoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTheme: (value: string) => void;
    setSystemTray: (value: boolean) => void;
    setLang: (value: string) => void;
    setOpenAtLogin: (value: boolean) => void;
}

const useRestoreModal = (props: RestoreModalProps) => {
    const { isOpen, onClose, setLang, setOpenAtLogin, setSystemTray, setTheme } = props;
    const detectingSystemTheme = useMemo(
        () => window?.matchMedia('(prefers-color-scheme: dark)')?.matches,
        []
    );

    const [showModal, setshowModal] = useState<boolean>(isOpen);

    useEffect(() => setshowModal(isOpen), [isOpen]);

    const appLang = getLang();

    const handleOnClose = useCallback(() => {
        setshowModal(false);
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
        // in this page
        setTheme(detectingSystemTheme ? 'dark' : 'light');
        setSystemTray(defaultSettings.systemTray);
        setLang(defaultSettings.lang);
        setOpenAtLogin(defaultSettings.openAtLogin);
        // TODO Promise.all
        await settings.set('theme', detectingSystemTheme ? 'dark' : 'light');
        await settings.set('systemTray', defaultSettings.systemTray);
        await settings.set('lang', defaultSettings.lang);
        await settings.set('openAtLogin', defaultSettings.openAtLogin);
        document.documentElement.setAttribute(
            'data-bs-theme',
            detectingSystemTheme ? 'dark' : 'light'
        );
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
        //
        ipcRenderer.sendMessage('wp-end');
    }, [detectingSystemTheme, setTheme, setSystemTray, setLang, setOpenAtLogin, handleOnClose]);

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
