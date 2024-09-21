import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';

const useSingBox = () => {
    useGoBackOnEscape();
    const [closeSingBox, setCloseSingBox] = useState<boolean>();
    const [closeHelper, setCloseSHelper] = useState<boolean>();
    const [mtu, setMtu] = useState<number>();
    const [showPortModal, setShowPortModal] = useState<boolean>(false);

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

    return {
        closeSingBox,
        closeHelper,
        mtu,
        setMtu,
        handleCloseSingBoxOnClick,
        handleCloseSingBoxOnKeyDown,
        handleCloseHelperOnClick,
        handleCloseHelperOnKeyDown,
        onClickMtu,
        onKeyDownClickMtu,
        showPortModal
    };
};
export default useSingBox;
