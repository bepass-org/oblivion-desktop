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

// --- Constants ---
const IPC_ACTIONS: any = {
    WP_START: 'wp-start',
    WP_END: 'wp-end',
    GUIDE_TOAST: 'guide-toast',
    SB_TERMINATE: 'sb-terminate',
    TRAY_MENU: 'tray-menu',
    NETSTATS_STATS: 'netStats-stats'
};

const TOAST_IDS: any = {
    ONLINE_STATUS: 'ONLINE_STATUS',
    IRAN_IP: 'IRAN_IP',
    COPIED: 'COPIED',
    IP_CHANGED_TO_IR: 'ipChangedToIR',
    IP_LOCATION_STATUS: 'ipLocationStatus',
    GUIDE: 'GUIDE',
    EXCEEDED: 'EXCEEDED'
};

const CACHE_DURATION = 10000;

// --- Types ---
export type IpConfig = {
    countryCode: string | boolean;
    ip: string;
};

export interface INetStats {
    sentSpeed: { value: number; unit: string };
    recvSpeed: { value: number; unit: string };
    totalSent: { value: number; unit: string };
    totalRecv: { value: number; unit: string };
    totalUsage: { value: number; unit: string };
}

// --- Default Values ---
const defaultNetStats: INetStats = {
    sentSpeed: { value: -1, unit: 'N/A' },
    recvSpeed: { value: -1, unit: 'N/A' },
    totalSent: { value: -1, unit: 'N/A' },
    totalRecv: { value: -1, unit: 'N/A' },
    totalUsage: { value: -1, unit: 'N/A' }
};

// --- Module-Level Variables ---
let isFetching = false;
let cachedIpInfo: IpConfig | null = null;
let lastFetchTime = 0;
let connectedToIrIPOnceDisplayed = false;
let canCheckNewVer = true;
let hasNewUpdate = false;

// --- Helper Functions ---
/**
 * Displays a toast notification if the user's IP is detected as being from Iran.
 */
const ipToast = (appLang: any) => {
    if (connectedToIrIPOnceDisplayed) {
        return;
    }

    defaultToastWithSubmitButton(
        `${appLang?.toast?.ir_location}`,
        `${appLang?.toast?.btn_submit}`,
        TOAST_IDS.IRAN_IP,
        Infinity
    );

    connectedToIrIPOnceDisplayed = true;
};

/**
 * Measures the ping to a test server.
 */
const getPing = (ipInfo: IpConfig, setPing: React.Dispatch<React.SetStateAction<number>>) => {
    try {
        if (!ipInfo?.countryCode) {
            setPing(0);
            return;
        }
        const started = window.performance.now();
        const http = new XMLHttpRequest();
        http.open('GET', 'https://cp.cloudflare.com', true);
        http.onreadystatechange = () => {};
        http.onloadend = () => {
            setPing(Math.round(window.performance.now() - started));
        };
        http.send();
    } catch (error) {
        setPing(-1);
    }
};

/**
 * Helper function to encapsulate setTimeout logic.
 */
const delayAction = (action: () => void, duration: number) => {
    setTimeout(action, duration);
};

/**
 * Fetches the user's IP address and location from a third-party service.
 * Caches the result for a short period to avoid excessive requests.
 */
const getIpLocation = (
    isConnected: boolean,
    isLoading: boolean,
    method: string,
    setIpInfo: React.Dispatch<React.SetStateAction<IpConfig>>,
    setPing: React.Dispatch<React.SetStateAction<number>>,
    appLang: any
) => {
    try {
        if (isFetching) return;
        isFetching = true;
        const currentTime = new Date().getTime();

        if (cachedIpInfo && currentTime - lastFetchTime < CACHE_DURATION) {
            setIpInfo(cachedIpInfo);
            isFetching = false;
            return;
        }

        if (isConnected && !isLoading) {
            const traceStarted = window.performance.now();
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 5000);

            fetch('https://1.1.1.1/cdn-cgi/trace', { signal })
                .then((response) => response.text())
                .then((data) => {
                    const lines = data.split('\n');
                    const ipLine = lines.find((line) => line.startsWith('ip='));
                    const locationLine = lines.find((line) => line.startsWith('loc='));
                    const warpLine = lines.find((line) => line.startsWith('warp='));
                    const cfLine = lines.find((line) => line.startsWith('h='));

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
                            delayAction(
                                () =>
                                    getIpLocation(
                                        isConnected,
                                        isLoading,
                                        method,
                                        setIpInfo,
                                        setPing,
                                        appLang
                                    ),
                                7500
                            );
                        }
                    } else {
                        delayAction(
                            () =>
                                getIpLocation(
                                    isConnected,
                                    isLoading,
                                    method,
                                    setIpInfo,
                                    setPing,
                                    appLang
                                ),
                            7500
                        );
                    }
                })
                .catch((error) => {
                    console.error('Error fetching IP location:', error);
                    delayAction(
                        () =>
                            getIpLocation(
                                isConnected,
                                isLoading,
                                method,
                                setIpInfo,
                                setPing,
                                appLang
                            ),
                        10000
                    );
                })
                .finally(() => {
                    isFetching = false;
                    clearTimeout(timeoutId);
                    toast.remove(TOAST_IDS.IP_LOCATION_STATUS);
                });
        } else {
            isFetching = false;
        }
    } catch (error) {
        console.error('Unexpected error in getIpLocation:', error);
        isFetching = false;
        delayAction(
            () => getIpLocation(isConnected, isLoading, method, setIpInfo, setPing, appLang),
            10000
        );
    }
};

/**
 * Fetches the latest release version from GitHub and checks if an update is available.
 */
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

/**
 * The main hook for the landing page.
 */
const useLanding = () => {
    const appLang = useTranslate();
    const navigate = useNavigate();

    // --- Store States ---
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

    // --- Connection and IP States ---
    const [ipInfo, setIpInfo] = useState<IpConfig>({
        countryCode: false,
        ip: ''
    });
    const [online, setOnline] = useState<boolean>(navigator?.onLine);
    const [ping, setPing] = useState<number>(0);

    // --- UI States ---
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    // --- Settings States ---
    const [lang, setLang] = useState<string>();
    const [ipData, setIpData] = useState<boolean>();
    const [method, setMethod] = useState<string>('');
    const [proxyMode, setProxyMode] = useState<string>('');
    const [shortcut, setShortcut] = useState<boolean>(false);
    const [netStats, setNetStats] = useState<INetStats>(defaultNetStats);
    const [dataUsage, setDataUsage] = useState<boolean>(false);

    // --- Function for toggling the drawer ---
    const toggleDrawer = () => {
        setDrawerIsOpen((prevState) => !prevState);
    };

    // --- Effect for loading settings ---
    useEffect(() => {
        const loadSettings = async () => {
            const results = await Promise.allSettled([
                settings.get('lang'),
                settings.get('ipData'),
                settings.get('method'),
                settings.get('proxyMode'),
                settings.get('shortcut'),
                settings.get('dataUsage')
            ]);

            const [
                langResult,
                ipDataResult,
                methodResult,
                proxyModeResult,
                shortcutResult,
                dataUsageResult
            ] = results;

            setLang(
                langResult.status === 'fulfilled'
                    ? (langResult.value ?? getLanguageName())
                    : getLanguageName()
            );
            setIpData(
                ipDataResult.status === 'fulfilled'
                    ? (ipDataResult.value ?? defaultSettings.ipData)
                    : defaultSettings.ipData
            );
            setMethod(
                methodResult.status === 'fulfilled'
                    ? (methodResult.value ?? defaultSettings.method)
                    : defaultSettings.method
            );
            setProxyMode(
                proxyModeResult.status === 'fulfilled'
                    ? (proxyModeResult.value ?? defaultSettings.proxyMode)
                    : defaultSettings.proxyMode
            );
            setShortcut(
                shortcutResult.status === 'fulfilled'
                    ? (shortcutResult.value ?? defaultSettings.shortcut)
                    : defaultSettings.shortcut
            );
            setDataUsage(
                dataUsageResult.status === 'fulfilled'
                    ? (dataUsageResult.value ?? defaultSettings.dataUsage)
                    : defaultSettings.dataUsage
            );
        };

        loadSettings();
    }, []);

    // --- Effect for checking new updates ---
    useEffect(() => {
        if (canCheckNewVer) {
            fetchReleaseVersion();
            canCheckNewVer = false;
        }
    }, []);

    // --- Effect for handling IPC messages ---
    useEffect(() => {
        const handleGuideToast = (message: any) => {
            if (message === 'error_port_restart') {
                loadingToast(appLang.log.error_port_restart);
            } else {
                defaultToast(message, TOAST_IDS.GUIDE, 7000);
            }
        };

        const handleSbTerminate = (message: any) => {
            if (message === 'terminated') {
                setIsLoading(false);
                setIsConnected(false);
                loadingToast(appLang.status.keep_trying);
                delayAction(() => {
                    setIsLoading(true);
                    stopLoadingToast();
                }, 3500);
            } else if (message === 'restarted') {
                setIsLoading(false);
                setIsConnected(true);
            } else if (message === 'exceeded') {
                setIsLoading(false);
                setIsConnected(false);
                delayAction(() => {
                    defaultToast(appLang.log.error_deadline_exceeded, TOAST_IDS.EXCEEDED, 5000);
                }, 3000);
            }
        };

        const handleTrayMenu = (args: any) => {
            if (args.key === 'connect' && !isLoading) {
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
                setProxyStatus(proxyMode);
                ipcRenderer.sendMessage(IPC_ACTIONS.WP_START);
                setIsLoading(true);
                setPing(0);
            }
            if (args.key === 'disconnect' && !isLoading) {
                ipcRenderer.sendMessage(IPC_ACTIONS.WP_END);
                setIsLoading(true);
            }
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        };

        ipcRenderer.on(IPC_ACTIONS.GUIDE_TOAST, handleGuideToast);
        ipcRenderer.on(IPC_ACTIONS.SB_TERMINATE, handleSbTerminate);
        ipcRenderer.on(IPC_ACTIONS.TRAY_MENU, handleTrayMenu);
    }, [
        appLang.log.error_deadline_exceeded,
        appLang.log.error_port_restart,
        appLang.status.keep_trying
    ]);

    // --- Effect for online/offline status ---
    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // --- Effect for updating online status and IP ---
    useEffect(() => {
        if (online) {
            toast.remove(TOAST_IDS.ONLINE_STATUS);
            handleOnClickIp();
        } else {
            defaultToast(appLang?.toast?.offline, TOAST_IDS.ONLINE_STATUS, 7000);
        }
    }, [appLang?.toast?.offline, online]);

    // --- Effect for netStats ---
    useEffect(() => {
        const handleNetStats = (event: any) => {
            setNetStats((prevNetStats) => ({
                ...prevNetStats,
                sentSpeed: event?.sentSpeed,
                recvSpeed: event?.recvSpeed,
                totalSent: event?.totalSent,
                totalRecv: event?.totalRecv,
                totalUsage: event?.totalUsage
            }));
        };

        if (isConnected && dataUsage) {
            ipcRenderer.on(IPC_ACTIONS.NETSTATS_STATS, handleNetStats);
        }
    }, [dataUsage, isConnected]);

    // --- Effect for IP changes ---
    useEffect(() => {
        if (ipInfo?.countryCode) {
            if (method === '' && ipInfo?.countryCode === 'ir') {
                ipToast(appLang);
            } else if (method === 'gool' && ipInfo?.countryCode === 'ir') {
                ipcRenderer.sendMessage(IPC_ACTIONS.WP_END);
                setIsLoading(true);
                loadingToast(appLang.status.keep_trying);
                setTimeout(function () {
                    stopLoadingToast();
                    ipcRenderer.sendMessage(IPC_ACTIONS.WP_START);
                    setIsLoading(true);
                    setPing(0);
                }, 3500);
            } else {
                toast.remove(TOAST_IDS.IP_CHANGED_TO_IR);
            }
        }
    }, [ipInfo, method, appLang]);

    // --- Effect for escape key and initial toast removal ---
    useEffect(() => {
        onEscapeKeyPressed(() => {
            setDrawerIsOpen(false);
        });
        toast.remove(TOAST_IDS.COPIED);
    }, []);

    // --- Effect for status text, connection, and IP updates ---
    useEffect(() => {
        if (isLoading || !isConnected) {
            toast.remove(TOAST_IDS.IP_CHANGED_TO_IR);
            toast.remove(TOAST_IDS.IP_LOCATION_STATUS);
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
                getIpLocation(isConnected, isLoading, method, setIpInfo, setPing, appLang);
            } else {
                setStatusText(`${appLang?.status?.connected}`);
            }
        } else if (isConnected && !ipData) {
            setStatusText(`${appLang?.status?.connected}`);
        } else {
            setStatusText(`${appLang?.status?.disconnected}`);
            toast.remove(TOAST_IDS.IRAN_IP);
        }

        ipcRenderer.on(IPC_ACTIONS.WP_START, (ok) => {
            if (ok) {
                setIsLoading(false);
                setIsConnected(true);
            }
        });

        ipcRenderer.on(IPC_ACTIONS.WP_END, (ok) => {
            if (ok) {
                setIsConnected(false);
                setIsLoading(false);
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
            }
        });
    }, [isLoading, isConnected, ipInfo, ipData, proxyStatus, appLang, method]);

    // --- Callback for handling connection changes ---
    const onChange = useCallback(() => {
        if (!navigator.onLine) {
            if (isConnected) {
                ipcRenderer.sendMessage(IPC_ACTIONS.WP_END);
                setIsLoading(true);
                toast.remove(TOAST_IDS.ONLINE_STATUS);
            } else {
                defaultToast(appLang?.toast?.offline, TOAST_IDS.ONLINE_STATUS, 7000);
            }
        } else {
            if (isLoading) {
                ipcRenderer.sendMessage(IPC_ACTIONS.WP_END);
            } else if (isConnected) {
                ipcRenderer.sendMessage(IPC_ACTIONS.WP_END);
                setIsLoading(true);
            } else {
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
                setProxyStatus(proxyMode);
                ipcRenderer.sendMessage(IPC_ACTIONS.WP_START);
                setIsLoading(true);
                setPing(0);
            }
        }
    }, [appLang?.toast?.offline, isLoading, isConnected, setIsLoading, setProxyStatus, proxyMode]);

    // --- Callback for form submission ---
    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onChange();
        },
        [onChange]
    );

    // --- Callbacks for swipe actions ---
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

    // --- Callback for clicking the IP address ---
    const handleOnClickIp = useCallback(() => {
        setIpInfo({
            countryCode: false,
            ip: ''
        });

        const getTime = new Date().getTime();
        if (cachedIpInfo && getTime - lastFetchTime < CACHE_DURATION) {
            return;
        } else {
            getIpLocation(isConnected, isLoading, method, setIpInfo, setPing, appLang);
        }
    }, [isConnected, isLoading, method, appLang]);

    // --- Callback for clicking the ping value ---
    const handleOnClickPing = useCallback(() => {
        if (ping >= 0) {
            setPing(0);
            setTimeout(async () => {
                await getPing(ipInfo, setPing);
            }, 1500);
        }
    }, [ping, ipInfo]);

    // --- Callback for handling keyboard events on the menu ---
    const handleMenuOnKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            toggleDrawer();
        }
    }, []);

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
