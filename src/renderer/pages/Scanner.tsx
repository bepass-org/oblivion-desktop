import classNames from 'classnames';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../components/Nav';
import { settings } from '../lib/settings';
import { defaultSettings } from '../../defaultSettings';
import LottieFile from '../../../assets/json/1713988096625.json';
import { settingsHaveChangedToast } from '../lib/toasts';
import { useStore } from '../store';
import { getLang } from '../lib/loaders';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';
import EndpointModal from '../components/Modal/Endpoint';
import Tabs from '../components/Tabs';

export default function Scanner() {
    const { isConnected, isLoading } = useStore();
    const [appLang] = useState(getLang());

    const [endpoint, setEndpoint] = useState();
    const [showEndpointModal, setShowEndpointModal] = useState(false);
    const [ipType, setIpType] = useState<undefined | string>();
    const [rtt, setRtt] = useState<undefined | string>();

    useGoBackOnEscape();

    useEffect(() => {
        settings.get('endpoint').then((value) => {
            setEndpoint(typeof value === 'undefined' ? defaultSettings.endpoint : value);
        });
        settings.get('ipType').then((value) => {
            setIpType(typeof value === 'undefined' ? defaultSettings.ipType : value);
        });
        settings.get('rtt').then((value) => {
            setRtt(typeof value === 'undefined' ? defaultSettings.rtt : value);
        });
    }, []);

    if (
        typeof endpoint === 'undefined' ||
        typeof ipType === 'undefined' ||
        typeof rtt === 'undefined'
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
            <Nav title={appLang?.settings?.scanner} />
            <EndpointModal
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
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='scanner' />
                <div className='settings'>
                    <div
                        className={classNames(
                            'item',
                            endpoint === defaultSettings.endpoint ? '' : 'disabled'
                        )}
                    >
                        <label className='key'>{appLang?.settings?.scanner_ip_type}</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setIpType(e.target.value);
                                    settings.set('ipType', e.target.value);
                                    settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                                }}
                                disabled={endpoint !== defaultSettings.endpoint}
                                value={ipType}
                            >
                                <option value=''>{appLang?.settings?.scanner_ip_type_auto}</option>
                                <option value='-4'>IPv4</option>
                                <option value='-6'>IPv6</option>
                            </select>
                        </div>
                        <div className='info'>{appLang?.settings?.scanner_ip_type_desc}</div>
                    </div>
                    <div
                        className={classNames(
                            'item',
                            endpoint === defaultSettings.endpoint ? '' : 'disabled'
                        )}
                    >
                        <label className='key'>{appLang?.settings?.scanner_rtt}</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setRtt(e.target.value);
                                    settings.set('rtt', e.target.value);
                                    settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                                }}
                                disabled={endpoint !== defaultSettings.endpoint}
                                value={rtt}
                            >
                                <option value='1s'>{appLang?.settings?.scanner_rtt_default}</option>
                                <option value='300ms'>300ms</option>
                                <option value='500ms'>500ms</option>
                                <option value='750ms'>750ms</option>
                                <option value='1s'>1s</option>
                                <option value='2s'>2s</option>
                                <option value='3s'>3s</option>
                            </select>
                        </div>
                        <div className='info'>{appLang?.settings?.scanner_rtt_desc}</div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings'>
                    <div
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
                    </div>
                </div>
                <div
                    className={classNames(
                        'appToast',
                        endpoint === defaultSettings.endpoint ? 'hidden' : ''
                    )}
                >
                    <div>
                        <i className='material-icons'>&#xe0f0;</i>
                        {appLang?.settings?.scanner_alert}
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
