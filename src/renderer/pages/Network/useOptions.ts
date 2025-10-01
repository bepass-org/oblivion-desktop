import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../../store';
import { settings } from '../../lib/settings';
import { toPersianNumber } from '../../lib/toPersianNumber';
//import toast from 'react-hot-toast';
import {
    defaultToast,
    defaultToastWithHelp,
    loadingToast,
    settingsHaveChangedToast,
    stopLoadingToast
} from '../../lib/toasts';
import { defaultSettings, dnsServers } from '../../../defaultSettings';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { DropdownItem } from '../../components/Dropdown';
import useButtonKeyDown from '../../hooks/useButtonKeyDown';
import { withDefault } from '../../lib/withDefault';
import { typeIsNotUndefined } from '../../lib/isAnyUndefined';

const useOptions = () => {
    const {
        isConnected,
        setIsConnected,
        isLoading,
        setIsLoading,
        setIsCheckingForUpdates,
        setHasNewUpdate,
        setDownloadProgress,
        setProxyStatus
    } = useStore();
    const [lang, setLang] = useState<string>('');

    // TODO rename to networkConfiguration
    const [proxyMode, setProxyMode] = useState<string>('');
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
                const checkProxy = withDefault(values.proxyMode, defaultSettings.proxyMode);
                setPort(withDefault(values.port, defaultSettings.port));
                setProxyMode(checkProxy);
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
            if (args.key === 'connect' && !isLoading) {
                setProxyStatus(proxyMode);
                ipcRenderer.sendMessage('wp-start');
                setIsLoading(true);
                return;
            } else if (args.key === 'disconnect' && !isLoading) {
                ipcRenderer.sendMessage('wp-end');
                setIsLoading(true);
                return;
            } else if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });

        ipcRenderer.on('change-proxy-mode', (value: any) => {
            onChangeProxyMode(value);
        });

        ipcRenderer.on('guide-toast', (message: any) => {
            switch (message) {
                case 'error_port_restart':
                    loadingToast(appLang.log.error_port_restart);
                    break;

                case 'sb_error_tun0':
                    setIsLoading(false);
                    setIsConnected(false);
                    stopLoadingToast();
                    defaultToast(appLang.log.error_script_failed, 'GUIDE', 7000);
                    break;

                case 'sb_preparing':
                    loadingToast(appLang.status.preparing_rulesets);
                    setTimeout(() => {
                        stopLoadingToast();
                    }, 3000);
                    break;

                case 'sb_download_failed':
                    setIsLoading(false);
                    setIsConnected(false);
                    stopLoadingToast();
                    setTimeout(() => {
                        defaultToast(
                            appLang.status.downloading_rulesets_failed,
                            'DOWNLOAD_FAILED',
                            3000
                        );
                    }, 2000);
                    break;

                case 'sb_start_failed':
                    stopLoadingToast();
                    setIsLoading(false);
                    setIsConnected(false);
                    break;

                case 'sb_stop_failed':
                    setIsLoading(false);
                    setIsConnected(true);
                    break;

                case 'sb_error_ipv6':
                    stopLoadingToast();
                    setIsLoading(false);
                    setIsConnected(false);
                    defaultToastWithHelp(
                        appLang.log.error_singbox_ipv6_address,
                        'https://github.com/bepass-org/oblivion-desktop/wiki/Fixing-the-set-ipv6-address:-Element-not-found-Error',
                        appLang.toast.help_btn,
                        'GUIDE'
                    );
                    break;

                case 'error_warp_identity':
                    defaultToastWithHelp(
                        appLang.log.error_warp_identity,
                        'https://github.com/bepass-org/oblivion-desktop/wiki/Fixing-proxy-connection-issues-on-certain-networks',
                        appLang.toast.help_btn,
                        'GUIDE'
                    );
                    break;

                default:
                    defaultToast(message, 'GUIDE', 7000);
                    break;
            }
        });

        ipcRenderer.on('new-update', (HasNewUpdate: any) => {
            setIsCheckingForUpdates(false);
            setHasNewUpdate(HasNewUpdate);
        });

        ipcRenderer.on('download-progress', (args: any) => {
            setDownloadProgress(args);
        });

        ipcRenderer.on('wp-start', (ok: any) => {
            if (ok) {
                setIsLoading(false);
                setIsConnected(true);
            }
        });

        ipcRenderer.on('wp-end', (ok: any) => {
            if (ok) {
                setIsConnected(false);
                setIsLoading(false);
            }
        });

        return () => {
            ipcRenderer.removeAllListeners('tray-menu');
            ipcRenderer.removeAllListeners('change-proxy-mode');
            ipcRenderer.removeAllListeners('guide-toast');
            ipcRenderer.removeAllListeners('new-update');
            ipcRenderer.removeAllListeners('download-progress');
            ipcRenderer.removeAllListeners('wp-start');
            ipcRenderer.removeAllListeners('wp-end');
        };
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
            await settings.set('dns', dnsServers[3].value);
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
