import { useEffect } from 'react';
import { ipcRenderer } from './utils';
import { useStore } from '../store';
import {
    defaultToast,
    defaultToastWithHelp,
    loadingToast,
    settingsHaveChangedToast,
    stopLoadingToast
} from './toasts';
import { useNavigate } from 'react-router';
import useTranslate from '../../localization/useTranslate';
import { settings } from './settings';
import { withDefault } from './withDefault';
import { defaultSettings } from '../../defaultSettings';

export default function globalEvents() {
    const {
        isConnected,
        setIsConnected,
        isLoading,
        setIsLoading,
        setIsCheckingForUpdates,
        setHasNewUpdate,
        setDownloadProgress,
        setProxyStatus,
        proxyMode,
        setProxyMode
    } = useStore();

    const appLang = useTranslate();

    const navigate = useNavigate();

    useEffect(() => {
        settings
            .get('proxyMode')
            .catch(() => undefined)
            .then((value) => withDefault(value, defaultSettings.proxyMode))
            .then((value) => {
                setProxyStatus(value);
                setProxyMode(value);
            });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'connect' && !isLoading) {
                setProxyStatus(proxyMode);
                ipcRenderer.sendMessage('wp-start');
                setIsLoading(true);
            } else if (args.key === 'disconnect' && !isLoading) {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
            } else if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });

        ipcRenderer.on('change-proxy-mode', (value: any) => {
            setProxyMode(value);
            settings.set('proxyMode', value);
            settingsHaveChangedToast({ isConnected, isLoading, appLang });
            ipcRenderer.sendMessage('tray-state', { proxyMode: value });
        });

        ipcRenderer.on('guide-toast', (message: any) => {
            switch (message) {
                case 'error_port_restart':
                    loadingToast(appLang.log.error_port_restart);
                    break;

                case 'sb_error_tun0':
                    setIsLoading(false);
                    setIsConnected(false);
                    stopLoadingToast();
                    defaultToast(appLang.log.error_script_failed, 'GUIDE', 7000);
                    break;

                case 'sb_preparing':
                    loadingToast(appLang.status.preparing_rulesets);
                    setTimeout(() => {
                        stopLoadingToast();
                    }, 3000);
                    break;

                case 'sb_download_failed':
                    setIsLoading(false);
                    setIsConnected(false);
                    stopLoadingToast();
                    setTimeout(() => {
                        defaultToast(
                            appLang.status.downloading_rulesets_failed,
                            'DOWNLOAD_FAILED',
                            3000
                        );
                    }, 2000);
                    break;

                case 'sb_start_failed':
                    stopLoadingToast();
                    setIsLoading(false);
                    setIsConnected(false);
                    break;

                case 'sb_stop_failed':
                    setIsLoading(false);
                    setIsConnected(true);
                    break;

                case 'sb_error_ipv6':
                    stopLoadingToast();
                    setIsLoading(false);
                    setIsConnected(false);
                    defaultToastWithHelp(
                        appLang.log.error_singbox_ipv6_address,
                        'https://github.com/bepass-org/oblivion-desktop/wiki/Fixing-the-set-ipv6-address:-Element-not-found-Error',
                        appLang.toast.help_btn,
                        'GUIDE'
                    );
                    break;

                case 'error_warp_identity':
                    defaultToastWithHelp(
                        appLang.log.error_warp_identity,
                        'https://github.com/bepass-org/oblivion-desktop/wiki/Fixing-proxy-connection-issues-on-certain-networks',
                        appLang.toast.help_btn,
                        'GUIDE'
                    );
                    break;

                default:
                    defaultToast(message, 'GUIDE', 7000);
                    break;
            }
        });

        ipcRenderer.on('new-update', (HasNewUpdate: any) => {
            setIsCheckingForUpdates(false);
            setHasNewUpdate(HasNewUpdate);
        });

        ipcRenderer.on('download-progress', (args: any) => {
            setDownloadProgress(args);
        });

        ipcRenderer.on('wp-start', (ok: any) => {
            if (ok) {
                setIsLoading(false);
                setIsConnected(true);
            }
        });

        ipcRenderer.on('wp-end', (ok: any) => {
            if (ok) {
                setIsConnected(false);
                setIsLoading(false);
            }
        });

        return () => {
            ipcRenderer.removeAllListeners('tray-menu');
            ipcRenderer.removeAllListeners('change-proxy-mode');
            ipcRenderer.removeAllListeners('guide-toast');
            ipcRenderer.removeAllListeners('new-update');
            ipcRenderer.removeAllListeners('download-progress');
            ipcRenderer.removeAllListeners('wp-start');
            ipcRenderer.removeAllListeners('wp-end');
        };
    }, []);
}
