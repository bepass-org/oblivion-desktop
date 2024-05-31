import { FormEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Drawer from 'react-modern-drawer';
import { Swipe } from 'react-swipe-component';
import { useStore } from '../store';
import { getLang } from '../lib/loaders';
import appIco from '../../../assets/oblivion.png';
import { settings } from '../lib/settings';
import 'react-modern-drawer/dist/index.css';
import packageJsonData from '../../../package.json';
import { defaultSettings } from '../../defaultSettings';
import { ipcRenderer, onEscapeKeyPressed, isDev } from '../lib/utils';
import { checkInternetToast, defaultToast, defaultToastWithSubmitButton } from '../lib/toasts';
import { checkNewUpdate } from '../lib/checkNewUpdate';
import { cfFlag } from '../lib/cfFlag';
import AnimatedComponent from '../components/Animated';

let cachedIpInfo: any = null;
let lastFetchTime = 0;
const cacheDuration = 10 * 1000;
let connectedToIrIPOnceDisplayed = false;
let canCheckNewVer = true;
let hasNewUpdate = false;

export default function Index() {
    const appLang = getLang();
    const { isConnected, setIsConnected, isLoading, setIsLoading, statusText, setStatusText } =
        useStore();
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

        ipcRenderer.on('wp-start', (ok) => {
            if (ok) {
                setIsLoading(false);
                setIsConnected(true);
            }
        });

        ipcRenderer.on('wp-end', (ok) => {
            console.log('🚀 - ipcRenderer.once - ok:', ok);
            if (ok) {
                setIsConnected(false);
                setIsLoading(false);
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
            }
        });

        ipcRenderer.on('guide-toast', (message: any) => {
            defaultToast(message, 'GUIDE', 7000);
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
            toast.dismiss('ONLINE_STATUS');
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
                        console.log('Fetching aborted due to timeout.');
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
                    toast.dismiss('ipLocationStatus');
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
                toast.dismiss('ipChangedToIR');
            }
        }
    }, [ipInfo]);

    useEffect(() => {
        onEscapeKeyPressed(() => {
            setDrawerIsOpen(false);
        });
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
            toast.dismiss('ipChangedToIR');
            toast.dismiss('ipLocationStatus');
        }

        if (isConnected && isLoading) {
            setStatusText(`${appLang?.status?.disconnecting}`);
        } else if (!isConnected && isLoading) {
            setStatusText(`${appLang?.status?.connecting}`);
        } else if (isConnected && ipInfo?.countryCode) {
            setStatusText(`${appLang?.status?.connected_confirm}`);
        } else if (isConnected && !ipInfo?.countryCode && ipData) {
            setStatusText(`${appLang?.status?.ip_check}`);
        } else if (isConnected && !ipData) {
            setStatusText(`${appLang?.status?.connected}`);
        } else {
            setStatusText(`${appLang?.status?.disconnected}`);
        }
    }, [isLoading, isConnected, ipInfo, ipData]);

    const onChange = useCallback(() => {
        if (!online) {
            checkInternetToast();
        } else {
            if (isLoading) {
                console.log('🚀 - onChange - isLoading:', isLoading);
                ipcRenderer.sendMessage('wp-end');
            } else if (isConnected) {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
            } else {
                setIpInfo({
                    countryCode: false,
                    ip: ''
                });
                ipcRenderer.sendMessage('wp-start');
                setIsLoading(true);
                setPing(0);
            }
        }
    }, [online, isLoading, isConnected, setIsLoading]);

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

    return (
        <AnimatedComponent>
            <nav className='header'>
                <div className='container'>
                    <div
                        onClick={toggleDrawer}
                        className='navMenu'
                        role='menu'
                        aria-controls='menu'
                        tabIndex={-1}
                        onKeyDown={handleMenuOnKeyDown}
                    >
                        <i className={classNames('material-icons', 'pull-right')}>&#xe5d2;</i>
                        <div className={classNames('indicator', hasNewUpdate ? '' : 'hidden')} />
                    </div>
                    <Link to='/about' tabIndex={-2}>
                        <i className={classNames('material-icons', 'navLeft')}>&#xe88e;</i>
                    </Link>
                    <Link to={'/debug'} tabIndex={-3}>
                        <i className={classNames('material-icons', 'log')}>&#xe868;</i>
                    </Link>
                </div>
            </nav>
            <Drawer
                open={drawerIsOpen}
                onClose={toggleDrawer}
                lockBackgroundScroll={false}
                overlayOpacity={1}
                duration={250}
                direction={lang === 'fa' ? 'right' : 'left'}
                className='drawer'
                overlayClassName='drawerOverlay'
                size='80vw'
            >
                <div className='list'>
                    <div className='appName' role='main'>
                        <img src={appIco} alt='Oblivion Logo' />
                        <h3>
                            Oblivion <small>Desktop</small>
                        </h3>
                    </div>
                    <ul role='menu' aria-labelledby='menubutton'>
                        <li role='presentation'>
                            <Link to={'/settings'} role='menuitem'>
                                <i className={'material-icons'}>&#xe429;</i>
                                <span>{appLang?.home?.drawer_settings_warp}</span>
                            </Link>
                        </li>
                        {/*<li>
                            <Link to={'/routing'}>
                                <i className={'material-icons'}>&#xe90e;</i>
                                <span>{appLang?.home?.drawer_settings_routing_rules}</span>
                            </Link>
                        </li>*/}
                        {/*<li className='divider'></li>*/}
                        <li role='presentation'>
                            <Link to={'/network'} role='menuitem'>
                                <i className={'material-icons'}>&#xeb2f;</i>
                                <span>{appLang?.home?.drawer_settings_network}</span>
                            </Link>
                        </li>
                        <li role='presentation'>
                            <Link to={'/scanner'} role='menuitem'>
                                <i className={'material-icons'}>&#xe2db;</i>
                                <span>{appLang?.home?.drawer_settings_scanner}</span>
                            </Link>
                        </li>
                        <li role='presentation'>
                            <Link to={'/options'} role='menuitem'>
                                <i className={'material-icons'}>&#xe8b8;</i>
                                <span>{appLang?.home?.drawer_settings_app}</span>
                            </Link>
                        </li>
                        <li className='divider' />
                        {/*<li>
                            <Link to='/speed'>
                                <i className={'material-icons'}>&#xe9e4;</i>
                                <span>{appLang?.home?.drawer_speed_test}</span>
                            </Link>
                        </li>*/}
                        <li className={hasNewUpdate ? '' : 'hidden'} role='presentation'>
                            <a
                                href='https://github.com/bepass-org/oblivion-desktop/releases/latest'
                                target='_blank'
                                rel='noreferrer'
                                role='menuitem'
                            >
                                <i className={'material-icons'}>&#xe923;</i>
                                <span>{appLang?.home?.drawer_update}</span>
                                <div className='label label-warning label-xs'>
                                    {appLang?.home?.drawer_update_label}
                                </div>
                            </a>
                        </li>
                        {/*<li>
                            <a
                                onClick={() => {
                                    navigate('/options', { state: { targetId: 'languages' } });
                                }}
                            >
                                <i className='material-icons'>&#xe8e2;</i>
                                <span>{appLang?.home?.drawer_lang}</span>
                            </a>
                        </li>*/}
                        <li role='presentation'>
                            <Link to='/about' role='menuitem'>
                                <i className={'material-icons'}>&#xe88e;</i>
                                <span>{appLang?.home?.drawer_about}</span>
                            </Link>
                        </li>
                        <li role='presentation'>
                            <Link to={'/debug'} role='menuitem'>
                                <i className={'material-icons'}>&#xe868;</i>
                                <span>{appLang?.home?.drawer_log}</span>
                            </Link>
                        </li>
                    </ul>
                    <div className='appVersion' role='note'>
                        v<b>{packageJsonData.version}</b>
                    </div>
                </div>
            </Drawer>
            <div className={classNames('myApp', 'verticalAlign')}>
                <div className='container'>
                    <div className='homeScreen'>
                        <div className='title'>
                            <h1>OBLIVION</h1>
                            <h2>{appLang?.home?.title_warp_based}</h2>
                        </div>
                        <form action='' onSubmit={onSubmit}>
                            <div className='connector'>
                                <Swipe
                                    nodeName='div'
                                    onSwipedLeft={handleOnSwipedLeft}
                                    onSwipedRight={handleOnSwipedRight}
                                >
                                    <button
                                        type='submit'
                                        role='switch'
                                        aria-checked={isConnected}
                                        tabIndex={0}
                                        className={classNames(
                                            'switch',
                                            isConnected ? 'active' : '',
                                            isLoading ? 'isLoading' : ''
                                        )}
                                    >
                                        <div className='circle'>
                                            <div className='spinner' />
                                        </div>
                                    </button>
                                </Swipe>
                            </div>
                        </form>
                        <div
                            className={classNames(
                                'status',
                                isConnected && !isLoading && (ipInfo?.countryCode || !ipData)
                                    ? 'active'
                                    : ''
                            )}
                        >
                            {statusText}
                        </div>
                        <div
                            className={classNames(
                                'inFoot',
                                'withIp',
                                isConnected &&
                                    !isLoading &&
                                    proxyMode !== 'none' &&
                                    proxyMode !== '' &&
                                    ipData
                                    ? 'active'
                                    : ''
                            )}
                        >
                            <div
                                role='presentation'
                                className={classNames('item', ipData ? '' : 'hidden')}
                                onClick={handleOnClickIp}
                            >
                                <img
                                    src={cfFlag(ipInfo.countryCode ? ipInfo?.countryCode : 'xx')}
                                    alt={`${ipInfo?.countryCode} Flag`}
                                />
                                <span className={ipInfo?.countryCode ? '' : 'shimmer'}>
                                    {ipInfo.ip ? ipInfo.ip : '127.0.0.1'}
                                </span>
                            </div>
                            <div
                                role='presentation'
                                className={classNames('item', 'ping')}
                                onClick={handleOnClickPing}
                            >
                                <i className='material-icons'>&#xebca;</i>
                                <span className={ping === 0 ? 'shimmer' : ''}>
                                    {ping > 0
                                        ? String(ping).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ms'
                                        : 'timeout'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </AnimatedComponent>
    );
}
