import classNames from 'classnames';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import EndpointModal from '../components/Modal/Endpoint';
import PortModal from '../components/Modal/Port';
import LicenseModal from '../components/Modal/License';
import { settings } from '../lib/settings';
import { defaultSettings } from '../../defaultSettings';
import Lottie from "lottie-react";
import LottieFile from "../../../assets/json/1713988096625.json";

export default function Settings() {

    const [endpoint, setEndpoint] = useState();
    const [showEndpointModal, setShowEndpointModal] = useState(false);
    const [port, setPort] = useState();
    const [showPortModal, setShowPortModal] = useState(false);
    const [psiphon, setPsiphon] = useState<undefined | boolean>();
    const [location, setLocation] = useState<undefined | string>();
    const [license, setLicense] = useState();
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [gool, setGool] = useState<undefined | boolean>();
    const [ipData, setIpData] = useState<undefined | boolean>();
    const [theme, setTheme] = useState<undefined | string>();
    const [systemTray, setSystemTray] = useState<undefined | boolean>();

    // loading settings
    useEffect(() => {
        settings.get('endpoint').then((value) => {
            setEndpoint(typeof value === 'undefined' ? defaultSettings.endpoint : value);
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
        settings.get('ipData').then((value) => {
            setIpData(typeof value === 'undefined' ? defaultSettings.ipData : value);
        });
        settings.get('theme').then((value) => {
            setTheme(typeof value === 'undefined' ? defaultSettings.theme : value);
        });
        settings.get('systemTray').then((value) => {
            setSystemTray(typeof value === 'undefined' ? defaultSettings.systemTray : value);
        });
    }, []);

    if (
        typeof psiphon === 'undefined' ||
        typeof location === 'undefined' ||
        typeof gool === 'undefined' ||
        typeof theme === 'undefined' ||
        typeof systemTray === 'undefined'
    )
        return <>
            <div className='settings'>
                <div className='lottie'>
                    <Lottie animationData={LottieFile} loop={true} />
                </div>
            </div>
        </>;

    return (
        <>
            <Nav title='تنظیمات' />
            <EndpointModal
                {...{
                    endpoint,
                    setEndpoint,
                }}
                title='اندپوینت'
                isOpen={showEndpointModal}
                onClose={() => {
                    setShowEndpointModal(false);
                }}
                defValue={defaultSettings.endpoint}
            />
            <PortModal
                {...{
                    port,
                    setPort,
                }}
                title='پورت تانل'
                isOpen={showPortModal}
                onClose={() => {
                    setShowPortModal(false);
                }}
                defValue={defaultSettings.port}
            />
            <LicenseModal
                {...{
                    license,
                    setLicense,
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
                        className='item'
                        onClick={() => {
                            setShowEndpointModal(true);
                        }}
                    >
                        <label className='key'>اندپوینت</label>
                        <div className='value'>
                            <span className='dirLeft'>{endpoint}</span>
                        </div>
                        <div className='info'>ترکیبی از IP یا نام دامنه، به‌همراه پورت</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setShowPortModal(true);
                        }}
                    >
                        <label className='key'>پورت تانل</label>
                        <div className='value'>
                            <span className='dirLeft'>{port}</span>
                        </div>
                        <div className='info'>تعیین پورت تانل برنامه</div>
                    </div>
                    <div
                        className={classNames(
                            'item',
                            gool ? 'disabled' : ''
                        )}
                        onClick={() => {
                            if ( !gool ) {
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
                        <div className='info'>فعالسازی سایفون</div>
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
                                <option value='AT'>Austria</option>
                                <option value='BE'>Belgium</option>
                                <option value='BG'>Bulgaria</option>
                                <option value='BR'>Brazil</option>
                                <option value='CA'>Canada</option>
                                <option value='CH'>Switzerland</option>
                                <option value='CZ'>Czech Republic</option>
                                <option value='DE'>Germany</option>
                                <option value='DK'>Denmark</option>
                                <option value='EE'>Estonia</option>
                                <option value='ES'>Spain</option>
                                <option value='FI'>Finland</option>
                                <option value='FR'>France</option>
                                <option value='GB'>United Kingdom</option>
                                <option value='HU'>Hungary</option>
                                <option value='IE'>Ireland</option>
                                <option value='IN'>India</option>
                                <option value='IT'>Italy</option>
                                <option value='JP'>Japan</option>
                                <option value='LV'>Latvia</option>
                                <option value='NL'>Netherlands</option>
                                <option value='NO'>Norway</option>
                                <option value='PL'>Poland</option>
                                <option value='RO'>Romania</option>
                                <option value='RS'>Serbia</option>
                                <option value='SE'>Sweden</option>
                                <option value='SG'>Singapore</option>
                                <option value='SK'>Slovakia</option>
                                <option value='UA'>Ukraine</option>
                                <option value='US'>United States</option>
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
                    <div
                        className={classNames(
                            'item',
                            psiphon ? 'disabled' : ''
                        )}
                        onClick={() => {
                            if ( !psiphon ) {
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
                        <div className='info'>فعالسازی Warp In Warp</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setIpData(!ipData);
                            settings.set('ipData', !ipData);
                        }}
                    >
                        <label className='key'>بررسی IP</label>
                        <div className='value'>
                            <div className={classNames('checkbox', ipData ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>نمایش آی‌پی و لوکیشن پس‌از اتصال</div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    سایر تنظیمات
                </div>
                <div className='settings'>
                    <div
                        className='item'
                        onClick={() => {
                            const tmp = theme === 'light' ? 'dark' : 'light';
                            setTheme(tmp);
                            settings.set('theme', tmp);
                            document.documentElement.setAttribute('data-bs-theme', tmp);
                        }}
                    >
                        <label className='key' htmlFor='flexSwitchCheckChecked'>
                            حالت تیره
                        </label>
                        <div className='value'>
                            <div
                                className={classNames(
                                    'checkbox',
                                    theme === 'dark' ? 'checked' : '',
                                )}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info' id='flexSwitchCheckChecked'>
                            مشخص‌کردن حالت نمایش برنامه
                        </div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setSystemTray(!systemTray);
                            settings.set('systemTray', !systemTray);
                        }}
                    >
                        <label className='key'>مخفی‌سازی</label>
                        <div className='value'>
                            <div className={classNames('checkbox', systemTray ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>آیکون برنامه در تسک‌بار قرار نگیرد</div>
                    </div>
                </div>
            </div>
        </>
    );
}
