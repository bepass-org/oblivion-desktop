import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';

const useSettings = () => {
    const appLang = useTranslate();
    const { isConnected, isLoading } = useStore();

    //const [scan, setScan] = useState(true);
    //const [endpoint, setEndpoint] = useState();
    //const [showEndpointModal, setShowEndpointModal] = useState(false);
    //const [ipType, setIpType] = useState<undefined | string>();
    //const [psiphon, setPsiphon] = useState<undefined | boolean>();
    const [location, setLocation] = useState<undefined | string>();
    const [license, setLicense] = useState<string>();
    const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
    //const [gool, setGool] = useState<undefined | boolean>();
    const [method, setMethod] = useState<undefined | string>('');

    const navigate = useNavigate();

    /*useEffect(() => {
        if (endpoint === '' || endpoint === defaultSettings.endpoint) {
            setScan(true);
        }
    }, [endpoint]);*/

    useGoBackOnEscape();

    useEffect(() => {
        /*settings.get('scan').then((value) => {
            setScan(typeof value === 'undefined' ? defaultSettings.scan : value);
        });*/
        /*settings.get('endpoint').then((value) => {
            setEndpoint(typeof value === 'undefined' ? defaultSettings.endpoint : value);
        });*/
        /*settings.get('ipType').then((value) => {
            setIpType(typeof value === 'undefined' ? defaultSettings.ipType : value);
        });*/
        /*settings.get('psiphon').then((value) => {
            setPsiphon(typeof value === 'undefined' ? defaultSettings.psiphon : value);
        });*/
        settings.get('location').then((value) => {
            setLocation(typeof value === 'undefined' ? defaultSettings.location : value);
        });
        settings.get('license').then((value) => {
            setLicense(typeof value === 'undefined' ? defaultSettings.license : value);
        });
        /*settings.get('gool').then((value) => {
            setGool(typeof value === 'undefined' ? defaultSettings.gool : value);
        });*/
        settings.get('method').then((value) => {
            setMethod(typeof value === 'undefined' ? defaultSettings.method : value);
        });

        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });
    }, []);

    const onCloseLicenseModal = useCallback(() => {
        setShowLicenseModal(false);
    }, []);

    const onOpenLicenseModal = useCallback(() => setShowLicenseModal(true), []);

    const onKeyDownLicense = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onOpenLicenseModal();
            }
        },
        [onOpenLicenseModal]
    );

    const onEnableWarp = useCallback(() => {
        setMethod('');
        settings.set('method', '');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, [isConnected, isLoading, appLang]);

    const onKeyDownWarp = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onEnableWarp();
            }
        },
        [onEnableWarp]
    );

    const onEnableGool = useCallback(() => {
        setMethod('gool');
        settings.set('method', 'gool');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, [isConnected, isLoading, appLang]);

    const onKeyDownGool = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onEnableGool();
            }
        },
        [onEnableGool]
    );

    const onEnablePsiphon = useCallback(() => {
        setMethod('psiphon');
        settings.set('method', 'psiphon');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, [isConnected, isLoading, appLang]);

    const onKeyDownPsiphon = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onEnablePsiphon();
            }
        },
        [onEnablePsiphon]
    );

    const onChangeLocation = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setLocation(event.target.value);
            settings.set('location', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        },
        [isConnected, isLoading, appLang]
    );

    const loading =
        typeof location === 'undefined' ||
        typeof license === 'undefined' ||
        typeof method === 'undefined';

    return {
        location,
        license,
        showLicenseModal,
        method,
        appLang,
        loading,
        setLicense,
        onCloseLicenseModal,
        onOpenLicenseModal,
        onKeyDownLicense,
        onEnableWarp,
        onKeyDownWarp,
        onEnableGool,
        onKeyDownGool,
        onEnablePsiphon,
        onKeyDownPsiphon,
        onChangeLocation
    };
};

export default useSettings;
