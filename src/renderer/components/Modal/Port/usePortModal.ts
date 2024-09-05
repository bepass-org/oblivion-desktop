import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { useStore } from '../../../store';
import { settingsHaveChangedToast } from '../../../lib/toasts';

interface PortModalProps {
    isOpen: boolean;
    onClose: () => void;
    defValue: number;
    port: number;
    setPort: (value: number) => void;
}

const usePortModal = (props: PortModalProps) => {
    const { isConnected, isLoading } = useStore();
    const { isOpen, onClose, port, setPort, defValue } = props;
    const [portInput, setPortInput] = useState<number>(port);
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const isValidPort = useCallback((value: number) => {
        return /^\d{1,5}$/.test(value.toString()) && value >= 20 && value <= 65535;
    }, []);

    const onSaveModalClick = useCallback(() => {
        const tmp = isValidPort(portInput) ? portInput : defValue;
        setPortInput(tmp);
        setPort(tmp);
        settings.set('port', tmp);
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [isValidPort, portInput, defValue, setPort, isConnected, isLoading, appLang, handleOnClose]);

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
        setPortInput(port);
        handleOnClose();
    }, [port, handleOnClose]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

    const handlePortInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setPortInput(Number(event.target.value));
    }, []);

    return {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handlePortInputChange,
        handleOnClose,
        portInput,
        onSaveModalClick,
        onSaveModalKeyDown,
        showModal
    };
};
export default usePortModal;
