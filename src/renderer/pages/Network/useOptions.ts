import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { useStore } from '../../store';
import { settings } from '../../lib/settings';
import { toPersianNumber } from '../../lib/toPersianNumber';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { defaultSettings, dnsServers } from '../../../defaultSettings';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';

const useOptions = () => {
    const { isConnected, isLoading } = useStore();
    const [lang, setLang] = useState<string>('');

    useGoBackOnEscape();

    // TODO rename to networkConfiguration
    const [proxyMode, setProxyMode] = useState<string>('');
    //const [autoSetProxy, setAutoSetProxy] = useState<undefined | boolean>();
    const [shareVPN, setShareVPN] = useState<undefined | boolean>();
    const [port, setPort] = useState<number>();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);
    const appLang = useTranslate();
    const [ipData, setIpData] = useState<undefined | boolean>();
    const [dns, setDns] = useState<undefined | string>();
    const [routingRules, setRoutingRules] = useState<string>();
    const [showRoutingRulesModal, setShowRoutingRulesModal] = useState<boolean>(false);
    const [method, setMethod] = useState<undefined | string>('');
    const [dataUsage, setDataUsage] = useState<boolean>();
    const [localIp, setLocalIp] = useState('0.0.0.0');
    const navigate = useNavigate();

    const getLocalIP = async () => {
        const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
        const pc = new RTCPeerConnection({
            iceServers: []
        });
        pc.createDataChannel('');
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));
        pc.onicecandidate = (ice) => {
            if (ice && ice.candidate && ice.candidate.candidate) {
                const ipMatch = ipRegex.exec(ice.candidate.candidate);
                if (ipMatch) {
                    setLocalIp(ipMatch[0]);
                    pc.onicecandidate = null;
                }
            }
        };
    };

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
            setDns(typeof value === 'undefined' ? dnsServers[0].value : value);
        });
        settings.get('routingRules').then((value) => {
            setRoutingRules(typeof value === 'undefined' ? defaultSettings.routingRules : value);
        });
        settings.get('lang').then((value) => {
            setLang(typeof value === 'undefined' ? defaultSettings.lang : value);
        });
        settings.get('method').then((value) => {
            setMethod(typeof value === 'undefined' ? defaultSettings.method : value);
        });
        settings.get('dataUsage').then((value) => {
            setDataUsage(typeof value === 'undefined' ? defaultSettings.dataUsage : value);
        });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });

        getLocalIP();
    }, []);

    const countRoutingRules = useCallback(
        (value: string) => {
            if (value === '') {
                return appLang?.settings?.routing_rules_disabled;
            }
            const lines = value.split('\n');
            return lines?.length > 0
                ? (lang === 'fa' ? toPersianNumber(lines.length) : lines.length) +
                      ' ' +
                      (appLang?.settings?.routing_rules_items || '')
                : appLang?.settings?.routing_rules_disabled;
        },
        [appLang?.settings?.routing_rules_disabled, appLang?.settings?.routing_rules_items, lang]
    );

    const onClosePortModal = useCallback(() => {
        setShowPortModal(false);
    }, []);

    const onCloseRoutingRulesModal = useCallback(() => {
        setShowRoutingRulesModal(false);
    }, []);

    const onChangeProxyMode = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setProxyMode(event.target.value);
            settings.set('proxyMode', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
            setTimeout(function () {
                if (event.target.value === 'none') {
                    setIpData(false);
                    settings.set('ipData', false);
                    setDataUsage(false);
                    settings.set('dataUsage', false);
                } else if (event.target.value === 'tun') {
                    setShareVPN(false);
                    /*if (method === 'psiphon') {
                        settings.set('method', 'gool');
                        setMethod('gool');
                    }*/
                }
            }, 1000);
        },
        [isConnected, isLoading, appLang]
    );

    const onChangeDNS = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setDns(event.target.value);
            settings.set('dns', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        },
        [isConnected, isLoading, appLang]
    );

    const onClickPort = useCallback(() => setShowPortModal(true), []);

    const onKeyDownClickPort = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickPort();
            }
        },
        [onClickPort]
    );

    const onClickRoutingRoles = useCallback(() => {
        if (proxyMode !== 'none') {
            setShowRoutingRulesModal(true);
        }
    }, [proxyMode]);

    const onKeyDownRoutingRoles = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickRoutingRoles();
            }
        },
        [onClickRoutingRoles]
    );

    const handleShareVPNOnClick = useCallback(() => {
        if (proxyMode !== 'tun') {
            setShareVPN(!shareVPN);
            settings.set('shareVPN', !shareVPN);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
            setTimeout(function () {
                settings.set('hostIP', !shareVPN ? localIp : '127.0.0.1');
            }, 1000);
        }
    }, [isConnected, isLoading, shareVPN, appLang, localIp, proxyMode]);

    const handleShareVPNOnKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleShareVPNOnClick();
            }
        },
        [handleShareVPNOnClick]
    );

    const handleCheckIpDataOnClick = useCallback(() => {
        if (proxyMode !== 'none') {
            setIpData(!ipData);
            settings.set('ipData', !ipData);
        }
        setTimeout(function () {
            if (ipData) {
                setDataUsage(false);
                settings.set('dataUsage', false);
                ipcRenderer.sendMessage('check-speed', false);
            }
        }, 1000);
    }, [ipData, proxyMode]);

    const handleCheckIpDataOnKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCheckIpDataOnClick();
            }
        },
        [handleCheckIpDataOnClick]
    );

    const handleDataUsageOnClick = useCallback(() => {
        if (ipData) {
            setDataUsage(!dataUsage);
            settings.set('dataUsage', !dataUsage);
        }
        ipcRenderer.sendMessage('check-speed', isConnected && !dataUsage && ipData);
    }, [dataUsage, ipData, isConnected]);

    const handleDataUsageOnKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleDataUsageOnClick();
            }
        },
        [handleDataUsageOnClick]
    );

    const methodIsPsiphon = useMemo(() => method === 'psiphon', [method]);

    return {
        proxyMode,
        shareVPN,
        port,
        showPortModal,
        ipData,
        dns,
        routingRules,
        showRoutingRulesModal,
        appLang,
        dataUsage,
        methodIsPsiphon,
        setPort,
        setRoutingRules,
        countRoutingRules,
        onClosePortModal,
        onCloseRoutingRulesModal,
        onChangeProxyMode,
        onChangeDNS,
        onClickPort,
        onKeyDownClickPort,
        onClickRoutingRoles,
        onKeyDownRoutingRoles,
        handleShareVPNOnClick,
        handleShareVPNOnKeyDown,
        handleCheckIpDataOnClick,
        handleCheckIpDataOnKeyDown,
        handleDataUsageOnClick,
        handleDataUsageOnKeyDown
    };
};
export default useOptions;
