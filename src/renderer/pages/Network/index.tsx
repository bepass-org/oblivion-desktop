import classNames from 'classnames';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import LottieFile from '../../../../assets/json/1713988096625.json';
import PortModal from '../../components/Modal/Port';
import Tabs from '../../components/Tabs';
import RoutingRulesModal from '../../components/Modal/RoutingRules';
import useOptions from './useOptions';
import Dropdown from '../../components/Dropdown';

const proxyModes = [
    {
        value: 'none',
        label: 'None'
    },
    {
        value: 'system',
        label: 'System Proxy'
    }
]

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
        ipData,
        onChangeProxyMode,
        onClickPort,
        onClickRoutingRoles,
        onClosePortModal,
        onCloseRoutingRulesModal,
        onKeyDownClickPort,
        onKeyDownRoutingRoles,
        port,
        proxyMode,
        routingRules,
        shareVPN,
        showPortModal,
        showRoutingRulesModal,
        appLang
    } = useOptions();
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
            <div className='settings'>
                <div className='lottie'>
                    <Lottie animationData={LottieFile} loop={true} />
                </div>
            </div>
        );

    return (
        <>
            <Nav title={appLang?.settings?.network} />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='network' />
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
                        role='presentation'
                        className='item'
                        onClick={onClickPort}
                        onKeyDown={onKeyDownClickPort}
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
                        role='presentation'
                        className={classNames('item', proxyMode === 'none' ? 'disabled' : '')}
                        onClick={onClickRoutingRoles}
                        onKeyDown={onKeyDownRoutingRoles}
                    >
                        <label
                            className='key'
                            htmlFor='routing-rules'
                        >
                            {appLang?.settings?.routing_rules}
                        </label>
                        <div className='value' id='routing-rules'>
                            <span className='dirLeft' dir='auto' tabIndex={-1}>
                                {countRoutingRules(routingRules)}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.routing_rules_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className={classNames('item', shareVPN ? 'checked' : '')}
                        onClick={handleShareVPNOnClick}
                        onKeyDown={
                            // TODO: The code needs refactoring
                            handleShareVPNOnKeyDown
                        }
                    >
                        <label
                            className='key'
                            htmlFor='share-vpn'
                        >
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
                    {/*<div
                        className={classNames('item')}
                        onClick={() => {
                            setDns(!dns);
                            settings.set('dns', !dns);
                            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                        }}
                    >
                        <label className='key' role='label'>{appLang?.settings?.dns}</label>
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
                        onClick={handleCheckIpDataOnClick}
                        onKeyDown={
                            // TODO: The code needs refactoring
                            handleCheckIpDataOnKeyDown
                        }
                    >
                        <label
                            className='key'
                            htmlFor='ip-data'
                        >
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
