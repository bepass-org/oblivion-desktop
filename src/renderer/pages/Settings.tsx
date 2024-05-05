import classNames from 'classnames';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import EndpointModal from '../components/Modal/Endpoint';
import PortModal from '../components/Modal/Port';
import LicenseModal from '../components/Modal/License';
import { settings } from '../lib/settings';
import { countries, defaultSettings } from '../../defaultSettings';
import Lottie from 'lottie-react';
import LottieFile from '../../../assets/json/1713988096625.json';

export default function Settings() {
    const [scan, setScan] = useState(true);
    const [endpoint, setEndpoint] = useState();
    const [showEndpointModal, setShowEndpointModal] = useState(false);
    const [ipType, setIpType] = useState<undefined | string>();
    const [port, setPort] = useState();
    const [showPortModal, setShowPortModal] = useState(false);
    const [psiphon, setPsiphon] = useState<undefined | boolean>();
    const [location, setLocation] = useState<undefined | string>();
    const [license, setLicense] = useState();
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [gool, setGool] = useState<undefined | boolean>();
    const [autoSetProxy, setAutoSetProxy] = useState<undefined | boolean>();
    const [shareVPN, setShareVPN] = useState<undefined | boolean>();

    // loading settings
    useEffect(() => {
        settings.get('scan').then((value) => {
            setScan(typeof value === 'undefined' ? defaultSettings.scan : value);
        });
        settings.get('endpoint').then((value) => {
            setEndpoint(typeof value === 'undefined' ? defaultSettings.endpoint : value);
        });
        settings.get('ipType').then((value) => {
            setIpType(typeof value === 'undefined' ? defaultSettings.ipType : value);
        });
        settings.get('port').then((value) => {
            setPort(typeof value === 'undefined' ? defaultSettings.port : value);
        });
        settings.get('psiphon').then((value) => {
            setPsiphon(typeof value === 'undefined' ? defaultSettings.psiphon : value);
        });
        settings.get('location').then((value) => {
            setLocation(typeof value === 'undefined' ? defaultSettings.location : value);
        });
        settings.get('license').then((value) => {
            setLicense(typeof value === 'undefined' ? defaultSettings.license : value);
        });
        settings.get('gool').then((value) => {
            console.log('🚀 - settings.get - value:', typeof value === 'undefined');
            setGool(typeof value === 'undefined' ? defaultSettings.gool : value);
        });
        settings.get('autoSetProxy').then((value) => {
            setAutoSetProxy(typeof value === 'undefined' ? defaultSettings.autoSetProxy : value);
        });
        settings.get('shareVPN').then((value) => {
            setShareVPN(typeof value === 'undefined' ? defaultSettings.shareVPN : value);
        });
    }, []);

    /*useEffect(() => {
        if (endpoint === '' || endpoint === defaultSettings.endpoint) {
            setScan(true);
        }
    }, [endpoint]);*/

    /*useEffect(() => {
        if ( connected && canOpenToast) {
            toast(
                (currentToast) => (
                    <>
                        <div className='customToast'>
                            <p>
                                اعمال تنظیمات نیازمند اتصال مجدد می‌باشد.
                            </p>
                            <button onClick={() => toast.dismiss(currentToast?.id)}>متوجه شدم</button>
                        </div>
                    </>
                ),
                {
                    id: 'settingsChanged',
                    duration: Infinity,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff'
                    }
                });
            setChangesToast(false);
        }
    }, [connected, endpoint, ipType, port, psiphon, location, license, gool]);*/

    if (
        typeof endpoint === 'undefined' ||
        typeof scan === 'undefined' ||
        typeof ipType === 'undefined' ||
        typeof psiphon === 'undefined' ||
        typeof location === 'undefined' ||
        typeof gool === 'undefined'
    )
        return (
            <>
                <div className='settings'>
                    <div className='lottie'>
                        <Lottie animationData={LottieFile} loop={true} />
                    </div>
                </div>
            </>
        );

    return (
        <>
            <Nav title='تنظیمات پروکسی' />
            <EndpointModal
                {...{
                    endpoint,
                    setEndpoint
                }}
                title='اندپوینت'
                isOpen={showEndpointModal}
                onClose={() => {
                    setShowEndpointModal(false);
                }}
            />
            <PortModal
                {...{
                    port,
                    setPort
                }}
                title='پورت پروکسی'
                isOpen={showPortModal}
                onClose={() => {
                    setShowPortModal(false);
                }}
            />
            <LicenseModal
                {...{
                    license,
                    setLicense
                }}
                title='لایسنس'
                isOpen={showLicenseModal}
                onClose={() => {
                    setShowLicenseModal(false);
                }}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='settings'>
                    <div
                        className={'item'}
                        onClick={() => {
                            setScan(!scan);
                            settings.set('scan', !scan);
                        }}
                    >
                        <label className='key'>اسکنر</label>
                        <div className='value'>
                            <div className={classNames('checkbox', scan ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>جستجو در IP و پورت‌های وارپ</div>
                    </div>
                    <div
                        className={classNames('item', scan ? 'disabled' : '')}
                        onClick={() => {
                            if (!scan) {
                                setShowEndpointModal(true);
                            }
                        }}
                    >
                        <label className='key'>اندپوینت</label>
                        <div className='value'>
                            <span className='dirLeft'>{endpoint}</span>
                        </div>
                        <div className='info'>ترکیبی از IP یا نام دامنه، به‌همراه پورت</div>
                    </div>
                    <div className='item hidden'>
                        <label className='key'>نوع IP</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setIpType(e.target.value);
                                    settings.set('ipType', e.target.value);
                                }}
                                value={ipType}
                            >
                                <option value=''>Automatic</option>
                                <option value='-4'>IPv4</option>
                                <option value='-6'>IPv6</option>
                            </select>
                        </div>
                        <div className='info'>برای اندپوینت تصادفی</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setShowPortModal(true);
                        }}
                    >
                        <label className='key'>پورت پروکسی</label>
                        <div className='value'>
                            <span className='dirLeft'>{port}</span>
                        </div>
                        <div className='info'>تعیین پورت پروکسی برنامه</div>
                    </div>
                    <div
                        className={classNames('item', psiphon ? 'disabled' : '')}
                        onClick={() => {
                            if (!psiphon) {
                                setGool(!gool);
                                settings.set('gool', !gool);
                            }
                            /*if (psiphon && !gool) {
                                setPsiphon(false);
                                settings.set('psiphon', false);
                            }*/
                        }}
                    >
                        <label className='key'>گول</label>
                        <div className='value'>
                            <div className={classNames('checkbox', gool ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>فعالسازی WarpInWarp</div>
                    </div>
                    <div
                        className={classNames('item', gool ? 'disabled' : '')}
                        onClick={() => {
                            if (!gool) {
                                setPsiphon(!psiphon);
                                settings.set('psiphon', !psiphon);
                            }
                            /*if (gool && !psiphon) {
                              setGool(false);
                              settings.set('gool', false);
                          }*/
                        }}
                    >
                        <label className='key'>سایفون </label>
                        <div className='value'>
                            <div className={classNames('checkbox', psiphon ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>فعالسازی Psiphon</div>
                    </div>
                    <div
                        className={classNames('item', autoSetProxy ? 'checked' : '')}
                        onClick={() => {
                            setAutoSetProxy(!autoSetProxy);
                            settings.set('autoSetProxy', !autoSetProxy);
                        }}
                    >
                        <label className='key'>تنظیم پروکسی</label>
                        <div className='value'>
                            <div className={classNames('checkbox', autoSetProxy ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>تنظیم خودکار پروکسی روی ویندوز</div>
                    </div>
                    <div
                        className={classNames('item', shareVPN ? 'checked' : '')}
                        onClick={() => {
                            setShareVPN(!shareVPN);
                            settings.set('hostIP', !shareVPN ? '0.0.0.0' : '127.0.0.1');
                            settings.set('shareVPN', !shareVPN);
                        }}
                    >
                        <label className='key'>اشتراک گذاری</label>
                        <div className='value'>
                            <div className={classNames('checkbox', shareVPN ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>اشتراک گذاری پروکسی روی شبکه</div>
                    </div>
                    <div className={classNames('item', psiphon ? '' : 'disabled')}>
                        <label className='key'>انتخاب کشور</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    settings.set('location', e.target.value);
                                }}
                                disabled={!psiphon}
                                value={location}
                            >
                                <option value=''>Automatic</option>
                                {countries.map((country: { value: string; label: string }) => (
                                    <option key={country.value} value={country.value}>
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='info'>انتخاب آی‌پی کشور موردنظر</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setShowLicenseModal(true);
                        }}
                    >
                        <label className='key'>لایسنس</label>
                        <div className='value'>
                            <span className='dirLeft'>{license || 'Free'}</span>
                        </div>
                        <div className='info'>اگر لایسنس دارید (هر لایسنس 2x می‌شود)</div>
                    </div>
                </div>
            </div>
        </>
    );
}
