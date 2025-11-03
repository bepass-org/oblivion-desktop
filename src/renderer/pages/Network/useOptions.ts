import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store';
import { settings } from '../../lib/settings';
import { toPersianNumber } from '../../lib/toPersianNumber';
//import toast from 'react-hot-toast';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { defaultSettings, dnsServers } from '../../../defaultSettings';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { DropdownItem } from '../../components/Dropdown';
import useButtonKeyDown from '../../hooks/useButtonKeyDown';
import { withDefault } from '../../lib/withDefault';
import { typeIsNotUndefined } from '../../lib/isAnyUndefined';

const useOptions = () => {
    const { isConnected, isLoading, proxyMode, setProxyMode } = useStore();
    const [lang, setLang] = useState<string>('');

    //const [autoSetProxy, setAutoSetProxy] = useState<undefined | boolean>();
    const [port, setPort] = useState<number>(defaultSettings.port);
    const [showPortModal, setShowPortModal] = useState<boolean>(false);
    const appLang = useTranslate();
    const [ipData, setIpData] = useState<boolean>();
    const [dns, setDns] = useState<string>('');
    const [routingRules, setRoutingRules] = useState<string>(defaultSettings.routingRules);
    const [showRoutingRulesModal, setShowRoutingRulesModal] = useState<boolean>(false);
    const [dataUsage, setDataUsage] = useState<boolean>();
    const [networkList, setNetworkList] = useState<DropdownItem[]>([
        { value: '127.0.0.1', label: '127.0.0.1' },
        { value: '0.0.0.0', label: '0.0.0.0' }
    ]);
    const [hostIp, setHostIp] = useState<string>('');
    const [showDnsModal, setShowDnsModal] = useState<boolean>(false);
    const [plainDns, setPlainDns] = useState<string>();
    const [doh, setDoh] = useState<string>();

    useEffect(() => {
        settings
            .getMultiple([
                'ipData',
                'port',
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
                setPort(withDefault(values.port, defaultSettings.port));
                setIpData(withDefault(values.ipData, defaultSettings.ipData));
                setDataUsage(withDefault(values.dataUsage, defaultSettings.dataUsage));
                setHostIp(withDefault(values.hostIP, defaultSettings.hostIP));
                setDns(withDefault(values.dns, dnsServers[0].value) || '');
                setRoutingRules(withDefault(values.routingRules, defaultSettings.routingRules));
                setLang(withDefault(values.lang, defaultSettings.lang));
                setPlainDns(withDefault(values.plainDns, defaultSettings.plainDns));
                setDoh(withDefault(values.DoH, defaultSettings.DoH));
                if (typeIsNotUndefined(values.networkList)) {
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
                if (proxyMode === 'none') {
                    setIpData(false);
                    settings.set('ipData', false);
                    setDataUsage(false);
                    settings.set('dataUsage', false);
                }
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });
    }, []);

    const filteredNetworkList: DropdownItem[] = useMemo(() => {
        return networkList.filter((item) => {
            if (proxyMode !== 'system') return true;
            return item.value !== '0.0.0.0';
        });
    }, [networkList, proxyMode]);

    useEffect(() => {
        if (proxyMode === 'system' && hostIp === '0.0.0.0') {
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
        (input: ChangeEvent<HTMLSelectElement>) => {
            const { value } = input.target;
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
            if (dnsValue === 'custom') {
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
            await settings.set('dns', 'custom');
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        },
        [isConnected, isLoading, appLang]
    );

    const onClickPort = useCallback(() => setShowPortModal(true), []);

    const onKeyDownClickPort = useButtonKeyDown(onClickPort);

    const onClickRoutingRoles = useCallback(() => {
        if (proxyMode !== 'none') {
            setShowRoutingRulesModal(true);
        }
    }, [proxyMode]);

    const onKeyDownRoutingRoles = useButtonKeyDown(onClickRoutingRoles);

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

    const handleCheckIpDataOnKeyDown = useButtonKeyDown(handleCheckIpDataOnClick);

    const handleDataUsageOnClick = useCallback(() => {
        if (ipData) {
            setDataUsage(!dataUsage);
            settings.set('dataUsage', !dataUsage);
        }
        ipcRenderer.sendMessage('net-stats', isConnected && !dataUsage && ipData);
    }, [dataUsage, ipData, isConnected]);

    const handleDataUsageOnKeyDown = useButtonKeyDown(handleDataUsageOnClick);

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
        setShowRoutingRulesModal,
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
        setShowDnsModal
    };
};
export default useOptions;
