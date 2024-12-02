import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import { defaultSettings, singBoxGeoIp, singBoxGeoSite } from '../../../defaultSettings';

const useSingBox = () => {
    useGoBackOnEscape();
    const appLang = useTranslate();
    const [closeHelper, setCloseSHelper] = useState<boolean>();
    const [mtu, setMtu] = useState<number>();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);
    const [proxyMode, setProxyMode] = useState<string>('');
    const [geoIp, setGeoIp] = useState<undefined | string>();
    const [geoSite, setGeoSite] = useState<undefined | string>();
    const [geoBlock, setGeoBlock] = useState<undefined | boolean>();

    useEffect(() => {
        settings.get('closeHelper').then((value) => {
            setCloseSHelper(typeof value === 'undefined' ? defaultSettings.closeHelper : value);
        });
        settings.get('singBoxMTU').then((value) => {
            setMtu(typeof value === 'undefined' ? defaultSettings.singBoxMTU : value);
        });
        settings.get('proxyMode').then((value) => {
            setProxyMode(typeof value === 'undefined' ? defaultSettings.proxyMode : value);
        });
        settings.get('singBoxGeoIp').then((value) => {
            setGeoIp(typeof value === 'undefined' ? singBoxGeoIp[0].geoIp : value);
        });
        settings.get('singBoxGeoSite').then((value) => {
            setGeoSite(typeof value === 'undefined' ? singBoxGeoSite[0].geoSite : value);
        });
        settings.get('singBoxGeoBlock').then((value) => {
            setGeoBlock(typeof value === 'undefined' ? defaultSettings.singBoxGeoBlock : value);
        });
    }, []);

    const handleCloseHelperOnClick = useCallback(() => {
        settings.set('closeHelper', !closeHelper).then(() => setCloseSHelper(!closeHelper));
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
