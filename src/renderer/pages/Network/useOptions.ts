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
    const [checkingLocalIp, setCheckingLocalIp] = useState<boolean>();
    const [hostIp, setHostIp] = useState<undefined | string>('');
    const [showDnsModal, setShowDnsModal] = useState<boolean>(false);
    const [plainDns, setPlainDns] = useState<undefined | string>();
    const [doh, setDoh] = useState<undefined | string>();

    const navigate = useNavigate();

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
                'hostIP',
                'plainDns',
                'DoH',
                'networkList'
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
                setPlainDns(
                    typeof values.plainDns === 'undefined'
                        ? defaultSettings.plainDns
                        : values.plainDns
                );
                setDoh(typeof values.DoH === 'undefined' ? defaultSettings.DoH : values.DoH);
                if (typeof values.networkList !== 'undefined') {
                    setNetworkList((prev) => {
                        try {
                            const rawItems = JSON.parse(values.networkList);
                            const normalized = rawItems.map((item: any) =>
                                typeof item === 'string' ? { value: item, label: item } : item
                            );
                            const combined = [...prev, ...normalized];
                            const unique = Array.from(
                                new Map(combined.map((item) => [item.value, item])).values()
                            );
                            return unique;
                        } catch (e) {
                            console.error('Invalid JSON for networkList:', e);
                            return prev;
                        }
                    });
                }
                if (checkProxy === 'none') {
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
    }, []);

    const filteredNetworkList = useMemo(() => {
        return networkList.filter((item) => {
            if (proxyMode === 'none') return true;
            return item.value !== '0.0.0.0';
        });
    }, [networkList, proxyMode]);

    useEffect(() => {
        if (proxyMode !== 'none' && hostIp === '0.0.0.0') {
            const fallbackIp = '127.0.0.1';
            setHostIp(fallbackIp);
            settings.set('hostIP', fallbackIp);
        }
    }, [proxyMode, hostIp]);

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
        (input: ChangeEvent<HTMLSelectElement> | string) => {
            const value = typeof input === 'string' ? input : input.target.value;
            //if (proxyMode === value) return;

            setProxyMode(value);
            settings.set('proxyMode', value);
            settingsHaveChangedToast({ isConnected, isLoading, appLang });
            ipcRenderer.sendMessage('tray-state', { proxyMode: value });

            setTimeout(() => {
                if (value === 'none') {
                    setIpData(false);
                    settings.set('ipData', false);
                    setDataUsage(false);
                    settings.set('dataUsage', false);
                } else if (value === 'tun') {
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
            const dnsValue = event.target.value;
            if (dnsValue == 'custom') {
                setShowDnsModal(true);
            } else {
                setDns(dnsValue);
                settings.set('dns', dnsValue);
                settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
            }
        },
        [isConnected, isLoading, appLang]
    );

    const onCloseDnsModal = useCallback(() => {
        setShowDnsModal(false);
    }, []);

    const setDefaultDns = useCallback(async () => {
        setDns(dnsServers[0].value);
        await settings.set('dns', dnsServers[0].value);
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, []);

    const cleanDns = useCallback(async () => {
        setDns(dnsServers[0].value);
        setPlainDns('');
        setDoh('');
        await settings.set('plainDns', '');
        await settings.set('DoH', '');
        await settings.set('dns', dnsServers[0].value);
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, []);

    const setCustomDns = useCallback(
        async (newPlainDns: string, newDoh: string) => {
            setPlainDns(newPlainDns);
            setDoh(newDoh);
            setDns('custom');
            await settings.set('plainDns', newPlainDns);
            await settings.set('DoH', newDoh);
            await settings.set('dns', dnsServers[3].value);
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
            /*setTimeout(function () {
                if (event.target.value === networkList[1]?.value) {
                    setIpData(false);
                    setDataUsage(false);
                    settings.set('ipData', false);
                    settings.set('dataUsage', false);
                }
            }, 1000);*/
        },
        [isConnected, isLoading, appLang, ipData, hostIp]
    );

    const handleCheckIpDataOnClick = useCallback(() => {
        if (proxyMode === 'none') {
            return;
        }
        /*if (hostIp === networkList[1]?.value) {
            return;
        }*/
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
        networkList: filteredNetworkList,
        onChangeLanMode,
        showDnsModal,
        onCloseDnsModal,
        plainDns,
        doh,
        setDefaultDns,
        cleanDns,
        setCustomDns,
        setShowDnsModal,
        checkingLocalIp
    };
};
export default useOptions;
