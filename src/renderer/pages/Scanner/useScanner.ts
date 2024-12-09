import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { toPersianNumber } from '../../lib/toPersianNumber';

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
    const [ipType, setIpType] = useState<undefined | string>();
    const [rtt, setRtt] = useState<undefined | string>();
    const [reserved, setReserved] = useState<undefined | boolean>();
    const [lang, setLang] = useState<string>('');
    const [proxyMode, setProxyMode] = useState<string>('');

    const navigate = useNavigate();

    useGoBackOnEscape();

    useEffect(() => {
        settings.get('endpoint').then((value) => {
            setEndpoint(typeof value === 'undefined' ? defaultSettings.endpoint : value);
        });
        settings.get('ipType').then((value) => {
            setIpType(typeof value === 'undefined' ? defaultSettings.ipType : value);
        });
        settings.get('rtt').then((value) => {
            setRtt(typeof value === 'undefined' ? defaultSettings.rtt : value);
        });
        settings.get('reserved').then((value) => {
            setReserved(typeof value === 'undefined' ? defaultSettings.reserved : value);
        });
        settings.get('profiles').then((value) => {
            setProfiles(
                typeof value === 'undefined'
                    ? JSON.parse(defaultSettings.profiles)
                    : JSON.parse(value)
            );
        });
        settings.get('lang').then((value) => {
            setLang(typeof value === 'undefined' ? defaultSettings.lang : value);
        });
        settings.get('proxyMode').then((value) => {
            setProxyMode(typeof value === 'undefined' ? defaultSettings.proxyMode : value);
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

    const onKeyDownEndpoint = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onOpenEndpointModal();
            }
        },
        [onOpenEndpointModal]
    );

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

    const onKeyDownReservedButton = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickReservedButton();
            }
        },
        [onClickReservedButton]
    );

    const onCloseProfileModal = useCallback(() => {
        setShowProfileModal(false);
    }, []);

    const onOpenProfileModal = useCallback(() => setShowProfileModal(true), []);

    const onKeyDownProfile = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onOpenProfileModal();
            }
        },
        [onOpenProfileModal]
    );

    const countProfiles = useCallback(
        (value: number) => {
            return value > 0
                ? (lang === 'fa' ? toPersianNumber(value) : value) +
                      ' ' +
                      (appLang?.settings?.routing_rules_items || '')
                : appLang?.settings?.routing_rules_disabled;
        },
        [appLang?.settings?.routing_rules_disabled, appLang?.settings?.routing_rules_items, lang]
    );

    const ipSelectorItems = useMemo(
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

    const rttSelectorItems = useMemo(
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
