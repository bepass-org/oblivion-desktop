import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { useStore } from '../../../store';
import { settingsHaveChangedToast } from '../../../lib/toasts';

interface MtuModalProps {
    isOpen: boolean;
    onClose: () => void;
    defValue: number;
    mtu: number;
    setMtu: (value: number) => void;
}

const useMTUModal = (props: MtuModalProps) => {
    const { isConnected, isLoading } = useStore();
    const { isOpen, onClose, mtu, setMtu, defValue } = props;
    const [mtuInput, setMtuInput] = useState<number>(mtu);
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const isValidMtu = useCallback((value: number) => {
        return /^\d{1,4}$/.test(value.toString()) && value >= 1000 && value <= 9999;
    }, []);

    const onSaveModalClick = useCallback(() => {
        const tmp = isValidMtu(mtuInput) ? mtuInput : defValue;
        setMtuInput(tmp);
        setMtu(tmp);
        settings.set('singBoxMTU', tmp);
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [isValidMtu, mtuInput, defValue, setMtu, isConnected, isLoading, appLang, handleOnClose]);

    const onSaveModalKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onSaveModalClick();
            }
        },
        [onSaveModalClick]
    );

    const handleCancelButtonClick = useCallback(() => {
        setMtuInput(mtu);
        handleOnClose();
    }, [mtu, handleOnClose]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

    const handleMtuInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setMtuInput(Number(event.target.value));
    }, []);

    return {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleMtuInputChange,
        handleOnClose,
        mtuInput,
        onSaveModalClick,
        onSaveModalKeyDown,
        showModal
    };
};
export default useMTUModal;
