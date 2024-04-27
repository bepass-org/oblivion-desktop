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

export default function Index() {
    const { isConnected, setIsConnected } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [ipInfo, setIpInfo] = useState({
        countryCode: false,
        ip: '127.0.0.1',
    });
    const [shownIpData, setShownIpData] = useState(true);
    const [online, setOnline] = useState(true);

    const [drawerIsOpen, setDrawerIsOpen] = useState(false);
    const toggleDrawer = () => {
        setDrawerIsOpen((prevState) => !prevState);
    };

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        setOnline(true);
        window.addEventListener('online', () => setOnline(true));
        window.addEventListener('offline', () => setOnline(false));
        return () => {
            window.removeEventListener('online', () => setOnline(true));
            window.removeEventListener('offline', () => setOnline(false));
        };
    }, []);

    const ipToast = async () => {
        settings.get('theme').then((value) => {
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
                        background: value === 'dark' ? '#535353' : '#242424',
                        color: '#F4F5FB',
                    },
                },
            );
        });
    };

    const getIpLocation = () => {
        if (isConnected && !isLoading) {
            fetch('https://api.ipify.org/?format=json')
                .then((response) => response.json())
                .then((data) => {
                    const userIp = data?.ip;
                    fetch(`https://api.iplocation.net/?ip=${userIp}`)
                        .then((response) => response.json())
                        .then((locationData) => {
                            setIpInfo({
                                countryCode: locationData.country_code2.toLowerCase(),
                                ip: locationData.ip,
                            });
                            if (locationData?.country_code2 === 'IR') {
                                ipToast();
                            }
                        })
                        .catch((error) => {
                            console.error('Error fetching IP location:', error);
                        });
                })
                .catch((error) => {
                    console.error('Error fetching user IP:', error);
                });
        }
    };

    const checkInternet = async () => {
        settings.get('theme').then((value) => {
            toast('شما به اینترنت متصل نیستید!', {
                id: 'onlineStatus',
                duration: Infinity,
                style: {
                    borderRadius: '10px',
                    background: value === 'dark' ? '#535353' : '#242424',
                    color: '#F4F5FB',
                },
            });
        });
    };

    useEffect(() => {
        settings.get('ipData').then((value) => {
            if (typeof value === 'undefined' || value) {
                getIpLocation();
            } else {
                setShownIpData(false);
            }
        });
        if (isLoading || !isConnected) {
            toast.dismiss('ipChangedToIR');
        }
        if (online) {
            toast.dismiss('onlineStatus');
        } else {
            checkInternet();
        }
    }, [isLoading, isConnected, online]);

    const onChange = () => {
        if (!online) {
            checkInternet();
        } else {
            if (isLoading) {
                console.log('🚀 - onChange - isLoading:', isLoading);
                ipcRenderer.sendMessage('wp-end');
            } else if (isConnected) {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
            } else {
                ipcRenderer.sendMessage('wp-start');
                setIsLoading(true);
            }
        }
    };

    let status = 'متصل نیستید';
    if (isConnected && isLoading) {
        status = 'قطع ارتباط ...';
    } else if (!isConnected && isLoading) {
        status = 'درحال اتصال ...';
    } else if (isConnected && ipInfo?.countryCode) {
        status = 'اتصال برقرار شد';
    } else if (isConnected && !ipInfo?.countryCode && shownIpData) {
        status = 'دریافت اطلاعات ...';
    } else if (isConnected && !shownIpData) {
        status = 'اتصال برقرار شد';
    } else {
        status = 'متصل نیستید';
    }

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
                        <li>
                            <Link to={'/routing'}>
                                <i className={'material-icons'}>&#xe90e;</i>
                                <span>قوانین مسیریابی</span>
                            </Link>
                        </li>
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
                        <li className='divider'></li>
                        <li>
                            <Link to='/about'>
                                <i className={'material-icons'}>&#xe88e;</i>
                                <span>درباره برنامه</span>
                            </Link>
                        </li>
                    </ul>
                    <div className='appVersion'>
                        App Version: <b>{packageJsonData.version}</b>
                    </div>
                </div>
            </Drawer>
            <nav>
                <div className='container'>
                    <a onClick={toggleDrawer}>
                        <i className={classNames('material-icons', 'pull-right')}>&#xe5d2;</i>
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
                                        isLoading ? 'isLoading' : '',
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
                                isConnected && ipInfo?.countryCode && !isLoading ? 'active' : '',
                            )}
                        >
                            {status}
                            <br />
                            <div
                                className={classNames(
                                    'ip',
                                    isConnected && ipInfo?.countryCode && !isLoading
                                        ? 'connected'
                                        : '',
                                )}
                            >
                                {ipInfo.countryCode ? (
                                    // @ts-ignore
                                    ipInfo.countryCode === 'IR' ? (
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
                                                    height: '12px',
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
