import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store';
import { settings } from '../../lib/settings';
import { countries, defaultSettings } from '../../../defaultSettings';
import { settingsHaveChangedToast } from '../../lib/toasts';
import { platform, arch } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { DropdownItem } from '../../components/Dropdown';
import useButtonKeyDown from '../../hooks/useButtonKeyDown';
import { withDefault } from '../../lib/withDefault';
import { isAnyUndefined, typeIsNotUndefined, typeIsUndefined } from '../../lib/isAnyUndefined';

const useSettings = () => {
    const appLang = useTranslate();
    const { isConnected, isLoading, proxyMode } = useStore();

    const [location, setLocation] = useState<string>();
    const [license, setLicense] = useState<string>();
    const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
    const [method, setMethod] = useState<string>('');
    const [testUrl, setTestUrl] = useState<string>();
    const [showTestUrlModal, setShowTestUrlModal] = useState<boolean>(false);

    useEffect(() => {
        settings
            .getMultiple(['location', 'license', 'method', 'testUrl'])
            .then((values) => {
                setLocation(withDefault(values.location, defaultSettings.location));
                setLicense(withDefault(values.license, defaultSettings.license));
                setMethod(withDefault(values.method, defaultSettings.method));
                setTestUrl(withDefault(values.testUrl, defaultSettings.testUrl));
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
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

    const onEnableMasque = useCallback(() => {
        setMethod('masque');
        settings.set('method', 'masque');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
    }, [isConnected, isLoading, appLang]);

    const onKeyDownMasque = useButtonKeyDown(onEnableMasque);

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

    const methodIsWarp = useMemo(() => typeIsNotUndefined(method) && method === '', [method]);
    const methodIsGool = useMemo(
        () => (typeIsNotUndefined(method) && method === 'gool') || typeIsUndefined(method),
        [method]
    );
    const methodIsPsiphon = useMemo(
        () => typeIsNotUndefined(method) && method === 'psiphon',
        [method]
    );
    const methodIsMasque = useMemo(
        () => typeIsNotUndefined(method) && method === 'masque',
        [method]
    );

    const onCloseTestUrlModal = useCallback(() => {
        setShowTestUrlModal(false);
    }, []);

    const onOpenTestUrlModal = useCallback(() => setShowTestUrlModal(true), []);

    const onKeyDownTestUrl = useButtonKeyDown(onOpenTestUrlModal);

    const loading = isAnyUndefined(location, license, testUrl, method);

    return {
        location,
        license,
        showLicenseModal,
        method,
        methodIsWarp,
        methodIsGool,
        methodIsPsiphon,
        methodIsMasque,
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
        onEnableMasque,
        onKeyDownMasque,
        onEnablePsiphon,
        onKeyDownPsiphon,
        onChangeLocation,
        proxyMode,
        testUrl,
        setTestUrl,
        onCloseTestUrlModal,
        onKeyDownTestUrl,
        onOpenTestUrlModal,
        showTestUrlModal,
        unsupportedArch: platform === 'win32' && arch === 'ia32'
    };
};

export default useSettings;
