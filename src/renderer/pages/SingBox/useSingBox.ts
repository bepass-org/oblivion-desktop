import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import {
    defaultSettings,
    singBoxGeoIp,
    singBoxGeoSite,
    singBoxLog,
    singBoxStack,
    singBoxAddrType,
    settingsKeys
} from '../../../defaultSettings';
import useButtonKeyDown from '../../hooks/useButtonKeyDown';
import { useStore } from '../../store';

type SettingValue = string | number | boolean | null;

type SettingsState = {
    [key in settingsKeys]?: SettingValue;
};

const useSingBox = () => {
    const { proxyMode } = useStore();
    const appLang = useTranslate();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);

    const [settingsState, setSettingsState] = useState<SettingsState>({});

    const getDefaultValue = (key: settingsKeys): SettingValue => {
        switch (key) {
            case 'singBoxGeoIp':
                return singBoxGeoIp[0].geoIp;
            case 'singBoxGeoSite':
                return singBoxGeoSite[0].geoSite;
            case 'singBoxLog':
                return singBoxLog[0].value;
            case 'singBoxStack':
                return singBoxStack[0].value;
            case 'singBoxAddrType':
                return singBoxAddrType[0].value;
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
                    'singBoxGeoIp',
                    'singBoxGeoSite',
                    'singBoxGeoBlock',
                    'singBoxGeoNSFW',
                    'singBoxLog',
                    'singBoxStack',
                    'singBoxSniff',
                    'singBoxAddrType',
                    'singBoxUdpBlock',
                    'singBoxDiscordBypass'
                ];
                const values = await settings.getMultiple(keysToFetch);

                const newState = keysToFetch.reduce((acc, key) => {
                    acc[key] = values[key] ?? getDefaultValue(key);
                    return acc;
                }, {} as SettingsState);

                setSettingsState(newState);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchSettings().then(() => console.log('Fetching settings'));
    }, []);

    const handleToggleSetting = useCallback(
        (key: settingsKeys) => {
            const currentValue = settingsState[key];
            if (typeof currentValue === 'boolean') {
                const newValue = !currentValue;
                settings.set(key, newValue).then(() => {
                    setSettingsState((prevState) => ({ ...prevState, [key]: newValue }));
                });
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

    const onKeyDownClickMtu = useButtonKeyDown(onClickMtu);

    const setMtu = useCallback((newMtu: number) => {
        settings.set('singBoxMTU', newMtu).then(() => {
            setSettingsState((prevState) => ({ ...prevState, singBoxMTU: newMtu }));
        });
    }, []);

    return {
        appLang,
        settingsState,
        setSettingsState,
        proxyMode,
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
