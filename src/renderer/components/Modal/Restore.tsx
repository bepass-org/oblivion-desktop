import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { ipcRenderer } from '../../lib/utils';
import { getLang } from '../../lib/loaders';

interface RestoreModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    setTheme: (value: string) => void;
    setSystemTray: (value: boolean) => void;
    setLang: (value: string) => void;
    setOpenAtLogin: (value: boolean) => void;
}

export default function RestoreModal({
    title,
    isOpen,
    onClose,
    setTheme,
    setSystemTray,
    setLang,
    setOpenAtLogin
}: RestoreModalProps) {
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

    if (!isOpen) return null;

    return (
        <div className={classNames('dialog', !showModal ? 'no-opacity' : '')}>
            <div className='dialogBg' onClick={handleOnClose} role='presentation' />
            <div className='dialogBox'>
                <div className='container'>
                    <div className='line'>
                        <div className='miniLine' />
                    </div>
                    <h3>{title}</h3>
                    <p>{appLang?.modal?.restore_desc}</p>
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={onClose}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onClose();
                            }
                        }}
                        tabIndex={0}
                        role='button'
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        aria-hidden='true'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSaveModal();
                            }
                        }}
                        tabIndex={0}
                    >
                        {appLang?.modal?.confirm}
                    </div>
                </div>
            </div>
        </div>
    );
}
