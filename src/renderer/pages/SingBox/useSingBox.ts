import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import useTranslate from '../../../localization/useTranslate';
import { defaultSettings, singBoxGeo } from '../../../defaultSettings';

const useSingBox = () => {
    useGoBackOnEscape();
    const appLang = useTranslate();
    const [closeSingBox, setCloseSingBox] = useState<boolean>();
    const [closeHelper, setCloseSHelper] = useState<boolean>();
    const [mtu, setMtu] = useState<number>();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);
    const [proxyMode, setProxyMode] = useState<string>('');
    const [geo, setGeo] = useState<undefined | string>();
    const [geoBlock, setGeoBlock] = useState<undefined | boolean>();

    useEffect(() => {
        settings.get('closeSingBox').then((value) => {
            setCloseSingBox(typeof value === 'undefined' ? defaultSettings.closeSingBox : value);
        });
        settings.get('closeHelper').then((value) => {
            setCloseSHelper(typeof value === 'undefined' ? defaultSettings.closeHelper : value);
        });
        settings.get('singBoxMTU').then((value) => {
            setMtu(typeof value === 'undefined' ? defaultSettings.singBoxMTU : value);
        });
        settings.get('proxyMode').then((value) => {
            setProxyMode(typeof value === 'undefined' ? defaultSettings.proxyMode : value);
        });
        settings.get('singBoxGeo').then((value) => {
            setGeo(typeof value === 'undefined' ? singBoxGeo[0].region : value);
        });
        settings.get('singBoxGeoBlock').then((value) => {
            setGeoBlock(typeof value === 'undefined' ? defaultSettings.singBoxGeoBlock : value);
        });
    }, []);

    const handleCloseSingBoxOnClick = useCallback(() => {
        settings.set('closeSingBox', !closeSingBox).then(() => setCloseSingBox(!closeSingBox));
    }, [closeSingBox]);

    const handleCloseSingBoxOnKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCloseSingBoxOnClick();
            }
        },
        [handleCloseSingBoxOnClick]
    );

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

    const onChangeGeo = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const newGeo = event.target.value;
        settings.set('singBoxGeo', newGeo).then(() => setGeo(newGeo));
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
        closeSingBox,
        closeHelper,
        geo,
        onChangeGeo,
        mtu,
        setMtu,
        handleCloseSingBoxOnClick,
        handleCloseSingBoxOnKeyDown,
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
