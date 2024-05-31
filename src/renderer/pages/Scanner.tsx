import classNames from 'classnames';
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
// import { motion } from 'framer-motion';

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

    const [endpoint, setEndpoint] = useState<string>();
    const [showEndpointModal, setShowEndpointModal] = useState<boolean>(false);
    const [ipType, setIpType] = useState<undefined | string>();
    const [rtt, setRtt] = useState<undefined | string>();
    const [reserved, setReserved] = useState<undefined | boolean>();

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
        settings.get('reserved').then((value) => {
            setReserved(typeof value === 'undefined' ? defaultSettings.reserved : value);
        });
    }, []);

    const onCloseEndpointModal = useCallback(() => {
        setShowEndpointModal(false);
        settingsHaveChangedToast({ ...{ isConnected, isLoading } });
    }, [isConnected, isLoading]);

    const onOpenEndpointModal = useCallback(() => setShowEndpointModal(true), []);

    const onChangeType = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setIpType(event.target.value);
            settings.set('ipType', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
        },
        [isConnected, isLoading]
    );

    const onChangeRTT = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setRtt(event.target.value);
            settings.set('rtt', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
        },
        [isConnected, isLoading]
    );

    const onClickReservedButton = useCallback(() => {
        setReserved(!reserved);
        settings.set('reserved', !reserved);
    }, [reserved]);

    if (
        typeof endpoint === 'undefined' ||
        typeof ipType === 'undefined' ||
        typeof rtt === 'undefined' ||
        typeof reserved === 'undefined'
    )
        return (
            <div className='settings'>
                <div className='lottie'>
                    <Lottie animationData={LottieFile} loop />
                </div>
            </div>
        );

    return (
        <>
            <Nav title={appLang?.settings?.scanner} />
            <EndpointModal
                endpoint={endpoint}
                setEndpoint={setEndpoint}
                title={appLang?.modal?.endpoint_title}
                isOpen={showEndpointModal}
                onClose={onCloseEndpointModal}
            />
            <div
                // initial={{
                //     opacity: 0
                // }}

                // animate={{
                //     opacity: 1
                // }}
                // exit={{
                //     opacity: 0
                // }}
                className={classNames('myApp', 'normalPage')}
            >
                <Tabs active='scanner' />
                <div className='settings' role='menu'>
                    <div
                        role='presentation'
                        className={classNames(
                            'item',
                            endpoint === defaultSettings.endpoint ? '' : 'disabled'
                        )}
                    >
                        <label className='key' htmlFor='id-type-select' role='label'>
                            {appLang?.settings?.scanner_ip_type}
                        </label>
                        <div className='value'>
                            <select
                                tabIndex={0}
                                role='listbox'
                                id='id-type-select'
                                onChange={onChangeType}
                                disabled={endpoint !== defaultSettings.endpoint}
                                value={ipType}
                            >
                                <option value='' role='option'>
                                    {appLang?.settings?.scanner_ip_type_auto}
                                </option>
                                <option value='-4' role='option'>
                                    IPv4
                                </option>
                                <option value='-6' role='option'>
                                    IPv6
                                </option>
                            </select>
                        </div>
                        <div className='info'>{appLang?.settings?.scanner_ip_type_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className={classNames(
                            'item',
                            endpoint === defaultSettings.endpoint ? '' : 'disabled'
                        )}
                    >
                        <label className='key' htmlFor='rtt-select' role='label'>
                            {appLang?.settings?.scanner_rtt}
                        </label>
                        <div className='value'>
                            <select
                                tabIndex={0}
                                role='listbox'
                                id='rtt-select'
                                onChange={onChangeRTT}
                                disabled={endpoint !== defaultSettings.endpoint}
                                value={rtt}
                            >
                                <option value='1s' role='option'>
                                    {appLang?.settings?.scanner_rtt_default}
                                </option>
                                <option value='300ms' role='option'>
                                    300ms
                                </option>
                                <option value='500ms' role='option'>
                                    500ms
                                </option>
                                <option value='750ms' role='option'>
                                    750ms
                                </option>
                                <option value='1s' role='option'>
                                    1s
                                </option>
                                <option value='2s' role='option'>
                                    2s
                                </option>
                                <option value='3s' role='option'>
                                    3s
                                </option>
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
                        role='presentation'
                        className={classNames('item')}
                        onClick={onOpenEndpointModal}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onOpenEndpointModal();
                            }
                        }}
                    >
                        <label className='key' htmlFor='endpoint' role='label'>
                            {appLang?.settings?.endpoint}
                        </label>
                        <div className='value'>
                            <span className='dirLeft' id='endpoint' tabIndex={-1}>
                                {endpoint}
                            </span>
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
                <div className='settings'>
                    <div
                        role='presentation'
                        className={'item'}
                        onClick={onClickReservedButton}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onClickReservedButton();
                            }
                        }}
                    >
                        <label className='key' htmlFor='reserved' role='label'>
                            {appLang?.settings?.scanner_reserved}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                id='reserved'
                                className={classNames('checkbox', reserved ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.scanner_reserved_desc}</div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
