import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { countries, defaultSettings } from '../../../defaultSettings';
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
    const [proxyMode, setProxyMode] = useState<string>('');
    const [testUrl, setTestUrl] = useState<string>();
    const [showTestUrlModal, setShowTestUrlModal] = useState<boolean>(false);

    const navigate = useNavigate();

    /*useEffect(() => {
        if (endpoint === '' || endpoint === defaultSettings.endpoint) {
            setScan(true);
        }
    }, [endpoint]);*/

    useGoBackOnEscape();

    useEffect(() => {
        settings
            .getMultiple(['location', 'license', 'method', 'proxyMode', 'testUrl'])
            .then((values) => {
                setLocation(
                    typeof values.location === 'undefined'
                        ? defaultSettings.location
                        : values.location
                );
                setLicense(
                    typeof values.license === 'undefined' ? defaultSettings.license : values.license
                );
                setMethod(
                    typeof values.method === 'undefined' ? defaultSettings.method : values.method
                );
                setProxyMode(
                    typeof values.proxyMode === 'undefined'
                        ? defaultSettings.proxyMode
                        : values.proxyMode
                );
                setTestUrl(
                    typeof values.testUrl === 'undefined' ? defaultSettings.testUrl : values.testUrl
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
        //if (proxyMode !== 'tun') {
        setMethod('psiphon');
        settings.set('method', 'psiphon');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        //}
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

    const locationItems = useMemo(
        () => [
            {
                value: '',
                label: appLang?.settings?.method_psiphon_location_auto
            },
            ...countries
        ],
        [appLang?.settings?.method_psiphon_location_auto]
    );

    const methodIsWarp = useMemo(() => typeof method !== 'undefined' && method === '', [method]);
    const methodIsGool = useMemo(
        () => (typeof method !== 'undefined' && method === 'gool') || typeof method === 'undefined',
        [method]
    );
    const methodIsPsiphon = useMemo(
        () => typeof method !== 'undefined' && method === 'psiphon',
        [method]
    );

    const onCloseTestUrlModal = useCallback(() => {
        setShowTestUrlModal(false);
    }, []);

    const onOpenTestUrlModal = useCallback(() => setShowTestUrlModal(true), []);

    const onKeyDownTestUrl = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onOpenTestUrlModal();
            }
        },
        [onOpenTestUrlModal]
    );

    const loading =
        typeof location === 'undefined' ||
        typeof license === 'undefined' ||
        typeof testUrl === 'undefined' ||
        typeof method === 'undefined';

    return {
        location,
        license,
        showLicenseModal,
        method,
        methodIsWarp,
        methodIsGool,
        methodIsPsiphon,
        appLang,
        loading,
        locationItems,
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
        onChangeLocation,
        proxyMode,
        testUrl,
        setTestUrl,
        onCloseTestUrlModal,
        onKeyDownTestUrl,
        onOpenTestUrlModal,
        showTestUrlModal
    };
};

export default useSettings;
