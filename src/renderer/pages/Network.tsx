import classNames from 'classnames';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../components/Nav';
import { settings } from '../lib/settings';
import { defaultSettings } from '../../defaultSettings';
import LottieFile from '../../../assets/json/1713988096625.json';
import PortModal from '../components/Modal/Port';
import { settingsHaveChangedToast } from '../lib/toasts';
import { useStore } from '../store';
import { getLang } from '../lib/loaders';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';
import Tabs from '../components/Tabs';
import { toPersianNumber } from '../lib/toPersianNumber';
import RoutingRulesModal from '../components/Modal/RoutingRules';

export default function Options() {
    const { isConnected, isLoading } = useStore();

    useGoBackOnEscape();

    // TODO rename to networkConfiguration
    const [proxyMode, setProxyMode] = useState('');
    //const [autoSetProxy, setAutoSetProxy] = useState<undefined | boolean>();
    const [shareVPN, setShareVPN] = useState<undefined | boolean>();
    const [port, setPort] = useState<number>();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);
    const [appLang] = useState(getLang());
    const [ipData, setIpData] = useState<undefined | boolean>();
    const [dns, setDns] = useState<undefined | boolean>();
    const [routingRules, setRoutingRules] = useState<string>();
    const [showRoutingRulesModal, setShowRoutingRulesModal] = useState(false);

    useEffect(() => {
        settings.get('ipData').then((value) => {
            setIpData(typeof value === 'undefined' ? defaultSettings.ipData : value);
        });
        settings.get('port').then((value) => {
            setPort(typeof value === 'undefined' ? defaultSettings.port : value);
        });
        /*settings.get('autoSetProxy').then((value) => {
            setAutoSetProxy(typeof value === 'undefined' ? defaultSettings.autoSetProxy : value);
        });*/
        settings.get('proxyMode').then((value) => {
            setProxyMode(typeof value === 'undefined' ? defaultSettings.proxyMode : value);
        });
        settings.get('shareVPN').then((value) => {
            setShareVPN(typeof value === 'undefined' ? defaultSettings.shareVPN : value);
        });
        settings.get('dns').then((value) => {
            setDns(typeof value === 'undefined' ? defaultSettings.dns : value);
        });
        settings.get('routingRules').then((value) => {
            setRoutingRules(typeof value === 'undefined' ? defaultSettings.routingRules : value);
        });
    }, []);

    const countRoutingRules = (value: any) => {
        if (value === '') {
            return appLang?.settings?.routing_rules_disabled;
        }
        const lines = value.split('\n');
        return lines?.length > 0
            ? toPersianNumber(lines.length) + ' ' + (appLang?.settings?.routing_rules_items || '')
            : appLang?.settings?.routing_rules_disabled;
    };

    if (
        typeof ipData === 'undefined' ||
        typeof port === 'undefined' ||
        //typeof autoSetProxy === 'undefined' ||
        typeof proxyMode === 'undefined' ||
        typeof shareVPN === 'undefined' ||
        typeof dns === 'undefined' ||
        typeof routingRules === 'undefined'
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
            <Nav title={appLang?.settings?.network} />
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
            <RoutingRulesModal
                {...{
                    routingRules,
                    setRoutingRules
                }}
                title={appLang?.settings?.routing_rules}
                isOpen={showRoutingRulesModal}
                onClose={() => {
                    setShowRoutingRulesModal(false);
                    settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                }}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='network' />
                <div className='settings'>
                    {/*<div
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
                    </div>*/}
                    <div className='item'>
                        <label className='key' htmlFor='proxy-mode-selector'>
                            {appLang?.settings?.proxy_mode}
                        </label>
                        <div className='value'>
                            <select
                                id='proxy-mode-selector'
                                onChange={(e) => {
                                    setProxyMode(e.target.value);
                                    settings.set('proxyMode', e.target.value);
                                    settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                                    setTimeout(function () {
                                        if (e.target.value === 'none') {
                                            setIpData(false);
                                            settings.set('ipData', false);
                                        }
                                    }, 1000);
                                }}
                                value={proxyMode}
                            >
                                <option value='none'>None</option>
                                <option value='system'>System Proxy</option>
                                {/*<option value='tun' disabled>TUN2Sock</option>*/}
                            </select>
                        </div>
                        <div className='info'>{appLang?.settings?.proxy_mode_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className='item'
                        onClick={() => {
                            setShowPortModal(true);
                        }}
                    >
                        <label className='key' htmlFor='port'>
                            {appLang?.settings?.port}
                        </label>
                        <div className='value' id='port'>
                            <span className='dirLeft'>{port}</span>
                        </div>
                        <div className='info'>{appLang?.settings?.port_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className='item'
                        onClick={() => {
                            setShowRoutingRulesModal(true);
                        }}
                    >
                        <label className='key' htmlFor='routing-rules'>
                            {appLang?.settings?.routing_rules}
                        </label>
                        <div className='value' id='routing-rules'>
                            <span className='dirLeft' dir='rtl'>
                                {countRoutingRules(routingRules)}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.routing_rules_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className={classNames('item', shareVPN ? 'checked' : '')}
                        onClick={() => {
                            setShareVPN(!shareVPN);
                            settings.set('shareVPN', !shareVPN);
                            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                            setTimeout(function () {
                                settings.set('hostIP', !shareVPN ? '0.0.0.0' : '127.0.0.1');
                            }, 1000);
                        }}
                    >
                        <label className='key' htmlFor='share-vpn'>
                            {appLang?.settings?.share_vpn}
                        </label>
                        <div className='value' id='share-vpn'>
                            <div className={classNames('checkbox', shareVPN ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.share_vpn_desc}</div>
                    </div>
                    {/*<div
                        className={classNames('item')}
                        onClick={() => {
                            setDns(!dns);
                            settings.set('dns', !dns);
                            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                        }}
                    >
                        <label className='key'>{appLang?.settings?.dns}</label>
                        <div className='value'>
                            <div className={'checkbox'}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.dns_desc}</div>
                    </div>*/}
                    <div
                        role='presentation'
                        className={classNames('item', proxyMode === 'none' ? 'disabled' : '')}
                        onClick={() => {
                            if (proxyMode !== 'none') {
                                setIpData(!ipData);
                                settings.set('ipData', !ipData);
                            }
                        }}
                    >
                        <label className='key' htmlFor='ip-data'>
                            {appLang?.settings?.ip_data}
                        </label>
                        <div className='value' id='ip-data'>
                            <div className={classNames('checkbox', ipData ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.ip_data_desc}</div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
