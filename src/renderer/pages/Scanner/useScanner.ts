import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { getLang } from '../../lib/loaders';
import { useStore } from '../../store';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { useNavigate } from 'react-router-dom';
import { ipcRenderer } from '../../lib/utils';

const useScanner = () => {
    const { isConnected, isLoading } = useStore();
    const [appLang] = useState(getLang());

    const [endpoint, setEndpoint] = useState<string>();
    const [showEndpointModal, setShowEndpointModal] = useState<boolean>(false);
    const [ipType, setIpType] = useState<undefined | string>();
    const [rtt, setRtt] = useState<undefined | string>();
    const [reserved, setReserved] = useState<undefined | boolean>();

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

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });
    }, []);

    const onCloseEndpointModal = useCallback(() => {
        setShowEndpointModal(false);
        settingsHaveChangedToast({ ...{ isConnected, isLoading } });
    }, [isConnected, isLoading]);

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
            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
        },
        [isConnected, isLoading]
    );

    const onChangeRTT = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setRtt(event.target.value);
            settings.set('rtt', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading } });
        },
        [isConnected, isLoading]
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
    return {
        endpoint,
        ipType,
        rtt,
        reserved,
        appLang,
        showEndpointModal,
        onCloseEndpointModal,
        onOpenEndpointModal,
        onKeyDownEndpoint,
        onChangeType,
        onChangeRTT,
        onClickReservedButton,
        onKeyDownReservedButton,
        setEndpoint
    };
};
export default useScanner;
