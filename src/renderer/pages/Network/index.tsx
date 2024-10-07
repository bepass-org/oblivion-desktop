import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import PortModal from '../../components/Modal/Port';
import Tabs from '../../components/Tabs';
import RoutingRulesModal from '../../components/Modal/RoutingRules';
import useOptions from './useOptions';
import Dropdown from '../../components/Dropdown';
import { dnsServers } from '../../../defaultSettings';
//import { platform } from '../../lib/utils';

const proxyModes = [
    {
        value: 'none',
        label: 'None'
    },
    {
        value: 'system',
        label: 'System Proxy'
    },
    {
        value: 'tun',
        label: 'Tun 🧪'
    }
];

export default function Options() {
    const {
        countRoutingRules,
        dns,
        setPort,
        setRoutingRules,
        handleCheckIpDataOnClick,
        handleCheckIpDataOnKeyDown,
        handleShareVPNOnClick,
        handleShareVPNOnKeyDown,
        handleDataUsageOnClick,
        ipData,
        onChangeProxyMode,
        onChangeDNS,
        onClickPort,
        onClickRoutingRoles,
        onClosePortModal,
        onCloseRoutingRulesModal,
        onKeyDownClickPort,
        onKeyDownRoutingRoles,
        handleDataUsageOnKeyDown,
        port,
        proxyMode,
        routingRules,
        shareVPN,
        showPortModal,
        showRoutingRulesModal,
        appLang,
        dataUsage,
        methodIsPsiphon
    } = useOptions();
    if (
        typeof ipData === 'undefined' ||
        typeof port === 'undefined' ||
        //typeof autoSetProxy === 'undefined' ||
        typeof proxyMode === 'undefined' ||
        typeof shareVPN === 'undefined' ||
        typeof dns === 'undefined' ||
        typeof routingRules === 'undefined' ||
        typeof dataUsage === 'undefined'
    )
        return <div className='settings' />;

    return (
        <>
            <Nav title={appLang?.settings?.network} />
            <div className={classNames('myApp', 'normalPage', 'withScroll')}>
                <Tabs active='network' proxyMode={proxyMode} />
                <div className='settings' role='menu'>
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
                        <label className='key' role='label'>{appLang?.settings?.auto_set_proxy}</label>
                        <div className='value'>
                            <div className={classNames('checkbox', autoSetProxy ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.auto_set_proxy_desc}</div>
                    </div>*/}
                    <div className='item' role='presentation'>
                        <Dropdown
                            id='proxy-mode-selector'
                            items={proxyModes}
                            onChange={onChangeProxyMode}
                            value={proxyMode}
                            label={appLang?.settings?.proxy_mode}
                            tabIndex={0}
                        />
                        <div className='info'>{appLang?.settings?.proxy_mode_desc}</div>
                    </div>
                    <div
                        role='button'
                        className='item'
                        onClick={onClickPort}
                        onKeyDown={onKeyDownClickPort}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='port'>
                            {appLang?.settings?.port}
                        </label>
                        <div className='value' id='port'>
                            <span className='dirLeft' tabIndex={-1}>
                                {port}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.port_desc}</div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item', proxyMode === 'none' ? 'disabled' : '')}
                        onClick={onClickRoutingRoles}
                        onKeyDown={onKeyDownRoutingRoles}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='routing-rules'>
                            {appLang?.settings?.routing_rules}
                        </label>
                        <div className='value' id='routing-rules'>
                            <span className='dirLeft' dir='auto' tabIndex={-1}>
                                {countRoutingRules(routingRules)}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.routing_rules_desc}</div>
                    </div>
                    <div className={classNames('item', !methodIsPsiphon ? '' : 'disabled')}>
                        <Dropdown
                            id='flex-switch-check-checked-dns'
                            onChange={onChangeDNS}
                            value={dns || '1.1.1.1'}
                            label={appLang?.settings?.dns}
                            tabIndex={-1}
                            disabled={methodIsPsiphon}
                            items={dnsServers}
                        />
                        <div className='info'>
                            {!methodIsPsiphon
                                ? appLang?.settings?.dns_desc
                                : appLang?.settings?.dns_error}
                        </div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item', shareVPN ? 'checked' : '')}
                        onClick={handleShareVPNOnClick}
                        onKeyDown={
                            // TODO: The code needs refactoring
                            handleShareVPNOnKeyDown
                        }
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='share-vpn'>
                            {appLang?.settings?.share_vpn}
                        </label>
                        <div className='value' id='share-vpn'>
                            <div
                                tabIndex={-1}
                                className={classNames('checkbox', shareVPN ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.share_vpn_desc}</div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item', proxyMode === 'none' ? 'disabled' : '')}
                        onClick={handleCheckIpDataOnClick}
                        onKeyDown={
                            // TODO: The code needs refactoring
                            handleCheckIpDataOnKeyDown
                        }
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='ip-data'>
                            {appLang?.settings?.ip_data}
                        </label>
                        <div className='value' id='ip-data'>
                            <div
                                className={classNames('checkbox', ipData ? 'checked' : '')}
                                tabIndex={-1}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.ip_data_desc}</div>
                    </div>
                    <div
                        role='button'
                        className={classNames(
                            'item',
                            proxyMode === 'none' || !ipData ? 'disabled' : ''
                        )}
                        onClick={handleDataUsageOnClick}
                        onKeyDown={handleDataUsageOnKeyDown}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='data-usage'>
                            {appLang?.settings?.data_usage}
                        </label>
                        <div className='value' id='data-usage'>
                            <div
                                className={classNames('checkbox', dataUsage ? 'checked' : '')}
                                tabIndex={-1}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.data_usage_desc}</div>
                    </div>
                </div>
            </div>
            <PortModal
                port={port}
                setPort={setPort}
                title={appLang?.modal?.port_title}
                isOpen={showPortModal}
                onClose={onClosePortModal}
            />
            <RoutingRulesModal
                routingRules={routingRules}
                setRoutingRules={setRoutingRules}
                title={appLang?.settings?.routing_rules}
                isOpen={showRoutingRulesModal}
                onClose={onCloseRoutingRulesModal}
            />
            <Toaster
                position='bottom-center'
                reverseOrder={false}
                containerStyle={{ bottom: '70px' }}
            />
        </>
    );
}
