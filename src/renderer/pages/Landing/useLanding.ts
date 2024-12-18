import { FormEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { isDev, ipcRenderer, onEscapeKeyPressed } from '../../lib/utils';
import {
    defaultToast,
    defaultToastWithSubmitButton,
    loadingToast,
    stopLoadingToast
} from '../../lib/toasts';
import { checkNewUpdate } from '../../lib/checkNewUpdate';
import packageJsonData from '../../../../package.json';
import { getLanguageName } from '../../../localization';
import useTranslate from '../../../localization/useTranslate';

export type IpConfig = {
    countryCode: string | boolean;
    ip: string;
};

let isFetching = false;
let cachedIpInfo: IpConfig | null = null;
let lastFetchTime = 0;
const cacheDuration = 10 * 1000;
let connectedToIrIPOnceDisplayed = false;
let canCheckNewVer = true;
let hasNewUpdate = false;

export interface INetStats {
    sentSpeed: { value: number; unit: string };
    recvSpeed: { value: number; unit: string };
    totalSent: { value: number; unit: string };
    totalRecv: { value: number; unit: string };
    totalUsage: { value: number; unit: string };
}

const defaultNetStats: INetStats = {
    sentSpeed: { value: -1, unit: 'N/A' },
    recvSpeed: { value: -1, unit: 'N/A' },
    totalSent: { value: -1, unit: 'N/A' },
    totalRecv: { value: -1, unit: 'N/A' },
    totalUsage: { value: -1, unit: 'N/A' }
};

const useLanding = () => {
    const appLang = useTranslate();
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
    const [ipInfo, setIpInfo] = useState<IpConfig>({
        countryCode: false,
        ip: ''
    });
    const [online, setOnline] = useState<boolean>(navigator?.onLine);

    const [drawerIsOpen, setDrawerIsOpen] = useState(false);
    const toggleDrawer = () => {
        setDrawerIsOpen((prevState) => !prevState);
    };

    useEffect(() => {
        if (window.innerWidth > 1049) {
            setTimeout(function () {
                setDrawerIsOpen(true);
            }, 300);
        }
        const handleResize = () => {
            if (window.innerWidth > 1049) {
                setTimeout(function () {
                    setDrawerIsOpen(true);
                }, 300);
            } else {
                setTimeout(function () {
                    setDrawerIsOpen(false);
                }, 300);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    //const [theme, setTheme] = useState<undefined | string>();
    const [lang, setLang] = useState<string>();
    const [ipData, setIpData] = useState<boolean>();
    //const [psiphon, setPsiphon] = useState<undefined | boolean>();
    //const [gool, setGool] = useState<undefined | boolean>();
    const [method, setMethod] = useState<string>('');
    const [ping, setPing] = useState<number>(0);
    const [proxyMode, setProxyMode] = useState<string>('');
    const [shortcut, setShortcut] = useState<boolean>(false);
    const [netStats, setNetStats] = useState<INetStats>(defaultNetStats);
    const [dataUsage, setDataUsage] = useState<boolean>(false);

    const navigate = useNavigate();

    const onChange = useCallback(() => {
        if (!navigator.onLine) {
            //checkInternetToast(appLang?.toast?.offline);
            if (isConnected) {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
                toast.remove('ONLINE_STATUS');
            } else {
                defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', 7000);
            }
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
                setIsLoading(true);
                setPing(0);
            }
        }
    }, [appLang?.toast?.offline, isLoading, isConnected, setIsLoading, setProxyStatus, proxyMode]);

    const fetchReleaseVersion = async () => {
        if (!isDev()) {
            try {
                const response = await fetch(
                    'https://api.github.com/repos/bepass-org/oblivion-desktop/releases/latest'
                );
                if (response.ok) {
                    const data = await response.json();
                    const latestVersion = String(data?.tag_name);
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
        //ipcRenderer.clean();

        settings
            .getMultiple(['lang', 'ipData', 'method', 'proxyMode', 'shortcut', 'dataUsage'])
            .then((values) => {
                setLang(typeof values.lang === 'undefined' ? getLanguageName() : values.lang);
                setIpData(
                    typeof values.ipData === 'undefined' ? defaultSettings.ipData : values.ipData
                );
                setMethod(
                    typeof values.method === 'undefined' ? defaultSettings.method : values.method
                );
                setProxyMode(
                    typeof values.proxyMode === 'undefined'
                        ? defaultSettings.proxyMode
                        : values.proxyMode
                );
                setShortcut(
                    typeof values.shortcut === 'undefined'
                        ? defaultSettings.shortcut
                        : values.shortcut
                );
                setDataUsage(
                    typeof values.dataUsage === 'undefined'
                        ? defaultSettings.dataUsage
                        : values.dataUsage
                );
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });

        cachedIpInfo = null;
        if (canCheckNewVer) {
            fetchReleaseVersion();
            canCheckNewVer = false;
        }

        ipcRenderer.on('guide-toast', (message: any) => {
            if (message === 'error_port_restart') {
                loadingToast(appLang.log.error_port_restart);
            } else if (message === 'sb_terminated') {
                setIsLoading(true);
                setIsConnected(false);
                loadingToast(appLang.status.keep_trying);
                setTimeout(function () {
                    stopLoadingToast();
                }, 3500);
            } else if (message === 'sb_restarted') {
                setIsLoading(false);
                setIsConnected(true);
            } else if (message === 'sb_exceeded') {
                setIsLoading(false);
                setIsConnected(false);
                setTimeout(function () {
                    defaultToast(appLang.log.error_deadline_exceeded, 'EXCEEDED', 5000);
                }, 2000);
            } else {
                defaultToast(message, 'GUIDE', 7000);
            }
        });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'connect' && !isLoading) {
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
                setProxyStatus(proxyMode);
                ipcRenderer.sendMessage('wp-start');
                setIsLoading(true);
                setPing(0);
            }
            if (args.key === 'disconnect' && !isLoading) {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
            }
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
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
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
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
            handleOnClickIp();
        } else {
            //checkInternetToast(appLang?.toast?.offline);
            defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', 7000);
        }
    }, [appLang?.toast?.offline, online]);

    useEffect(() => {
        if (isConnected && dataUsage) {
            ipcRenderer.on('net-stats', (event: any) => {
                setNetStats((prevNetStats) => ({
                    ...prevNetStats,
                    sentSpeed: event?.sentSpeed,
                    recvSpeed: event?.recvSpeed,
                    totalSent: event?.totalSent,
                    totalRecv: event?.totalRecv,
                    totalUsage: event?.totalUsage
                }));
            });
        }
    }, [dataUsage, isConnected]);

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
            if (!ipInfo?.countryCode) {
                setPing(0);
                return;
            }
            const started = window.performance.now();
            const http = new XMLHttpRequest();
            http.open('GET', 'https://cp.cloudflare.com', true);
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
            if (isFetching) return;
            isFetching = true;
            const currentTime = new Date().getTime();
            if (cachedIpInfo && currentTime - lastFetchTime < cacheDuration) {
                setIpInfo(cachedIpInfo);
            } else {
                if (isConnected && !isLoading) {
                    const traceStarted = window.performance.now();
                    const controller = new AbortController();
                    const signal = controller.signal;
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                    }, 5000);
                    const response = await fetch('https://1.1.1.1/cdn-cgi/trace', {
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
                    if (getLoc && cfHost === '1.1.1.1') {
                        if (
                            (method === 'psiphon' && checkWarp === 'off' && getLoc !== 'ir') ||
                            checkWarp !== 'off'
                        ) {
                            const ipInfo2 = {
                                countryCode: getLoc,
                                ip: getIp
                            };
                            cachedIpInfo = ipInfo2;
                            lastFetchTime = currentTime;
                            setIpInfo(ipInfo2);
                            setPing(Math.round(window.performance.now() - traceStarted));
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
        } finally {
            isFetching = false;
        }
    };

    useEffect(() => {
        if (ipInfo?.countryCode) {
            if (method === '' && ipInfo?.countryCode === 'ir') {
                ipToast();
            } else if (method === 'gool' && ipInfo?.countryCode === 'ir') {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
                loadingToast(appLang.status.keep_trying);
                setTimeout(function () {
                    stopLoadingToast();
                    ipcRenderer.sendMessage('wp-start');
                    setIsLoading(true);
                    setPing(0);
                }, 3500);
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
        /*if (ipData) {
            getIpLocation();
        }
        if (ping === 0) {
            if ((isConnected && !ipData) || (isConnected && ipInfo?.countryCode)) {
                getPing();
            }
        }*/

        if (isLoading || !isConnected) {
            toast.remove('ipChangedToIR');
            toast.remove('ipLocationStatus');
        }

        if (isConnected && isLoading) {
            setStatusText(`${appLang?.status?.disconnecting}`);
        } else if (!isConnected && isLoading) {
            setIpInfo({
                countryCode: false,
                ip: ''
            });
            setStatusText(`${appLang?.status?.connecting}`);
        } else if (isConnected && ipInfo?.countryCode) {
            setStatusText(`${appLang?.status?.connected_confirm}`);
        } else if (isConnected && !ipInfo?.countryCode && ipData) {
            if (proxyStatus !== 'none') {
                setStatusText(`${appLang?.status?.ip_check}`);
                getIpLocation();
            } else {
                setStatusText(`${appLang?.status?.connected}`);
            }
        } else if (isConnected && !ipData) {
            setStatusText(`${appLang?.status?.connected}`);
        } else {
            setStatusText(`${appLang?.status?.disconnected}`);
            toast.remove('IRAN_IP');
        }
    }, [isLoading, isConnected, ipInfo, ipData, proxyStatus]);

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
        } else {
            getIpLocation();
        }
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
        proxyStatus,
        appVersion: packageJsonData?.version,
        shortcut,
        netStats,
        dataUsage
    };
};
export default useLanding;
