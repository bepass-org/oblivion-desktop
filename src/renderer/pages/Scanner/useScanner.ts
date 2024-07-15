import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { toPersianNumber } from '../../lib/toPersianNumber';

const useScanner = () => {
    const { isConnected, isLoading } = useStore();
    const appLang = useTranslate();

    const [endpoint, setEndpoint] = useState<string>();
    const [profiles, setProfiles] = useState<any>([]);
    const [showEndpointModal, setShowEndpointModal] = useState<boolean>(false);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
    const [ipType, setIpType] = useState<undefined | string>();
    const [rtt, setRtt] = useState<undefined | string>();
    const [reserved, setReserved] = useState<undefined | boolean>();
    const [lang, setLang] = useState<string>('');

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

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });
    }, []);

    const onCloseEndpointModal = useCallback(() => {
        setShowEndpointModal(false);
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, [isConnected, isLoading, appLang]);

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
        [
            appLang?.settings?.routing_rules_disabled,
            appLang?.settings?.routing_rules_items,
            lang
        ]
    );

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
        countProfiles
    };
};
export default useScanner;
