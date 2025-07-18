import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { toPersianNumber } from '../../lib/toPersianNumber';
import { DropdownItem } from '../../components/Dropdown';
import useButtonKeyDown from '../../hooks/useButtonKeyDown';

export type Profile = {
    endpoint: string;
    name: string;
};

const useScanner = () => {
    const { isConnected, isLoading } = useStore();
    const appLang = useTranslate();

    const [endpoint, setEndpoint] = useState<string>();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [showEndpointModal, setShowEndpointModal] = useState<boolean>(false);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
    const [ipType, setIpType] = useState<string>();
    const [rtt, setRtt] = useState<string>();
    const [reserved, setReserved] = useState<boolean>();
    const [lang, setLang] = useState<string>('');
    const [proxyMode, setProxyMode] = useState<string>('');

    const navigate = useNavigate();

    useGoBackOnEscape();

    useEffect(() => {
        settings
            .getMultiple(['endpoint', 'ipType', 'rtt', 'reserved', 'profiles', 'lang', 'proxyMode'])
            .then((values) => {
                setEndpoint(
                    typeof values.endpoint === 'undefined'
                        ? defaultSettings.endpoint
                        : values.endpoint
                );
                setIpType(
                    typeof values.ipType === 'undefined' ? defaultSettings.ipType : values.ipType
                );
                setRtt(typeof values.rtt === 'undefined' ? defaultSettings.rtt : values.rtt);
                setReserved(
                    typeof values.reserved === 'undefined'
                        ? defaultSettings.reserved
                        : values.reserved
                );
                setProfiles(
                    typeof values.profiles === 'undefined'
                        ? JSON.parse(defaultSettings.profiles)
                        : JSON.parse(values.profiles)
                );
                setLang(typeof values.lang === 'undefined' ? defaultSettings.lang : values.lang);
                setProxyMode(
                    typeof values.proxyMode === 'undefined'
                        ? defaultSettings.proxyMode
                        : values.proxyMode
                );
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

    const onCloseEndpointModal = useCallback(() => {
        setShowEndpointModal(false);
    }, []);

    const onOpenEndpointModal = useCallback(() => setShowEndpointModal(true), []);

    const onKeyDownEndpoint = useButtonKeyDown(onOpenEndpointModal);

    const onChangeType = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setIpType(event.target.value);
            settings.set('ipType', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        },
        [isConnected, isLoading, appLang]
    );

    const onChangeRTT = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setRtt(event.target.value);
            settings.set('rtt', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        },
        [isConnected, isLoading, appLang]
    );

    const onClickReservedButton = useCallback(() => {
        setReserved(!reserved);
        settings.set('reserved', !reserved);
    }, [reserved]);

    const onKeyDownReservedButton = useButtonKeyDown(onClickReservedButton);

    const onCloseProfileModal = useCallback(() => {
        setShowProfileModal(false);
    }, []);

    const onOpenProfileModal = useCallback(() => setShowProfileModal(true), []);

    const onKeyDownProfile = useButtonKeyDown(onOpenProfileModal);

    const countProfiles = useCallback(
        (value: { name: string; endpoint: string }[] | undefined) => {
            if (!Array.isArray(value) || value.length === 0) {
                return appLang?.settings?.routing_rules_disabled;
            }
            const filteredValue = value.filter((item) => item.endpoint?.length > 7);
            const count = filteredValue.length;
            return count > 0
                ? (lang === 'fa' ? toPersianNumber(count) : count) +
                      ' ' +
                      (appLang?.settings?.routing_rules_items || '')
                : appLang?.settings?.routing_rules_disabled;
        },
        [appLang?.settings?.routing_rules_disabled, appLang?.settings?.routing_rules_items, lang]
    );

    const ipSelectorItems: DropdownItem[] = useMemo(
        () => [
            {
                value: '',
                label: appLang?.settings?.scanner_ip_type_auto
            },
            { value: '-4', label: 'IPv4' },
            {
                value: '-6',
                label: 'IPv6'
            }
        ],
        [appLang?.settings?.scanner_ip_type_auto]
    );

    const rttSelectorItems: DropdownItem[] = useMemo(
        () => [
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
        ],
        [appLang?.settings?.scanner_rtt_default]
    );

    const isDefaultEndpoint = useMemo(() => endpoint === defaultSettings.endpoint, [endpoint]);

    const loading =
        typeof endpoint === 'undefined' ||
        typeof profiles === 'undefined' ||
        typeof ipType === 'undefined' ||
        typeof rtt === 'undefined' ||
        typeof reserved === 'undefined';

    return {
        endpoint,
        ipType,
        rtt,
        reserved,
        appLang,
        showEndpointModal,
        loading,
        ipSelectorItems,
        rttSelectorItems,
        isDefaultEndpoint,
        onCloseEndpointModal,
        onOpenEndpointModal,
        onKeyDownEndpoint,
        onChangeType,
        onChangeRTT,
        onClickReservedButton,
        onKeyDownReservedButton,
        setEndpoint,
        profiles,
        setProfiles,
        showProfileModal,
        onOpenProfileModal,
        onCloseProfileModal,
        onKeyDownProfile,
        countProfiles,
        proxyMode
    };
};
export default useScanner;
