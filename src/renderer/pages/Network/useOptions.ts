import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { useStore } from '../../store';
import { settings } from '../../lib/settings';
import { toPersianNumber } from '../../lib/toPersianNumber';
//import toast from 'react-hot-toast';
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
    const [port, setPort] = useState<number>();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);
    const appLang = useTranslate();
    const [ipData, setIpData] = useState<undefined | boolean>();
    const [dns, setDns] = useState<undefined | string>();
    const [routingRules, setRoutingRules] = useState<string>();
    const [showRoutingRulesModal, setShowRoutingRulesModal] = useState<boolean>(false);
    const [method, setMethod] = useState<undefined | string>('');
    const [dataUsage, setDataUsage] = useState<boolean>();
    const [networkList, setNetworkList] = useState<{ value: string; label: string }[]>([
        { value: '127.0.0.1', label: '127.0.0.1' },
        { value: '0.0.0.0', label: '0.0.0.0' }
    ]);
    const [hostIp, setHostIp] = useState<undefined | string>('');

    const navigate = useNavigate();

    const getLocalIP = async () => {
        if (networkList.length > 2) return false;
        const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
        return new Promise((resolve, reject) => {
            const pc = new RTCPeerConnection({
                iceServers: []
            });
            pc.createDataChannel('');
            pc.onicecandidate = (iceEvent) => {
                if (iceEvent.candidate && iceEvent.candidate.candidate) {
                    const candidate = iceEvent.candidate.candidate;
                    if (candidate.includes('udp')) {
                        const ipMatch = ipRegex.exec(iceEvent.candidate.candidate);
                        if (ipMatch) {
                            resolve(ipMatch[0]);
                            pc.close();
                        }
                    }
                }
            };
            pc.createOffer()
                .then((offer) => pc.setLocalDescription(offer))
                .catch((err) => {
                    reject(`Error creating offer: ${err.message}`);
                    pc.close();
                });
        });
    };

    useEffect(() => {
        settings
            .getMultiple([
                'ipData',
                'port',
                'proxyMode',
                'dns',
                'routingRules',
                'lang',
                'method',
                'dataUsage',
                'hostIP'
            ])
            .then((values) => {
                setPort(typeof values.port === 'undefined' ? defaultSettings.port : values.port);
                const checkProxy =
                    typeof values.proxyMode === 'undefined'
                        ? defaultSettings.proxyMode
                        : values.proxyMode;
                setProxyMode(checkProxy);
                setIpData(
                    typeof values.ipData === 'undefined' ? defaultSettings.ipData : values.ipData
                );
                setDataUsage(
                    typeof values.dataUsage === 'undefined'
                        ? defaultSettings.dataUsage
                        : values.dataUsage
                );
                const checkHostIp =
                    typeof values.hostIP === 'undefined' ? defaultSettings.hostIP : values.hostIP;
                setHostIp(checkHostIp);
                setDns(typeof values.dns === 'undefined' ? dnsServers[0].value : values.dns);
                setRoutingRules(
                    typeof values.routingRules === 'undefined'
                        ? defaultSettings.routingRules
                        : values.routingRules
                );
                setLang(typeof values.lang === 'undefined' ? defaultSettings.lang : values.lang);
                setMethod(
                    typeof values.method === 'undefined' ? defaultSettings.method : values.method
                );
                if (checkHostIp === networkList[1]?.value || checkProxy === 'none') {
                    setIpData(false);
                    settings.set('ipData', false);
                    setDataUsage(false);
                    settings.set('dataUsage', false);
                }
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });

        getLocalIP()
            .then((ip: any) => {
                if (ip && ip !== '') {
                    const exists = networkList.some((network) => network.value === ip);
                    if (!exists) {
                        setNetworkList((prev) => [
                            ...prev,
                            { value: ip, label: ip, key: `network-${ip}` }
                        ]);
                    }
                }
            })
            .catch((err) => console.log(err));
    }, []);

    /*useEffect(() => {
        if (dataUsage) {
            defaultToast(`${appLang?.toast?.hardware_usage}`, 'DATA_USAGE');
        } else {
            toast.remove('DATA_USAGE');
        }
    }, [dataUsage]);*/

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
                    //setHostIp(networkList[0].value);
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

    const onChangeLanMode = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setHostIp(event.target.value);
            settings.set('hostIP', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
            setTimeout(function () {
                if (event.target.value === networkList[1]?.value) {
                    setIpData(false);
                    setDataUsage(false);
                    settings.set('ipData', false);
                    settings.set('dataUsage', false);
                }
            }, 1000);
        },
        [isConnected, isLoading, appLang, ipData, hostIp]
    );

    const handleCheckIpDataOnClick = useCallback(() => {
        if (proxyMode === 'none') {
            return;
        }
        if (hostIp === networkList[1]?.value) {
            return;
        }
        setIpData(!ipData);
        settings.set('ipData', !ipData);
        setTimeout(function () {
            if (ipData) {
                setDataUsage(false);
                settings.set('dataUsage', false);
                ipcRenderer.sendMessage('net-stats', false);
            }
        }, 1000);
    }, [ipData, proxyMode, hostIp]);

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
        ipcRenderer.sendMessage('net-stats', isConnected && !dataUsage && ipData);
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
        handleCheckIpDataOnClick,
        handleCheckIpDataOnKeyDown,
        handleDataUsageOnClick,
        handleDataUsageOnKeyDown,
        hostIp,
        networkList,
        onChangeLanMode
    };
};
export default useOptions;
