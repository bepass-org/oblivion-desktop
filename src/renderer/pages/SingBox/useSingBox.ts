import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import {
    defaultSettings,
    singBoxGeoIp,
    singBoxGeoSite,
    singBoxLog,
    singBoxStack,
    settingsKeys
} from '../../../defaultSettings';
import { platform } from '../../lib/utils';

type SettingValue<T> = T extends boolean ? boolean : T extends number ? number : string;

const useSingBox = () => {
    useGoBackOnEscape();
    const appLang = useTranslate();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);

    const [settingsState, setSettingsState] = useState<{
        [key in settingsKeys]?: SettingValue<any>;
    }>({});

    const getDefaultValue = (key: settingsKeys): SettingValue<any> => {
        switch (key) {
            case 'singBoxGeoIp':
                return singBoxGeoIp[0].geoIp;
            case 'singBoxGeoSite':
                return singBoxGeoSite[0].geoSite;
            case 'singBoxLog':
                return singBoxLog[0].value;
            case 'singBoxStack':
                return singBoxStack[0].value;
            case 'singBoxSniff':
            case 'singBoxSniffOverrideDest':
            case 'singBoxUDP':
                return platform === 'darwin' ? true : defaultSettings[key];
            default:
                return defaultSettings[key];
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const keysToFetch: settingsKeys[] = [
                    'closeHelper',
                    'singBoxMTU',
                    'proxyMode',
                    'singBoxGeoIp',
                    'singBoxGeoSite',
                    'singBoxGeoBlock',
                    'singBoxLog',
                    'singBoxStrictRoute',
                    'singBoxStack',
                    'singBoxSniff',
                    'singBoxSniffOverrideDest',
                    'singBoxUDP'
                ];
                const values = await settings.getMultiple(keysToFetch);

                const newState = keysToFetch.reduce(
                    (acc, key) => {
                        acc[key] = values[key] ?? getDefaultValue(key);
                        return acc;
                    },
                    {} as { [key in settingsKeys]?: SettingValue<any> }
                );

                setSettingsState(newState);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchSettings().then((done) => console.log('Fetching settings:', done));
    }, []);

    const handleToggleSetting = useCallback(
        async (key: settingsKeys) => {
            const currentValue = settingsState[key];
            if (typeof currentValue === 'boolean') {
                const newValue = !currentValue;

                const updateSetting = async (k: settingsKeys, v: boolean) => {
                    await settings.set(k, v);
                    setSettingsState((prevState) => ({ ...prevState, [k]: v }));
                };

                await updateSetting(key, newValue);

                const dependentSettings: {
                    [key in settingsKeys]?: { [value in 'true' | 'false']?: settingsKeys[] };
                } = {
                    singBoxUDP: {
                        true: ['singBoxSniff', 'singBoxSniffOverrideDest']
                    },
                    singBoxSniff: {
                        false: ['singBoxUDP']
                    },
                    singBoxSniffOverrideDest: {
                        false: ['singBoxUDP']
                    }
                };

                const dependents = dependentSettings[key]?.[`${newValue}` as 'true' | 'false'];
                if (dependents) {
                    for (const depKey of dependents) {
                        await new Promise((resolve) => setTimeout(resolve, 300));
                        await updateSetting(depKey, newValue);
                    }
                }
            }
        },
        [settingsState]
    );

    const handleSelectChange = useCallback(
        (key: settingsKeys) => (event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value;
            settings.set(key, value).then(() => {
                setSettingsState((prevState) => ({ ...prevState, [key]: value }));
            });
        },
        []
    );

    const handleKeyDown = useCallback(
        (key: settingsKeys) => (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleToggleSetting(key);
            }
        },
        [handleToggleSetting]
    );

    const onClickMtu = useCallback(() => setShowPortModal(!showPortModal), [showPortModal]);

    const onKeyDownClickMtu = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClickMtu();
            }
        },
        [onClickMtu]
    );

    const setMtu = useCallback((newMtu: number) => {
        settings.set('singBoxMTU', newMtu).then(() => {
            setSettingsState((prevState) => ({ ...prevState, singBoxMTU: newMtu }));
        });
    }, []);

    return {
        appLang,
        settingsState,
        setSettingsState,
        handleToggleSetting,
        handleSelectChange,
        handleKeyDown,
        showPortModal,
        setShowPortModal,
        onClickMtu,
        onKeyDownClickMtu,
        setMtu
    };
};

export default useSingBox;
