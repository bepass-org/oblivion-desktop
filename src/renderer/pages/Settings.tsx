import classNames from 'classnames';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import EndpointModal from '../components/Modal/Endpoint';
import PortModal from '../components/Modal/Port';
import { saveSettings, loadSettings } from '../lib/utils';
import LicenseModal from '../components/Modal/License';
import { settings } from '../lib/settings';
import { defaultSettings } from '../../defaultSettings';

export default function Settings() {
    const [endpoint, setEndpoint] = useState(loadSettings('OBLIVION_ENDPOINT') || defaultSettings.endpoint);
    const [port, setPort] = useState(loadSettings('OBLIVION_PORT') || defaultSettings.port);
    const [psiphonMode, setPsiphonMode] = useState(loadSettings('OBLIVION_PSIPHON') || false);
    const [location, setLocation] = useState(loadSettings('OBLIVION_LOCATION') || '');
    const [license, setLicense] = useState(loadSettings('OBLIVION_LICENSE') || '');
    const [goolMode, setGoolMode] = useState(loadSettings('OBLIVION_GOOL') || false);
    const [theme, setTheme] = useState('');
    const [systemTray, setSystemTray] = useState(loadSettings('OBLIVION_SYSTEMTRAY') || false);
    
    const [portModal, setPortModal] = useState(false);
    const [licenseModal, setLicenseModal] = useState(false);
    const [endpointModal, setEndpointModal] = useState(false);

    useEffect(() => {
        saveSettings('OBLIVION_PSIPHON', psiphonMode);
        if (psiphonMode) {
            setGoolMode(false);
            saveSettings('OBLIVION_GOOL', false);
        }
    }, [psiphonMode]);

    useEffect(() => {
        saveSettings('OBLIVION_LOCATION', location);
    }, [location]);

    useEffect(() => {
        saveSettings('OBLIVION_GOOL', goolMode);
        if (goolMode) {
            setPsiphonMode(false);
            saveSettings('OBLIVION_PSIPHON', false);
        }
    }, [goolMode]);

    // loading settings on component load
    // TODO promise.all
    useEffect(() => {
        (async () => {
            setTheme((await settings.get('theme')) || defaultSettings.theme);
        })();
    }, []);

    // syncing react state and User Settings(read DOCS.md for more)
    useEffect(() => {
        if (theme === '') return;
        (async () => {
            document.documentElement.setAttribute(
                'data-bs-theme',
                String(await settings.set('theme', theme)),
            );
        })();
    }, [theme]);

    useEffect(() => {
        saveSettings('OBLIVION_SYSTEMTRAY', systemTray);
    }, [systemTray]);

    return (
        <>
            <Nav title='تنظیمات' />
            <EndpointModal
                title='اندپوینت'
                isOpen={endpointModal}
                onClose={() => {
                    setEndpoint(loadSettings('OBLIVION_ENDPOINT') || defaultSettings.endpoint);
                    setEndpointModal(false);
                }}
                defValue={defaultSettings.endpoint}
            />
            <PortModal
                title='پورت تانل'
                isOpen={portModal}
                onClose={() => {
                    setPort(loadSettings('OBLIVION_PORT') || defaultSettings.port);
                    setPortModal(false);
                }}
                defValue={defaultSettings.port}
            />
            <LicenseModal
                title='لایسنس'
                isOpen={licenseModal}
                onClose={() => {
                    setLicense(loadSettings('OBLIVION_LICENSE') || '');
                    setLicenseModal(false);
                }}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='settings'>
                    <div
                        className='item'
                        onClick={() => {
                            setEndpointModal(true);
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
                            setPortModal(true);
                        }}
                    >
                        <label className='key'>پورت تانل</label>
                        <div className='value'>
                            <span className='dirLeft'>{port}</span>
                        </div>
                        <div className='info'>تعیین پورت تانل برنامه</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setPsiphonMode(psiphonMode !== true);
                        }}
                    >
                        <label className='key'>سایفون</label>
                        <div className='value'>
                            <div className={classNames('checkbox', psiphonMode ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>فعالسازی سایفون</div>
                    </div>
                    <div className={classNames('item', psiphonMode ? '' : 'disabled')}>
                        <label className='key'>انتخاب کشور</label>
                        <div className='value'>
                            <select
                                onChange={(event) => {
                                    setLocation(event.target.value);
                                }}
                                disabled={!psiphonMode}
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
                            setLicenseModal(true);
                        }}
                    >
                        <label className='key'>لایسنس</label>
                        <div className='value'>
                            <span className='dirLeft'>{license ? license : 'Free'}</span>
                        </div>
                        <div className='info'>اگر لایسنس دارید (هر لایسنس 2x می‌شود)</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setGoolMode(goolMode !== true);
                        }}
                    >
                        <label className='key'>گول</label>
                        <div className='value'>
                            <div className={classNames('checkbox', goolMode ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>فعالسازی Warp In Warp</div>
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
                            setTheme(theme === 'light' ? 'dark' : 'light');
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
                            setSystemTray(systemTray !== true);
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
