import { useEffect, useState } from 'react';
import classNames from 'classnames';
import toast, { Toaster } from "react-hot-toast";
import { Link } from 'react-router-dom';
import {ipcRenderer, loadSettings} from '../lib/utils';
import { useStore } from '../store';
import defFlag from "../../../assets/img/flags/xx.svg";

export default function Index() {
    const { isConnected, setIsConnected } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [ipInfo, setIpInfo] = useState({countryCode: false, ip: '127.0.0.1' });

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

    const ipToast = () => {
        const themeMode:string = loadSettings('OBLIVION_THEME') || "light";
        toast(
            (currentToast) => (
                <>
                    <div className="customToast">
                        <p>
                            کلودفلر به یک IP با لوکیشن ایران که متفاوت از آیپی اصلیته وصلت کرده، که باهاش میتونی فیلترینگ‌رو دور بزنی، اما تحریم‌هارو نه. نگران نباش! در تنظیمات میتونی توسط گزینه «گول» یا «سایفون» لوکیشن رو تغییر بدی.
                        </p>
                        <button
                            onClick={() => toast.dismiss(currentToast?.id)}
                        >
                            متوجه شدم
                        </button>
                    </div>
                </>
            ),
            {
                id: "ipChangedToIR",
                duration: Infinity,
                style: {
                    borderRadius: '10px',
                    background: (themeMode === 'light' ? '#242424' : '#535353'),
                    color: (themeMode === 'light' ? '#F4F5FB' : '#F4F5FB'),
                },
            }
        );
    }

    const getIpLocation = () => {
        if ( isConnected && !isLoading ) {
            fetch('https://api.ipify.org/?format=json')
                .then(response => response.json())
                .then(data => {
                    const userIp = data?.ip;
                    fetch(`https://api.iplocation.net/?ip=${userIp}`)
                        .then(response => response.json())
                        .then(locationData => {
                            setIpInfo({
                                countryCode: (locationData.country_code2).toLowerCase(),
                                ip: locationData.ip
                            });
                            if ( locationData?.country_code2 === 'IR' ){
                                ipToast();
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching IP location:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching user IP:', error);
                });
        }
    }

    useEffect(() => {
        getIpLocation();
    }, [isLoading, isConnected]);

    const onChange = () => {
        if (isLoading) {
            ipcRenderer.sendMessage('wp-end');
        } else if (isConnected) {
            ipcRenderer.sendMessage('wp-end');
            setIsLoading(true);
        } else {
            ipcRenderer.sendMessage('wp-start');
            setIsLoading(true);
        }
    };

    let status = 'متصل نیستید';
    if ( isConnected && isLoading ) {
        status = 'قطع ارتباط ...';
    }
    else if ( !isConnected && isLoading ) {
        status = 'درحال اتصال ...';
    }
    else if (isConnected && ipInfo?.countryCode) {
        status = 'اتصال برقرار شد';
    }
    else if (isConnected && !ipInfo?.countryCode) {
        status = 'دریافت اطلاعات ...';
    } else {
        status = 'متصل نیستید';
    }

    return (
        <>
            <nav>
                <div className='container'>
                    {/* Settings icon */}
                    <Link to={'/settings'}>
                        <i
                            className={classNames(
                                'material-icons',
                                'pull-right',
                            )}
                        >
                            &#xe8b8;
                        </i>
                    </Link>
                    {/* Debug icon */}
                    <Link to={'/debug'}>
                        <i
                            className={classNames(
                                'material-icons',
                                'pull-right',
                                'log',
                            )}
                        >
                            &#xe868;
                        </i>
                    </Link>
                    {/* about icon */}
                    <Link to='/about'>
                        <i
                            className={classNames(
                                'material-icons',
                                'pull-left',
                            )}
                        >
                            &#xe88e;
                        </i>
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
                                        isConnected
                                            ? 'active'
                                            : '',
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
                                    isConnected && ipInfo?.countryCode && !isLoading ? 'connected' : '',
                                )}
                            >
                                <img
                                    src={ ipInfo.countryCode
                                        ? '../../../assets/img/flags/'+ipInfo.countryCode+'.svg'
                                        : defFlag
                                    }
                                    alt='flag'
                                />
                                <span>{ipInfo?.ip}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster
                position="bottom-center"
                reverseOrder={false}
            />
        </>
    );
}
