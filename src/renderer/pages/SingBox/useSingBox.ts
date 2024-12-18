import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import { defaultSettings, singBoxGeoIp, singBoxGeoSite } from '../../../defaultSettings';

const useSingBox = () => {
    useGoBackOnEscape();
    const appLang = useTranslate();
    const [closeHelper, setCloseHelper] = useState<boolean>();
    const [mtu, setMtu] = useState<number>();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);
    const [proxyMode, setProxyMode] = useState<string>('');
    const [geoIp, setGeoIp] = useState<undefined | string>();
    const [geoSite, setGeoSite] = useState<undefined | string>();
    const [geoBlock, setGeoBlock] = useState<undefined | boolean>();

    useEffect(() => {
        settings
            .getMultiple([
                'closeHelper',
                'singBoxMTU',
                'proxyMode',
                'singBoxGeoIp',
                'singBoxGeoSite',
                'singBoxGeoBlock'
            ])
            .then((values) => {
                setCloseHelper(
                    typeof values.closeHelper === 'undefined'
                        ? defaultSettings.closeHelper
                        : values.closeHelper
                );
                setMtu(
                    typeof values.singBoxMTU === 'undefined'
                        ? defaultSettings.singBoxMTU
                        : values.singBoxMTU
                );
                setProxyMode(
                    typeof values.proxyMode === 'undefined'
                        ? defaultSettings.proxyMode
                        : values.proxyMode
                );
                setGeoIp(
                    typeof values.singBoxGeoIp === 'undefined'
                        ? singBoxGeoIp[0].geoIp
                        : values.singBoxGeoIp
                );
                setGeoSite(
                    typeof values.singBoxGeoSite === 'undefined'
                        ? singBoxGeoSite[0].geoSite
                        : values.singBoxGeoSite
                );
                setGeoBlock(
                    typeof values.singBoxGeoBlock === 'undefined'
                        ? defaultSettings.singBoxGeoBlock
                        : values.singBoxGeoBlock
                );
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });
    }, []);

    const handleCloseHelperOnClick = useCallback(() => {
        settings.set('closeHelper', !closeHelper).then(() => setCloseHelper(!closeHelper));
    }, [closeHelper]);

    const handleCloseHelperOnKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCloseHelperOnClick();
            }
        },
        [handleCloseHelperOnClick]
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

    const onChangeGeoIp = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const newGeoIp = event.target.value;
        settings.set('singBoxGeoIp', newGeoIp).then(() => setGeoIp(newGeoIp));
    }, []);

    const onChangeGeoSite = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const newGeoSite = event.target.value;
        settings.set('singBoxGeoSite', newGeoSite).then(() => setGeoSite(newGeoSite));
    }, []);

    const handleSingBoxGeoBlockOnClick = useCallback(() => {
        settings.set('singBoxGeoBlock', !geoBlock).then(() => setGeoBlock(!geoBlock));
    }, [geoBlock]);

    const handleSingBoxGeoBlockOnKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSingBoxGeoBlockOnClick();
            }
        },
        [handleSingBoxGeoBlockOnClick]
    );

    return {
        appLang,
        closeHelper,
        geoIp,
        onChangeGeoIp,
        geoSite,
        onChangeGeoSite,
        mtu,
        setMtu,
        handleCloseHelperOnClick,
        handleCloseHelperOnKeyDown,
        onClickMtu,
        onKeyDownClickMtu,
        showPortModal,
        proxyMode,
        geoBlock,
        handleSingBoxGeoBlockOnClick,
        handleSingBoxGeoBlockOnKeyDown
    };
};
export default useSingBox;
