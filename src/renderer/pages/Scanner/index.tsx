import classNames from 'classnames';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
// import { motion } from 'framer-motion';

import Nav from '../../components/Nav';
import { defaultSettings } from '../../../defaultSettings';
import LottieFile from '../../../../assets/json/1713988096625.json';
import EndpointModal from '../../components/Modal/Endpoint';
import Tabs from '../../components/Tabs';
import useScanner from './useScanner';

export default function Scanner() {
    const {
        onChangeRTT,
        setEndpoint,
        onChangeType,
        onClickReservedButton,
        onCloseEndpointModal,
        onKeyDownEndpoint,
        onKeyDownReservedButton,
        onOpenEndpointModal,
        appLang,
        endpoint,
        ipType,
        reserved,
        rtt,
        showEndpointModal
    } = useScanner();
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
                        <label
                            className='key'
                            htmlFor='id-type-select'
                            // role='label'
                        >
                            {appLang?.settings?.scanner_ip_type}
                        </label>
                        <div className='value'>
                            <select
                                tabIndex={0}
                                // role='listbox'
                                id='id-type-select'
                                onChange={onChangeType}
                                disabled={endpoint !== defaultSettings.endpoint}
                                value={ipType}
                            >
                                <option
                                    value=''
                                    //  role='option'
                                >
                                    {appLang?.settings?.scanner_ip_type_auto}
                                </option>
                                <option
                                    value='-4'
                                    // role='option'
                                >
                                    IPv4
                                </option>
                                <option
                                    value='-6'
                                    // role='option'
                                >
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
                        <label
                            className='key'
                            htmlFor='rtt-select'
                            // role='label'
                        >
                            {appLang?.settings?.scanner_rtt}
                        </label>
                        <div className='value'>
                            <select
                                tabIndex={0}
                                // role='listbox'
                                id='rtt-select'
                                onChange={onChangeRTT}
                                disabled={endpoint !== defaultSettings.endpoint}
                                value={rtt}
                            >
                                <option
                                    value='1s'
                                    // role='option'
                                >
                                    {appLang?.settings?.scanner_rtt_default}
                                </option>
                                <option
                                    value='300ms'
                                    // role='option'
                                >
                                    300ms
                                </option>
                                <option
                                    value='500ms'
                                    // role='option'
                                >
                                    500ms
                                </option>
                                <option
                                    value='750ms'
                                    // role='option'
                                >
                                    750ms
                                </option>
                                <option
                                    value='1s'
                                    // role='option'
                                >
                                    1s
                                </option>
                                <option
                                    value='2s'
                                    // role='option'
                                >
                                    2s
                                </option>
                                <option
                                    value='3s'
                                    // role='option'
                                >
                                    3s
                                </option>
                            </select>
                        </div>
                        <div className='info' role='note'>
                            {appLang?.settings?.scanner_rtt_desc}
                        </div>
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
                        onKeyDown={onKeyDownEndpoint}
                    >
                        <label
                            className='key'
                            htmlFor='endpoint'
                            // role='label'
                        >
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
                        onKeyDown={onKeyDownReservedButton}
                    >
                        <label
                            className='key'
                            htmlFor='reserved'
                            // role='label'
                        >
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
