import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../components/Nav';
import EndpointModal from '../components/Modal/Endpoint';
import LicenseModal from '../components/Modal/License';
import { settings } from '../lib/settings';
import { countries, defaultSettings } from '../../defaultSettings';
import LottieFile from '../../../assets/json/1713988096625.json';
import { settingsHaveChanged } from '../lib/settingsHaveChanged';
import { useStore } from '../store';

export default function Settings() {
    const { isConnected, isLoading } = useStore();

    //const [scan, setScan] = useState(true);
    const [endpoint, setEndpoint] = useState();
    const [showEndpointModal, setShowEndpointModal] = useState(false);
    //const [ipType, setIpType] = useState<undefined | string>();
    //const [psiphon, setPsiphon] = useState<undefined | boolean>();
    const [location, setLocation] = useState<undefined | string>();
    const [license, setLicense] = useState();
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    //const [gool, setGool] = useState<undefined | boolean>();
    const [method, setMethod] = useState<undefined | string>('');

    /*useEffect(() => {
        if (endpoint === '' || endpoint === defaultSettings.endpoint) {
            setScan(true);
        }
    }, [endpoint]);*/

    useEffect(() => {
        /*settings.get('scan').then((value) => {
            setScan(typeof value === 'undefined' ? defaultSettings.scan : value);
        });*/
        settings.get('endpoint').then((value) => {
            setEndpoint(typeof value === 'undefined' ? defaultSettings.endpoint : value);
        });
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

    if (
        typeof endpoint === 'undefined' ||
        typeof location === 'undefined' ||
        typeof license === 'undefined' ||
        typeof method === 'undefined'
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
            <Nav title='تنظیمات وارپ' />
            <EndpointModal
                {...{
                    endpoint,
                    setEndpoint
                }}
                title='اندپوینت'
                isOpen={showEndpointModal}
                onClose={() => {
                    setShowEndpointModal(false);
                    settingsHaveChanged({ ...{ isConnected, isLoading } });
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
                    settingsHaveChanged({ ...{ isConnected, isLoading } });
                }}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='settings'>
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
                    <div className='grouped'>
                        <div
                            className={classNames('item')}
                            onClick={() => {
                                setMethod('');
                                settings.set('method', '');
                                settingsHaveChanged({ ...{ isConnected, isLoading } });
                            }}
                        >
                            <label className='key'>وارپ</label>
                            <div className='value'>
                                <div
                                    className={classNames('switch', method === '' ? 'checked' : '')}
                                />
                            </div>
                            <div className='info'>فعالسازی Warp</div>
                        </div>
                        <div
                            className={classNames('item')}
                            onClick={() => {
                                setMethod('gool');
                                settings.set('method', 'gool');
                                settingsHaveChanged({ ...{ isConnected, isLoading } });

                                /*if (!psiphon) {
                                    setGool(!gool);
                                    settings.set('gool', !gool);
                                    settingsHaveChanged();
                                }*/
                                /*if (psiphon && !gool) {
                                    setPsiphon(false);
                                    settings.set('psiphon', false);
                                }*/
                            }}
                        >
                            <label className='key'>گول</label>
                            <div className='value'>
                                <div
                                    className={classNames(
                                        'switch',
                                        method === 'gool' ? 'checked' : ''
                                    )}
                                />
                            </div>
                            <div className='info'>فعالسازی WarpInWarp</div>
                        </div>
                        <div
                            className={classNames('item')}
                            onClick={() => {
                                setMethod('psiphon');
                                settings.set('method', 'psiphon');
                                settingsHaveChanged({ ...{ isConnected, isLoading } });

                                /*if (!gool) {
                                    setPsiphon(!psiphon);
                                    settings.set('psiphon', !psiphon);
                                    settingsHaveChanged();
                                }*/
                                /*if (gool && !psiphon) {
                                  setGool(false);
                                  settings.set('gool', false);
                              }*/
                            }}
                        >
                            <label className='key'>سایفون </label>
                            <div className='value'>
                                <div
                                    className={classNames(
                                        'switch',
                                        method === 'psiphon' ? 'checked' : ''
                                    )}
                                />
                            </div>
                            <div className='info'>فعالسازی Psiphon</div>
                        </div>
                    </div>
                    <div className={classNames('item', method === 'psiphon' ? '' : 'disabled')}>
                        <label className='key'>انتخاب کشور</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    settings.set('location', e.target.value);
                                    settingsHaveChanged({ ...{ isConnected, isLoading } });
                                }}
                                disabled={method !== 'psiphon'}
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
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    سایر تنظیمات
                </div>
                <div className='settings'>
                    <div
                        className={classNames('item' /*, scan ? 'disabled' : ''*/)}
                        onClick={() => {
                            /*if (!scan) {
                                setShowEndpointModal(true);
                            }*/
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
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
