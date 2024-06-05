import { FormEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getLang } from '../../lib/loaders';
import { useStore } from '../../store';
import { checkNewUpdate } from '../../lib/checkNewUpdate';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { ipcRenderer, isDev, onEscapeKeyPressed } from '../../lib/utils';
import { checkInternetToast, defaultToast, defaultToastWithSubmitButton } from '../../lib/toasts';
import packageJsonData from '../../../../package.json';

let cachedIpInfo: any = null;
let lastFetchTime = 0;
const cacheDuration = 10 * 1000;
let connectedToIrIPOnceDisplayed = false;
let canCheckNewVer = true;
let hasNewUpdate = false;

const useLanding = () => {
    const appLang = getLang();
    const {
        isConnected,
        setIsConnected,
        isLoading,
        setIsLoading,
        statusText,
        setStatusText,
        proxyStatus,
        setProxyStatus
    } = useStore();
    const [ipInfo, setIpInfo] = useState<{
        countryCode: string | boolean;
        ip: string;
    }>({
        countryCode: false,
        ip: ''
    });
    const [online, setOnline] = useState<boolean>(true);

    const [drawerIsOpen, setDrawerIsOpen] = useState(false);
    const toggleDrawer = () => {
        setDrawerIsOpen((prevState) => !prevState);
    };

    //const [theme, setTheme] = useState<undefined | string>();
    const [lang, setLang] = useState<string>();
    const [ipData, setIpData] = useState<boolean>();
    //const [psiphon, setPsiphon] = useState<undefined | boolean>();
    //const [gool, setGool] = useState<undefined | boolean>();
    const [method, setMethod] = useState<string>('');
    const [ping, setPing] = useState<number>(0);
    const [proxyMode, setProxyMode] = useState<string>('');

    const fetchReleaseVersion = async () => {
        if (!isDev()) {
            try {
                const response = await fetch(
                    'https://api.github.com/repos/bepass-org/oblivion-desktop/releases'
                );
                if (response.ok) {
                    const data = await response.json();
                    const latestVersion = String(data[0]?.name);
                    const appVersion = String(packageJsonData?.version);
                    if (latestVersion && checkNewUpdate(appVersion, latestVersion)) {
                        hasNewUpdate = true;
                    }
                } else {
                    console.error('Failed to fetch release version:', response.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch release version:', error);
            }
        } else {
            hasNewUpdate = false;
        }
    };

    useEffect(() => {
        /*settings.get('theme').then((value) => {
            setTheme(typeof value === 'undefined' ? defaultSettings.theme : value);
        });*/
        settings.get('lang').then((value) => {
            setLang(typeof value === 'undefined' ? defaultSettings.lang : value);
        });
        settings.get('ipData').then((value) => {
            setIpData(typeof value === 'undefined' ? defaultSettings.ipData : value);
        });
        /*settings.get('psiphon').then((value) => {
            setPsiphon(typeof value === 'undefined' ? defaultSettings.psiphon : value);
        });
        settings.get('gool').then((value) => {
            setGool(typeof value === 'undefined' ? defaultSettings.gool : value);
        });*/
        settings.get('method').then((value) => {
            setMethod(typeof value === 'undefined' ? defaultSettings.method : value);
        });
        settings.get('proxyMode').then((value) => {
            setProxyMode(typeof value === 'undefined' ? defaultSettings.proxyMode : value);
        });

        cachedIpInfo = null;
        if (canCheckNewVer) {
            fetchReleaseVersion();
            canCheckNewVer = false;
        }

        ipcRenderer.on('guide-toast', (message: any) => {
            defaultToast(message, 'GUIDE', 7000);
        });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'Connect') {
                onChange();
            }
        });

        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
        return () => {
            window.removeEventListener('online', () => setOnline(true));
            window.removeEventListener('offline', () => setOnline(false));
        };
    }, []);

    useEffect(() => {
        if (online) {
            toast.remove('ONLINE_STATUS');
        } else {
            checkInternetToast();
        }
    }, [online]);

    const ipToast = async () => {
        if (connectedToIrIPOnceDisplayed) {
            return false;
        }

        defaultToastWithSubmitButton(
            `${appLang?.toast?.ir_location}`,
            `${appLang?.toast?.btn_submit}`,
            'IRAN_IP',
            Infinity
        );

        connectedToIrIPOnceDisplayed = true;
    };

    const getPing = async () => {
        try {
            const started = window.performance.now();
            const http = new XMLHttpRequest();
            http.open('GET', 'http://cp.cloudflare.com', true);
            http.onreadystatechange = function () {};
            http.onloadend = function () {
                setPing(Math.round(window.performance.now() - started));
            };
            http.send();
        } catch (error) {
            setPing(-1);
        }
    };

    const getIpLocation = async () => {
        try {
            const currentTime = new Date().getTime();
            if (cachedIpInfo && currentTime - lastFetchTime < cacheDuration) {
                setIpInfo(cachedIpInfo);
            } else {
                if (isConnected && !isLoading) {
                    const controller = new AbortController();
                    const signal = controller.signal;
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                    }, 5000);
                    const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
                        signal
                    });
                    const data = await response.text();
                    const lines = data.split('\n');
                    const ipLine = lines.find((line) => line.startsWith('ip='));
                    const locationLine = lines.find((line) => line.startsWith('loc='));
                    const warpLine = lines.find((warp) => warp.startsWith('warp='));
                    const cfLine = lines.find((warp) => warp.startsWith('h='));
                    const getIp = ipLine ? ipLine.split('=')[1] : '127.0.0.1';
                    const getLoc = locationLine ? locationLine.split('=')[1].toLowerCase() : false;
                    const checkWarp = warpLine ? warpLine.split('=')[1] : '';
                    const cfHost = cfLine ? cfLine.split('=')[1] : 'off';
                    if (getLoc && cfHost === 'cloudflare.com') {
                        if (
                            (method === 'psiphon' && checkWarp !== 'on' && getLoc !== 'ir') ||
                            checkWarp === 'on'
                        ) {
                            const ipInfo2 = {
                                countryCode: getLoc,
                                ip: getIp
                            };
                            cachedIpInfo = ipInfo2;
                            lastFetchTime = currentTime;
                            setIpInfo(ipInfo2);
                        } else {
                            setTimeout(getIpLocation, 7500);
                        }
                    } else {
                        setTimeout(getIpLocation, 7500);
                    }
                    clearTimeout(timeoutId);
                    toast.remove('ipLocationStatus');
                }
            }
        } catch (error) {
            /*setIpInfo({
                countryCode: false,
                ip: '127.0.0.1'
            });*/
            setTimeout(getIpLocation, 10000);
            //onChange();
        }
    };

    useEffect(() => {
        if (ipInfo?.countryCode) {
            if (method === '' && ipInfo?.countryCode === 'ir') {
                ipToast();
            } else {
                toast.remove('ipChangedToIR');
            }
        }
    }, [ipInfo]);

    useEffect(() => {
        onEscapeKeyPressed(() => {
            setDrawerIsOpen(false);
        });
        toast.remove('COPIED');
    }, []);

    useEffect(() => {
        if (ipData) {
            getIpLocation();
        }
        if (ping === 0) {
            if ((isConnected && !ipData) || (isConnected && ipInfo?.countryCode)) {
                getPing();
            }
        }

        if (isLoading || !isConnected) {
            toast.remove('ipChangedToIR');
            toast.remove('ipLocationStatus');
        }

        if (isConnected && isLoading) {
            setStatusText(`${appLang?.status?.disconnecting}`);
        } else if (!isConnected && isLoading) {
            setStatusText(`${appLang?.status?.connecting}`);
        } else if (isConnected && ipInfo?.countryCode) {
            setStatusText(`${appLang?.status?.connected_confirm}`);
        } else if (isConnected && !ipInfo?.countryCode && ipData) {
            if (proxyStatus !== 'none') {
                setStatusText(`${appLang?.status?.ip_check}`);
            } else {
                setStatusText(`${appLang?.status?.connected}`);
            }
        } else if (isConnected && !ipData) {
            setStatusText(`${appLang?.status?.connected}`);
        } else {
            setStatusText(`${appLang?.status?.disconnected}`);
        }

        ipcRenderer.on('wp-start', (ok) => {
            if (ok) {
                setIsLoading(false);
                setIsConnected(true);
                /*if (proxyStatus !== '') {
                    ipcRenderer.sendMessage('tray-icon', `connected-${proxyStatus}`);
                }*/
            }
        });

        ipcRenderer.on('wp-end', (ok) => {
            if (ok) {
                setIsConnected(false);
                setIsLoading(false);
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
                /*if (proxyStatus !== '') {
                    ipcRenderer.sendMessage('tray-icon', 'disconnected');
                }*/
            }
        });
    }, [isLoading, isConnected, ipInfo, ipData, proxyStatus]);

    const onChange = useCallback(() => {
        if (!online) {
            checkInternetToast();
        } else {
            if (isLoading) {
                ipcRenderer.sendMessage('wp-end');
            } else if (isConnected) {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
            } else {
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
                setProxyStatus(proxyMode);
                ipcRenderer.sendMessage('wp-start');
                toast.remove('GUIDE');
                setIsLoading(true);
                setPing(0);
            }
        }
    }, [online, isLoading, isConnected, setIsLoading, proxyMode]);

    const handleMenuOnKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            toggleDrawer();
        }
    }, []);

    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onChange();
        },
        [onChange]
    );

    const handleOnSwipedLeft = useCallback(() => {
        if (isConnected && !isLoading) {
            onChange();
        }
    }, [isConnected, isLoading, onChange]);

    const handleOnSwipedRight = useCallback(() => {
        if (!isConnected && !isLoading) {
            onChange();
        }
    }, [isConnected, isLoading, onChange]);

    const handleOnClickIp = () => {
        setIpInfo({
            countryCode: false,
            ip: ''
        });

        const getTime = new Date().getTime();
        if (cachedIpInfo && getTime - lastFetchTime < cacheDuration) {
            return;
        }

        getIpLocation();
    };

    const handleOnClickPing = () => {
        if (ping >= 0) {
            setPing(0);
            setTimeout(async () => {
                await getPing();
            }, 1500);
        }
    };

    return {
        appLang,
        isConnected,
        isLoading,
        statusText,
        ipInfo,
        ping,
        hasNewUpdate,
        drawerIsOpen,
        lang,
        ipData,
        proxyMode,
        toggleDrawer,
        onSubmit,
        handleMenuOnKeyDown,
        handleOnSwipedLeft,
        handleOnSwipedRight,
        handleOnClickIp,
        handleOnClickPing,
        proxyStatus
    };
};
export default useLanding;
