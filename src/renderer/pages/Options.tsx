import classNames from 'classnames';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../components/Nav';
import { settings } from '../lib/settings';
import { defaultSettings, languages } from '../../defaultSettings';
import LottieFile from '../../../assets/json/1713988096625.json';
import RestoreModal from '../components/Modal/Restore';
import PortModal from '../components/Modal/Port';
import { settingsHaveChangedToast } from '../lib/toasts';
import { useStore } from '../store';
import { loadLang } from '../lib/loaders';

export default function Options() {
    const { isConnected, isLoading } = useStore();

    const [theme, setTheme] = useState<undefined | string>();
    const [lang, setLang] = useState('');
    const [ipData, setIpData] = useState<undefined | boolean>();
    const [systemTray, setSystemTray] = useState<undefined | boolean>();
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [autoSetProxy, setAutoSetProxy] = useState<undefined | boolean>();
    const [shareVPN, setShareVPN] = useState<undefined | boolean>();
    const [port, setPort] = useState();
    const [showPortModal, setShowPortModal] = useState(false);

    const appLang = JSON.parse(String(localStorage.getItem('OBLIVION_LANG')));

    useEffect(() => {
        settings.get('theme').then((value) => {
            setTheme(typeof value === 'undefined' ? defaultSettings.theme : value);
        });
        settings.get('lang').then((value) => {
            setLang(typeof value === 'undefined' ? defaultSettings.lang : value);
        });
        settings.get('ipData').then((value) => {
            setIpData(typeof value === 'undefined' ? defaultSettings.ipData : value);
        });
        settings.get('systemTray').then((value) => {
            setSystemTray(typeof value === 'undefined' ? defaultSettings.systemTray : value);
        });
        settings.get('port').then((value) => {
            setPort(typeof value === 'undefined' ? defaultSettings.port : value);
        });
        settings.get('autoSetProxy').then((value) => {
            setAutoSetProxy(typeof value === 'undefined' ? defaultSettings.autoSetProxy : value);
        });
        settings.get('shareVPN').then((value) => {
            setShareVPN(typeof value === 'undefined' ? defaultSettings.shareVPN : value);
        });
    }, []);

    useEffect(() => {
        setTimeout(function() {
            loadLang();
        }, 1000);
    }, [lang]);

    if (
        typeof theme === 'undefined' ||
        typeof lang === 'undefined' ||
        typeof ipData === 'undefined' ||
        typeof port === 'undefined' ||
        typeof autoSetProxy === 'undefined' ||
        typeof shareVPN === 'undefined' ||
        typeof systemTray === 'undefined'
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
            <Nav title={appLang?.settings?.option} />
            <PortModal
                {...{
                    port,
                    setPort
                }}
                title={appLang?.modal?.port_title}
                isOpen={showPortModal}
                onClose={() => {
                    setShowPortModal(false);
                    settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                }}
            />
            <RestoreModal
                {...{
                    setTheme,
                    setIpData,
                    setSystemTray,
                    setPort,
                    setAutoSetProxy,
                    setShareVPN
                }}
                title={appLang?.modal?.restore_title}
                isOpen={showRestoreModal}
                onClose={() => {
                    setShowRestoreModal(false);
                }}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='settings'>
                    <div
                        className={classNames('item', autoSetProxy ? 'checked' : '')}
                        onClick={() => {
                            setAutoSetProxy(!autoSetProxy);
                            settings.set('autoSetProxy', !autoSetProxy);
                            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                            setTimeout(function() {
                                if (autoSetProxy) {
                                    setIpData(false);
                                    settings.set('ipData', false);
                                }
                            }, 1000);
                        }}
                    >
                        <label className='key'>{appLang?.settings?.auto_set_proxy}</label>
                        <div className='value'>
                            <div className={classNames('checkbox', autoSetProxy ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.auto_set_proxy_desc}</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setShowPortModal(true);
                        }}
                    >
                        <label className='key'>{appLang?.settings?.port}</label>
                        <div className='value'>
                            <span className='dirLeft'>{port}</span>
                        </div>
                        <div className='info'>{appLang?.settings?.port_desc}</div>
                    </div>
                    <div
                        className={classNames('item', shareVPN ? 'checked' : '')}
                        onClick={() => {
                            setShareVPN(!shareVPN);
                            settings.set('hostIP', !shareVPN ? '0.0.0.0' : '127.0.0.1');
                            settings.set('shareVPN', !shareVPN);
                            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                        }}
                    >
                        <label className='key'>{appLang?.settings?.share_vpn}</label>
                        <div className='value'>
                            <div className={classNames('checkbox', shareVPN ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.share_vpn_desc}</div>
                    </div>
                    <div
                        className={classNames('item', autoSetProxy ? '' : 'disabled')}
                        onClick={() => {
                            if (autoSetProxy) {
                                setIpData(!ipData);
                                settings.set('ipData', !ipData);
                            }
                        }}
                    >
                        <label className='key'>{appLang?.settings?.ip_data}</label>
                        <div className='value'>
                            <div className={classNames('checkbox', ipData ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.ip_data_desc}</div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
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
                            {appLang?.settings?.dark_mode}
                        </label>
                        <div className='value'>
                            <div
                                className={classNames(
                                    'checkbox',
                                    theme === 'dark' ? 'checked' : ''
                                )}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info' id='flexSwitchCheckChecked'>
                            {appLang?.settings?.dark_mode_desc}
                        </div>
                    </div>
                    <div className={classNames('item')}>
                        <label className='key'>{appLang?.settings?.lang}</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setLang(e.target.value);
                                    settings.set('lang', e.target.value);
                                }}
                                value={lang}
                            >
                                {languages.map((lng: { value: string; label: string }) => (
                                    <option key={lng.value} value={lng.value}>
                                        {lng.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='info'>{appLang?.settings?.lang_desc}</div>
                    </div>
                    <div
                        className='item'
                        onClick={() => {
                            setSystemTray(!systemTray);
                            settings.set('systemTray', !systemTray);
                        }}
                    >
                        <label className='key'>{appLang?.settings?.system_tray}</label>
                        <div className='value'>
                            <div className={classNames('checkbox', systemTray ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.system_tray_desc}</div>
                    </div>
                    <div
                        className={'item'}
                        onClick={() => {
                            setShowRestoreModal(true);
                        }}
                    >
                        <label className='key'>{appLang?.settings?.restore}</label>
                        <div className='value'>
                            <i className='material-icons'>&#xe8ba;</i>
                        </div>
                        <div className='info'>{appLang?.settings?.restore_desc}</div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
