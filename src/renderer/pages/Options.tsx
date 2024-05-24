import classNames from 'classnames';
import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import Nav from '../components/Nav';
import { settings } from '../lib/settings';
import { defaultSettings, languages } from '../../defaultSettings';
import LottieFile from '../../../assets/json/1713988096625.json';
import RestoreModal from '../components/Modal/Restore';
import { loadingToast } from '../lib/toasts';
import { useStore } from '../store';
import { getLang, loadLang } from '../lib/loaders';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';
import Tabs from '../components/Tabs';

export default function Options() {
    const { isConnected, isLoading } = useStore();

    useGoBackOnEscape();

    const [theme, setTheme] = useState<undefined | string>();
    const [lang, setLang] = useState('');
    const [systemTray, setSystemTray] = useState<undefined | boolean>();
    const [openAtLogin, setOpenAtLogin] = useState<undefined | boolean>();
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [appLang, setAppLang] = useState(getLang());

    const { state } = useLocation();
    const { targetId } = state || {};
    const langRef = useRef<any>(null);

    useEffect(() => {
        setTimeout(function() {
            if (langRef && targetId === 'languages') {
                langRef?.current?.scrollIntoView();
                langRef?.current?.classList?.add('highlight');
                setTimeout(function() {
                    langRef?.current?.classList?.remove('highlight');
                }, 3000);
            }
        }, 1000);
    }, [targetId]);

    useEffect(() => {
        settings.get('theme').then((value) => {
            setTheme(typeof value === 'undefined' ? defaultSettings.theme : value);
        });
        settings.get('lang').then((value) => {
            setLang(typeof value === 'undefined' ? defaultSettings.lang : value);
        });
        settings.get('systemTray').then((value) => {
            setSystemTray(typeof value === 'undefined' ? defaultSettings.systemTray : value);
        });
        settings.get('openAtLogin').then((value) => {
            setOpenAtLogin(typeof value === 'undefined' ? defaultSettings.openAtLogin : value);
        });
    }, []);

    if (
        typeof theme === 'undefined' ||
        typeof lang === 'undefined' ||
        typeof systemTray === 'undefined' ||
        typeof openAtLogin === 'undefined'
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
            <RestoreModal
                {...{
                    setTheme,
                    setSystemTray,
                    setLang
                }}
                title={appLang?.modal?.restore_title}
                isOpen={showRestoreModal}
                onClose={() => {
                    setShowRestoreModal(false);
                    setTimeout(function() {
                        loadLang();
                    }, 750);
                    setTimeout(function() {
                        setAppLang(getLang());
                    }, 1500);
                }}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='options' />
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
                    <div className={'item'} ref={langRef}>
                        <label className='key'>{appLang?.settings?.lang}</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setLang(e.target.value);
                                    settings.set('lang', e.target.value);
                                    loadingToast();
                                    setTimeout(function() {
                                        loadLang();
                                    }, 750);
                                    setTimeout(function() {
                                        setAppLang(getLang());
                                        toast.dismiss('LOADING');
                                    }, 1500);
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
                            setOpenAtLogin(!openAtLogin);
                            settings.set('openAtLogin', !openAtLogin);
                        }}
                    >
                        <label className='key'>{appLang?.settings?.open_login}</label>
                        <div className='value'>
                            <div className={classNames('checkbox', openAtLogin ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.open_login_desc}</div>
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
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings'>
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
