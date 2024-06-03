import classNames from 'classnames';
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../components/Nav';
import Tabs from '../components/Tabs';
import LicenseModal from '../components/Modal/License/License';
import { settings } from '../lib/settings';
import { countries, defaultSettings } from '../../defaultSettings';
import LottieFile from '../../../assets/json/1713988096625.json';
import { settingsHaveChangedToast } from '../lib/toasts';
import { useStore } from '../store';
import { getLang } from '../lib/loaders';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';

export default function Settings() {
    const appLang = getLang();
    const { isConnected, isLoading } = useStore();

    //const [scan, setScan] = useState(true);
    //const [endpoint, setEndpoint] = useState();
    //const [showEndpointModal, setShowEndpointModal] = useState(false);
    //const [ipType, setIpType] = useState<undefined | string>();
    //const [psiphon, setPsiphon] = useState<undefined | boolean>();
    const [location, setLocation] = useState<undefined | string>();
    const [license, setLicense] = useState<string>();
    const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
    //const [gool, setGool] = useState<undefined | boolean>();
    const [method, setMethod] = useState<undefined | string>('');

    /*useEffect(() => {
        if (endpoint === '' || endpoint === defaultSettings.endpoint) {
            setScan(true);
        }
    }, [endpoint]);*/

    useGoBackOnEscape();

    useEffect(() => {
        /*settings.get('scan').then((value) => {
            setScan(typeof value === 'undefined' ? defaultSettings.scan : value);
        });*/
        /*settings.get('endpoint').then((value) => {
            setEndpoint(typeof value === 'undefined' ? defaultSettings.endpoint : value);
        });*/
        /*settings.get('ipType').then((value) => {
            setIpType(typeof value === 'undefined' ? defaultSettings.ipType : value);
        });*/
        /*settings.get('psiphon').then((value) => {
            setPsiphon(typeof value === 'undefined' ? defaultSettings.psiphon : value);
        });*/
        settings.get('location').then((value) => {
            setLocation(typeof value === 'undefined' ? defaultSettings.location : value);
        });
        settings.get('license').then((value) => {
            setLicense(typeof value === 'undefined' ? defaultSettings.license : value);
        });
        /*settings.get('gool').then((value) => {
            setGool(typeof value === 'undefined' ? defaultSettings.gool : value);
        });*/
        settings.get('method').then((value) => {
            setMethod(typeof value === 'undefined' ? defaultSettings.method : value);
        });
    }, []);

    const onCloseLicenseModal = useCallback(() => {
        setShowLicenseModal(false);
        settingsHaveChangedToast({ ...{ isConnected, isLoading } });
    }, [isConnected, isLoading]);

    const onOpenLicenseModal = useCallback(() => setShowLicenseModal(true), []);

    const onEnableWarp = useCallback(() => {
        setMethod('');
        settings.set('method', '');
        settingsHaveChangedToast({ ...{ isConnected, isLoading } });
    }, [isConnected, isLoading]);

    const onEnableGool = useCallback(() => {
        setMethod('gool');
        settings.set('method', 'gool');
        settingsHaveChangedToast({ ...{ isConnected, isLoading } });
    }, [isConnected, isLoading]);

    const onEnablePsiphon = useCallback(() => {
        setMethod('psiphon');
        settings.set('method', 'psiphon');
        settingsHaveChangedToast({ ...{ isConnected, isLoading } });
    }, [isConnected, isLoading]);

    const onChangeLocation = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setLocation(event.target.value);
            settings.set('location', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
        },
        [isConnected, isLoading]
    );

    if (
        typeof location === 'undefined' ||
        typeof license === 'undefined' ||
        typeof method === 'undefined'
    )
        return (
            <div className='settings'>
                <div className='lottie'>
                    <Lottie animationData={LottieFile} loop={true} />
                </div>
            </div>
        );

    return (
        <>
            <Nav title={appLang?.settings?.title} />
            {/*<EndpointModal
                {...{
                    endpoint,
                    setEndpoint
                }}
                title={appLang?.modal?.endpoint_title}
                isOpen={showEndpointModal}
                onClose={() => {
                    setShowEndpointModal(false);
                    settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                }}
            />*/}
            <LicenseModal
                license={license}
                setLicense={setLicense}
                title={appLang?.modal?.license_title}
                isOpen={showLicenseModal}
                onClose={onCloseLicenseModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='settings' />
                <div className='settings' role='menu'>
                    {/*<div
                        className={'item'}
                        onClick={() => {
                            setScan(!scan);
                            settings.set('scan', !scan);
                            settingsHaveChanged();
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
                    <div className='item hidden'>
                        <label className='key'>نوع IP</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setIpType(e.target.value);
                                    settings.set('ipType', e.target.value);
                                    settingsHaveChanged();
                                }}
                                value={ipType}
                            >
                                <option value=''>Automatic</option>
                                <option value='-4'>IPv4</option>
                                <option value='-6'>IPv6</option>
                            </select>
                        </div>
                        <div className='info'>برای اندپوینت تصادفی</div>
                    </div>*/}
                    <div className='grouped' role='radiogroup'>
                        <div
                            role='presentation'
                            className={classNames('item')}
                            onClick={onEnableWarp}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onEnableWarp();
                                }
                            }}
                        >
                            <label
                                className='key'
                                htmlFor='flex-switch-check-checked'
                                // role='label'
                            >
                                {appLang?.settings?.method_warp}
                            </label>
                            <div className='value' id='flex-switch-check-checked'>
                                <div
                                    tabIndex={-1}
                                    className={classNames('switch', method === '' ? 'checked' : '')}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_warp_desc}</div>
                        </div>
                        <div
                            role='presentation'
                            className={classNames('item')}
                            onClick={onEnableGool}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onEnableGool();
                                }
                            }}
                        >
                            <label
                                className='key'
                                htmlFor='flex-switch-check-checked-gool'
                                // role='label'
                            >
                                {appLang?.settings?.method_gool}
                            </label>
                            <div className='value' id='flex-switch-check-checked-gool'>
                                <div
                                    tabIndex={-1}
                                    className={classNames(
                                        'switch',
                                        method === 'gool' ? 'checked' : ''
                                    )}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_gool_desc}</div>
                        </div>
                        <div
                            role='presentation'
                            className={classNames('item')}
                            onClick={onEnablePsiphon}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onEnablePsiphon();
                                }
                            }}
                        >
                            <label
                                className='key'
                                htmlFor='flex-switch-check-checked-psiphon'
                                // role='label'
                            >
                                {appLang?.settings?.method_psiphon}
                            </label>
                            <div className='value' id='flex-switch-check-checked-psiphon'>
                                <div
                                    tabIndex={-1}
                                    className={classNames(
                                        'switch',
                                        method === 'psiphon' ? 'checked' : ''
                                    )}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_psiphon_desc}</div>
                        </div>
                    </div>
                    <div className={classNames('item', method === 'psiphon' ? '' : 'disabled')}>
                        <label
                            className='key'
                            htmlFor='flex-switch-check-checked-psiphon-location'
                            // role='label'
                        >
                            {appLang?.settings?.method_psiphon_location}
                        </label>
                        <div className='value'>
                            <select
                                id='flex-switch-check-checked-psiphon-location'
                                onChange={onChangeLocation}
                                disabled={method !== 'psiphon'}
                                value={location}
                                // role='listbox'
                                tabIndex={-1}
                            >
                                <option
                                    value=''
                                    // role='option'
                                >
                                    {appLang?.settings?.method_psiphon_location_auto}
                                </option>
                                {countries.map((country) => (
                                    <option
                                        key={country.value}
                                        value={country.value}
                                        // role='option'
                                    >
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='info'>
                            {appLang?.settings?.method_psiphon_location_desc}
                        </div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings' role='menu'>
                    {/*<div
                        className={classNames('item')}
                        onClick={() => {
                            setShowEndpointModal(true);
                        }}
                    >
                        <label className='key'>{appLang?.settings?.endpoint}</label>
                        <div className='value'>
                            <span className='dirLeft'>{endpoint}</span>
                        </div>
                        <div className='info'>{appLang?.settings?.endpoint_desc}</div>
                    </div>*/}
                    <div
                        role='presentation'
                        className='item'
                        onClick={onOpenLicenseModal}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onOpenLicenseModal();
                            }
                        }}
                    >
                        <label
                            className='key'
                            htmlFor='flex-switch-check-checked-license'
                            // role='label'
                        >
                            {appLang?.settings?.license}
                        </label>
                        <div className='value' role='link'>
                            <span
                                className='dirLeft'
                                id='flex-switch-check-checked-license'
                                tabIndex={-1}
                            >
                                {license || 'Free'}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.license_desc}</div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
