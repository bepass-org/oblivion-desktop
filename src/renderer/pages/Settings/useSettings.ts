import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { countries, defaultSettings } from '../../../defaultSettings';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { DropdownItem } from '../../components/Dropdown';
import useButtonKeyDown from '../../hooks/useButtonKeyDown';

const useSettings = () => {
    const appLang = useTranslate();
    const { isConnected, isLoading } = useStore();

    const [location, setLocation] = useState<string>();
    const [license, setLicense] = useState<string>();
    const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
    const [method, setMethod] = useState<string>('');
    const [proxyMode, setProxyMode] = useState<string>('');
    const [testUrl, setTestUrl] = useState<string>();
    const [showTestUrlModal, setShowTestUrlModal] = useState<boolean>(false);

    const navigate = useNavigate();

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

    const onKeyDownLicense = useButtonKeyDown(onOpenLicenseModal);

    const onEnableWarp = useCallback(() => {
        setMethod('');
        settings.set('method', '');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, [isConnected, isLoading, appLang]);

    const onKeyDownWarp = useButtonKeyDown(onEnableWarp);

    const onEnableGool = useCallback(() => {
        setMethod('gool');
        settings.set('method', 'gool');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, [isConnected, isLoading, appLang]);

    const onKeyDownGool = useButtonKeyDown(onEnableGool);

    const onEnablePsiphon = useCallback(() => {
        //if (proxyMode !== 'tun') {
        setMethod('psiphon');
        settings.set('method', 'psiphon');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        //}
    }, [isConnected, isLoading, appLang]);

    const onKeyDownPsiphon = useButtonKeyDown(onEnablePsiphon);

    const onChangeLocation = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            setLocation(event.target.value);
            settings.set('location', event.target.value);
            settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        },
        [isConnected, isLoading, appLang]
    );

    const locationItems: DropdownItem[] = useMemo(
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

    const onKeyDownTestUrl = useButtonKeyDown(onOpenTestUrlModal);

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
