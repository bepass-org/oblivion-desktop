import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import useOptions from './useOptions';
import Nav from '../../components/Nav';
import PortModal from '../../components/Modal/Port';
import Tabs from '../../components/Tabs';
import RoutingRulesModal from '../../components/Modal/RoutingRules';
import Dropdown, { DropdownItem } from '../../components/Dropdown';
import { dnsServers } from '../../../defaultSettings';
//import { platform } from '../../lib/utils';
import DnsModal from '../../components/Modal/DNS';
import { isAnyUndefined } from '../../lib/isAnyUndefined';

const proxyModes: DropdownItem[] = [
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
        label: 'Tun'
    }
];

export default function Network() {
    const {
        countRoutingRules,
        dns,
        setPort,
        setRoutingRules,
        setShowRoutingRulesModal,
        handleCheckIpDataOnClick,
        handleCheckIpDataOnKeyDown,
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
        showPortModal,
        showRoutingRulesModal,
        appLang,
        dataUsage,
        hostIp,
        networkList,
        onChangeLanMode,
        showDnsModal,
        onCloseDnsModal,
        plainDns,
        doh,
        setDefaultDns,
        cleanDns,
        setCustomDns,
        setShowDnsModal
    } = useOptions();

    if (isAnyUndefined(ipData, port, proxyMode, dns, routingRules, dataUsage)) {
        return <div className='settings' />;
    }

    return (
        <>
            <Nav title={appLang?.settings?.network} />
            <DnsModal
                title={appLang?.modal?.custom_dns_title}
                isOpen={showDnsModal}
                onClose={onCloseDnsModal}
                plainDns={plainDns || ''}
                DoH={doh || ''}
                setDefaultDns={setDefaultDns}
                cleanDns={cleanDns}
                setCustomDns={setCustomDns}
            />
            <div className={classNames('myApp', 'normalPage', 'withScroll')}>
                <div className='container'>
                    <Tabs active='network' proxyMode={proxyMode} />
                    <div className='settings' role='menu'>
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
                        <div role='button' className={'item'} tabIndex={0}>
                            <Dropdown
                                id='lan-selector'
                                items={networkList}
                                onChange={onChangeLanMode}
                                value={hostIp ? hostIp : networkList[0]?.value}
                                label={appLang?.settings?.share_vpn}
                                tabIndex={0}
                            />
                            <div className='info'>{appLang?.settings?.share_vpn_desc}</div>
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
                        <div className={classNames('item')}>
                            {dns === 'custom' ? (
                                <>
                                    <label className='key' htmlFor='flex-switch-check-checked-dns'>
                                        {appLang?.settings?.dns}
                                    </label>
                                    <div
                                        className='value'
                                        id='flex-switch-check-checked-dns'
                                        onClick={() => {
                                            setShowDnsModal(true);
                                        }}
                                    >
                                        <span className='dirLeft' dir='ltr' tabIndex={-1}>
                                            {plainDns !== ''
                                                ? plainDns
                                                      ?.replace(/^https?:\/\//, '')
                                                      ?.split('/')[0]
                                                : 'Custom'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <Dropdown
                                    id='flex-switch-check-checked-dns'
                                    onChange={onChangeDNS}
                                    value={dns}
                                    label={appLang?.settings?.dns}
                                    tabIndex={-1}
                                    items={dnsServers}
                                />
                            )}
                            <div className='info'>{appLang?.settings?.dns_desc}</div>
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
                setIsOpen={setShowRoutingRulesModal}
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
