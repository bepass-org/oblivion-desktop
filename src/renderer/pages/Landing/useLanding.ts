import { FormEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';
import { useStore } from '../../store';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { ipcRenderer, onEscapeKeyPressed } from '../../lib/utils';
import {
    defaultToast,
    defaultToastWithSubmitButton,
    loadingToast,
    stopLoadingToast
} from '../../lib/toasts';
import packageJsonData from '../../../../package.json';
import { getLanguageName } from '../../../localization';
import useTranslate from '../../../localization/useTranslate';
import { INetStats } from '../../../constants';
import { isSystemDateValid } from '../../lib/systemDateValidator';
import { withDefault } from '../../lib/withDefault';

export type IpConfig = {
    countryCode: string | boolean;
    ip: string;
};

let isFetching = false;
let cachedIpInfo: IpConfig | null = null;
let lastFetchTime = 0;
const cacheDuration = 10 * 1000;
let connectedToIrIPOnceDisplayed = false;

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
        isLoading,
        setIsLoading,
        isCheckingForUpdates,
        setIsCheckingForUpdates,
        hasNewUpdate,
        downloadProgress,
        statusText,
        setStatusText,
        proxyStatus,
        setProxyStatus,
        proxyMode
    } = useStore();
    const [ipInfo, setIpInfo] = useState<IpConfig>({
        countryCode: false,
        ip: ''
    });

    const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
    const toggleDrawer = (newState?: boolean) => {
        const isFull = window?.innerWidth > 1049;
        if (!isFull)
            setDrawerIsOpen(typeof newState == 'boolean' ? newState : (prevState) => !prevState);
    };

    const [lang, setLang] = useState<string>();
    const [ipData, setIpData] = useState<boolean>();
    const [method, setMethod] = useState<string>('');
    const [ping, setPing] = useState<number>(0);
    const [netStats, setNetStats] = useState<INetStats>(defaultNetStats);
    const [dataUsage, setDataUsage] = useState<boolean>(false);
    const [betaRelease, setBetaRelease] = useState<boolean>(false);
    const [testUrl, setTestUrl] = useState<string>();

    const getIpLocation = async () => {
        if (isFetching || isLoading || !isConnected) return;
        isFetching = true;
        try {
            const currentTime = Date.now();
            if (cachedIpInfo && currentTime - lastFetchTime < cacheDuration) {
                setIpInfo(cachedIpInfo);
                return;
            }
            const traceStarted = window.performance.now();
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 5000);
            const response = await fetch(
                String(
                    testUrl?.includes('connectivity') ? testUrl.replace('https', 'http') : testUrl
                ),
                {
                    signal
                }
            );
            const data = await response.text();
            const parseLine = (key: string) =>
                data
                    .split('\n')
                    .find((line) => line.startsWith(`${key}=`))
                    ?.split('=')[1];
            const getIp = parseLine('ip') || '127.0.0.1';
            const getLoc = parseLine('loc')?.toLowerCase() || false;
            const checkWarp = parseLine('warp') || '';
            const cfHost = parseLine('h') || 'off';
            if (getLoc && (cfHost === '1.1.1.1' || cfHost === new URL(String(testUrl)).hostname)) {
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

    const onChange = useCallback(() => {
        if (!isSystemDateValid()) {
            defaultToast(appLang?.log?.error_local_date, 'GUIDE', 7000);
            return;
        }
        if (!navigator.onLine) {
            //checkInternetToast(appLang?.toast?.offline);
            if (isConnected || isLoading) {
                ipcRenderer.sendMessage('wp-end');
                if (!isLoading) {
                    setIsLoading(true);
                }
                toast.remove('ONLINE_STATUS');
            } else {
                defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', 7000);
            }
            return;
        }
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
    }, [appLang?.toast?.offline, isLoading, isConnected, proxyMode]);

    const handleOnClickIp = () => {
        const getTime = new Date().getTime();
        if (cachedIpInfo && getTime - lastFetchTime < cacheDuration) {
            setIpInfo({
                countryCode: false,
                ip: ''
            });
            return;
        }
        getIpLocation();
    };

    useEffect(() => {
        //ipcRenderer.clean();

        settings
            .getMultiple([
                'lang',
                'ipData',
                'method',
                //'shortcut',
                'dataUsage',
                'betaRelease',
                'testUrl'
            ])
            .then((values) => {
                setLang(withDefault(values.lang, getLanguageName()));
                setIpData(withDefault(values.ipData, defaultSettings.ipData));
                setMethod(withDefault(values.method, defaultSettings.method));
                // setShortcut(withDefault(values.shortcut, defaultSettings.shortcut)); // Optional if needed
                setDataUsage(withDefault(values.dataUsage, defaultSettings.dataUsage));
                setBetaRelease(withDefault(values.betaRelease, defaultSettings.betaRelease));
                setTestUrl(withDefault(values.testUrl, defaultSettings.testUrl));
            })
            .catch((error) => {
                console.log('Error fetching settings:', error);
            });

        cachedIpInfo = null;

        const onEscapeKeyPressedHandler = onEscapeKeyPressed(() => {
            toggleDrawer(false);
        });
        toast.remove('COPIED');

        const handleResize = () => {
            const isFull = window?.innerWidth > 1049;
            setTimeout(() => setDrawerIsOpen(isFull), 300);
        };
        handleResize();

        const onWPEnd = ipcRenderer.on('wp-end', (ok: any) => {
            if (ok) {
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
            }
        });

        const handleOnlineStatusChange = debounce(() => {
            if (navigator.onLine) {
                toast.remove('ONLINE_STATUS');
                handleOnClickIp();
            } else {
                defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', 7000);
            }
        }, 2000);

        window.addEventListener('resize', handleResize);
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);
        handleOnlineStatusChange();

        return () => {
            ipcRenderer.removeListener('wp-end', onWPEnd);
            window.removeEventListener('keydown', onEscapeKeyPressedHandler);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('online', handleOnlineStatusChange);
            window.removeEventListener('offline', handleOnlineStatusChange);
        };
    }, []);

    useEffect(() => {
        if (drawerIsOpen && downloadProgress.percent == 0) {
            const onDownloadProgress = ipcRenderer.once('download-progress', (args: any) => {
                toggleDrawer(false);
            });

            return () => {
                ipcRenderer.removeListener('download-progress', onDownloadProgress);
            };
        }
    }, [drawerIsOpen]);

    useEffect(() => {
        if (!isConnected || !dataUsage) return;
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

        return () => {
            ipcRenderer.removeAllListeners('net-stats');
        };
    }, [dataUsage, isConnected]);

    const ipToast = () => {
        if (connectedToIrIPOnceDisplayed) return;
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

    useEffect(() => {
        if (!ipInfo) return;
        if (typeof ipInfo?.countryCode !== 'string') return;
        if (method === '' && ipInfo?.countryCode === 'ir') {
            ipToast();
        } else if (method === 'gool' && ipInfo?.countryCode === 'ir') {
            ipcRenderer.sendMessage('wp-end', 'stop-from-gool');
            setIsLoading(true);
            loadingToast(appLang.status.keep_trying);
            setTimeout(function () {
                stopLoadingToast();
                ipcRenderer.sendMessage('wp-start', 'start-from-gool');
                setIsLoading(true);
                setPing(0);
            }, 3500);
        } else {
            toast.remove('IRAN_IP');
        }
    }, [method, ipInfo, appLang.status.keep_trying]);

    useEffect(() => {
        if (!isConnected) {
            toast.remove('IRAN_IP');
            setStatusText(isLoading ? appLang?.status?.connecting : appLang?.status?.disconnected);
            return;
        }

        if (isLoading) {
            setStatusText(appLang?.status?.disconnecting);
            return;
        }

        if (!hasNewUpdate && !isCheckingForUpdates) ipcRenderer.sendMessage('check-update');

        if (ipInfo?.countryCode) {
            setStatusText(appLang?.status?.connected_confirm);
            return;
        }

        if (ipData) {
            if (proxyStatus !== 'none') {
                setStatusText(appLang?.status?.ip_check);
                getIpLocation();
            } else {
                setStatusText(appLang?.status?.connected);
            }
        } else {
            setStatusText(appLang?.status?.connected);
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
        setIsCheckingForUpdates,
        isCheckingForUpdates,
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
        shortcut: true,
        netStats,
        dataUsage,
        betaRelease,
        downloadProgress
    };
};
export default useLanding;
