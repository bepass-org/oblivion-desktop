import classNames from 'classnames';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';

import Nav from '../../components/Nav';
import { defaultSettings } from '../../../defaultSettings';
import LottieFile from '../../../../assets/json/1713988096625.json';
import EndpointModal from '../../components/Modal/Endpoint';
import Tabs from '../../components/Tabs';
import useScanner from './useScanner';
import Dropdown from '../../components/Dropdown';

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
        showEndpointModal,
        loading
    } = useScanner();

    if (loading)
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
                endpoint={endpoint || ''}
                setEndpoint={setEndpoint}
                title={appLang?.modal?.endpoint_title}
                isOpen={showEndpointModal}
                onClose={onCloseEndpointModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='scanner' />
                <div className='settings' role='menu'>
                    <div
                        role='presentation'
                        className={classNames(
                            'item',
                            endpoint === defaultSettings.endpoint ? '' : 'disabled'
                        )}
                    >
                        <Dropdown
                            id='id-type-select'
                            onChange={onChangeType}
                            value={ipType || ''}
                            label={appLang?.settings?.scanner_ip_type}
                            tabIndex={0}
                            disabled={endpoint !== defaultSettings.endpoint}
                            items={[
                                {
                                    value: '',
                                    label: appLang?.settings?.scanner_ip_type_auto
                                },
                                { value: '-4', label: 'IPv4' },
                                {
                                    value: '-6',
                                    label: 'IPv6'
                                }
                            ]}
                        />
                        <div className='info'>{appLang?.settings?.scanner_ip_type_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className={classNames(
                            'item',
                            endpoint === defaultSettings.endpoint ? '' : 'disabled'
                        )}
                    >
                        <Dropdown
                            label={appLang?.settings?.scanner_rtt}
                            id='rtt-select'
                            onChange={onChangeRTT}
                            value={rtt || ''}
                            disabled={endpoint !== defaultSettings.endpoint}
                            tabIndex={0}
                            items={[
                                {
                                    value: '1s',
                                    label: appLang?.settings?.scanner_rtt_default
                                },
                                {
                                    value: '300ms',
                                    label: '300ms'
                                },
                                {
                                    value: '500ms',
                                    label: '500ms'
                                },
                                {
                                    value: '750ms',
                                    label: '750ms'
                                },
                                {
                                    value: '1s',
                                    label: '1s'
                                },
                                {
                                    value: '2s',
                                    label: '2s'
                                },
                                {
                                    value: '3s',
                                    label: '3s'
                                }
                            ]}
                        />
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
                        role='button'
                        className={classNames('item')}
                        onClick={onOpenEndpointModal}
                        onKeyDown={onKeyDownEndpoint}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='endpoint'>
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
                        role='button'
                        className={'item'}
                        onClick={onClickReservedButton}
                        onKeyDown={onKeyDownReservedButton}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='reserved'>
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
            <Toaster
                position='bottom-center'
                reverseOrder={false}
                containerStyle={{ bottom: '70px' }}
            />
        </>
    );
}
