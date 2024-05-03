import { useEffect, useState } from 'react';
import classNames from 'classnames';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ReactCountryFlag from 'react-country-flag';
import { ipcRenderer } from '../lib/utils';
import { useStore } from '../store';
import appIco from '../../../assets/oblivion.png';
import defFlag from '../../../assets/img/flags/xx.svg';
import irFlag from '../../../assets/img/flags/ir.svg';
import { settings } from '../lib/settings';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import packageJsonData from '../../../package.json';
import { defaultSettings } from '../../defaultSettings';

let cachedIpInfo: any = null;
let lastFetchTime = 0;
const cacheDuration = 30 * 1000;
let connectedToIrIPOnceDisplayed = false;
let canCheckNewVer = true;
let hasNewUpdate = false;

export default function Index() {
    const [status, setStatus] = useState<string>('متصل نیستید');
    const { isConnected, setIsConnected } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [ipInfo, setIpInfo] = useState<{
        countryCode: string | boolean;
        ip: string;
    }>({
        countryCode: false,
        ip: '1.1.1.1'
    });
    const [shownIpData, setShownIpData] = useState(true);
    const [online, setOnline] = useState(true);

    const [drawerIsOpen, setDrawerIsOpen] = useState(false);
    const toggleDrawer = () => {
        setDrawerIsOpen((prevState) => !prevState);
    };

    const [theme, setTheme] = useState<undefined | string>();
    const [ipData, setIpData] = useState<undefined | boolean>();
    const [psiphon, setPsiphon] = useState<undefined | boolean>();
    const [gool, setGool] = useState<undefined | boolean>();

    const fetchReleaseVersion = async () => {
        const versionRegex = /\d+(\.\d+)+/;
        try {
            const response = await fetch('https://api.github.com/repos/ircfspace/fragment/releases/latest');
            if (response.ok) {
                const data = await response.json();
                const latestVersion = String(data?.tag_name);
                const appVersion = String(packageJsonData?.version);
                if (latestVersion !== appVersion) {
                    hasNewUpdate = true;
                }
            } else {
                console.error('Failed to fetch release version:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch release version:', error);
        }
    };

    useEffect(() => {
        settings.get('theme').then((value) => {
            setTheme(typeof value === 'undefined' ? defaultSettings.theme : value);
        });
        settings.get('ipData').then((value) => {
            setIpData(typeof value === 'undefined' ? defaultSettings.ipData : value);
        });
        settings.get('psiphon').then((value) => {
            setPsiphon(typeof value === 'undefined' ? defaultSettings.psiphon : value);
        });
        settings.get('gool').then((value) => {
            setGool(typeof value === 'undefined' ? defaultSettings.gool : value);
        });

        cachedIpInfo = null;
        if (canCheckNewVer) {
            fetchReleaseVersion().then();
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
            }
        });

        setOnline(true);
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
        return () => {
            window.removeEventListener('online', () => setOnline(true));
            window.removeEventListener('offline', () => setOnline(false));
        };
    }, []);

    const ipToast = async () => {
        if (connectedToIrIPOnceDisplayed) {
            return false;
        }
        toast(
            (currentToast) => (
                <>
                    <div className='customToast'>
                        <p>
                            کلودفلر به یک IP با لوکیشن ایران که متفاوت از آیپی اصلیته وصلت کرده،
                            که باهاش میتونی فیلترینگ‌رو دور بزنی، اما تحریم‌هارو نه. نگران نباش!
                            در تنظیمات میتونی توسط گزینه «گول» یا «سایفون» لوکیشن رو تغییر بدی.
                        </p>
                        <button onClick={() => toast.dismiss(currentToast?.id)}>
                            متوجه شدم
                        </button>
                    </div>
                </>
            ),
            {
                id: 'ipChangedToIR',
                duration: Infinity,
                style: {
                    borderRadius: '10px',
                    background: theme === 'dark' ? '#535353' : '#242424',
                    color: '#F4F5FB'
                }
            }
        );
        connectedToIrIPOnceDisplayed = true;
    };

    const getIpLocation = async () => {
        try {
            const currentTime = new Date().getTime();
            if (cachedIpInfo && (currentTime - lastFetchTime) < cacheDuration) {
                setIpInfo(cachedIpInfo);
            } else {
                if (isConnected && !isLoading) {
                    const controller = new AbortController();
                    const signal = controller.signal;
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                        console.log('Fetching aborted due to timeout.');
                    }, 5000);
                    const response = await fetch('https://cloudflare.com/cdn-cgi/trace', { signal });
                    const data = await response.text();
                    const lines = data.split('\n');
                    const ipLine = lines.find((line) => line.startsWith('ip='));
                    const locationLine = lines.find((line) => line.startsWith('loc='));
                    const getIp = ipLine ? ipLine.split('=')[1] : '127.0.0.1';
                    const getLoc = locationLine ? locationLine.split('=')[1].toLowerCase() : false;
                    const ipInfo = {
                        countryCode: ((psiphon || gool) && getLoc === 'ir' ? 'xx' : getLoc),
                        ip: getIp
                    };
                    cachedIpInfo = ipInfo;
                    lastFetchTime = currentTime;
                    setIpInfo(ipInfo);
                    clearTimeout(timeoutId);
                    toast.dismiss('ipLocationStatus');
                }
            }
        } catch (error) {
            setIpInfo({
                countryCode: false,
                ip: ''
            });
        }
    };

    useEffect(() => {
        if (ipInfo?.countryCode) {
            if ((psiphon || gool) && ipInfo?.countryCode === 'ir') {
                ipToast().then();
            } else {
                toast.dismiss('ipChangedToIR');
            }
        }
    }, [ipInfo]);

    const checkInternet = async () => {
        toast('شما به اینترنت متصل نیستید!', {
            id: 'onlineStatus',
            duration: Infinity,
            style: {
                fontSize: '13px',
                borderRadius: '10px',
                background: '#333',
                color: '#fff'
            }
        });
    };

    useEffect(() => {

        if (typeof ipData === 'undefined' || ipData) {
            getIpLocation().then();
        } else {
            setShownIpData(false);
        }

        if (isLoading || !isConnected) {
            toast.dismiss('ipChangedToIR');
            toast.dismiss('ipLocationStatus');
        }

        if (online) {
            toast.dismiss('onlineStatus');
        } else {
            checkInternet().then();
        }

        if (isConnected && isLoading) {
            setStatus('قطع ارتباط ...');
        } else if (!isConnected && isLoading) {
            setStatus('درحال اتصال ...');
        } else if (isConnected && ipInfo?.countryCode) {
            setStatus('متصل هستید');
        } else if (isConnected && !ipInfo?.countryCode && shownIpData) {
            setStatus('دریافت اطلاعات ...');
        } else if (isConnected && !shownIpData) {
            setStatus('اتصال برقرار شد');
        } else {
            setStatus('متصل نیستید');
        }
    }, [isLoading, isConnected, online, shownIpData, ipInfo]);

    const onChange = () => {
        if (!online) {
            checkInternet().then();
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
            }
        }
    };

    return (
        <>
            <Drawer
                open={drawerIsOpen}
                onClose={toggleDrawer}
                lockBackgroundScroll={false}
                overlayOpacity={1}
                duration={250}
                direction='right'
                className='drawer'
                overlayClassName='drawerOverlay'
                size='80vw'
            >
                <div className='list'>
                    <div className='appName'>
                        <img src={appIco} alt='icon' />
                        <h3>
                            Oblivion <small>Desktop</small>
                        </h3>
                    </div>
                    <ul>
                        <li>
                            <Link to={'/settings'}>
                                <i className={'material-icons'}>&#xe429;</i>
                                <span>تنظیمات پروکسی</span>
                            </Link>
                        </li>
                        {/*<li>
                            <Link to={'/routing'}>
                                <i className={'material-icons'}>&#xe90e;</i>
                                <span>قوانین مسیریابی</span>
                            </Link>
                        </li>*/}
                        <li className='divider'></li>
                        <li>
                            <Link to={'/options'}>
                                <i className={'material-icons'}>&#xe8b8;</i>
                                <span>تنظیمات برنامه</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={'/debug'}>
                                <i className={'material-icons'}>&#xe868;</i>
                                <span>لاگ برنامه</span>
                            </Link>
                        </li>
                        <li className={hasNewUpdate ? '' : 'hidden'}>
                            <a href='https://github.com/bepass-org/oblivion-desktop/releases/latest' target='_blank'>
                                <i className={'material-icons'}>&#xe923;</i>
                                <span>بروزرسانی</span>
                                <div className='label label-warning label-xs'>نسخه جدید</div>
                            </a>
                        </li>
                        <li className='divider'></li>
                        <li>
                            <Link to='/about'>
                                <i className={'material-icons'}>&#xe88e;</i>
                                <span>درباره برنامه</span>
                            </Link>
                        </li>
                    </ul>
                    <div className='appVersion'>
                        v<b>{packageJsonData.version}</b>
                    </div>
                </div>
            </Drawer>
            <nav>
                <div className='container'>
                    <a onClick={toggleDrawer} className='navMenu'>
                        <i className={classNames('material-icons', 'pull-right')}>&#xe5d2;</i>
                        <div
                            className={classNames('indicator', hasNewUpdate ? '' : 'hidden')}
                        ></div>
                    </a>
                    {/*<Link to={'/debug'}>
                        <i className={classNames('material-icons', 'pull-right', 'log')}>
                            &#xe868;
                        </i>
                    </Link>*/}
                    <Link to='/about'>
                        <i className={classNames('material-icons', 'pull-left')}>&#xe88e;</i>
                    </Link>
                </div>
            </nav>
            <div className={classNames('myApp', 'verticalAlign')}>
                <div className='container'>
                    <div className='homeScreen'>
                        <h1>OBLIVION</h1>
                        <h2>بر پایه وارپ</h2>
                        <form action=''>
                            <div className='connector'>
                                <div
                                    className={classNames(
                                        'switch',
                                        isConnected ? 'active' : '',
                                        isLoading ? 'isLoading' : ''
                                    )}
                                    onClick={onChange}
                                >
                                    <div className='circle'>
                                        <div className='spinner' />
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div
                            className={classNames(
                                'status',
                                isConnected && ipInfo?.countryCode && !isLoading ? 'active' : ''
                            )}
                        >
                            {status}
                            <br />
                            <div
                                className={classNames(
                                    'ip',
                                    isConnected && ipInfo?.countryCode && !isLoading
                                        ? 'connected'
                                        : ''
                                )}
                                onClick={() => {
                                    setIpInfo({
                                        countryCode: false,
                                        ip: ''
                                    });
                                    const getTime = new Date().getTime();
                                    if (cachedIpInfo && (getTime - lastFetchTime) < cacheDuration) {
                                        toast('برای بررسی مجدد چندثانیه دیگر تلاش کنید!', {
                                            id: 'ipLocationStatus',
                                            duration: 2000,
                                            style: {
                                                fontSize: '13px',
                                                borderRadius: '10px',
                                                background: '#333',
                                                color: '#fff'
                                            }
                                        });
                                    } else {
                                        getIpLocation().then();
                                    }
                                }}
                            >
                                {ipInfo.countryCode ? (
                                    ipInfo?.countryCode === 'ir' ? (
                                        <>
                                            <img src={irFlag} alt='flag' />
                                        </>
                                    ) : (
                                        <>
                                            <ReactCountryFlag
                                                countryCode={String(ipInfo.countryCode)}
                                                svg
                                                style={{
                                                    width: '17px',
                                                    height: '12px'
                                                }}
                                            />
                                        </>
                                    )
                                ) : (
                                    <>
                                        <img src={defFlag} alt='flag' />
                                    </>
                                )}
                                <span>{ipInfo?.ip}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
