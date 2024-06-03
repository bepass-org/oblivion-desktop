import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { getLang } from '../../../lib/loaders';
import { settings } from '../../../lib/settings';

interface PortModalProps {
    isOpen: boolean;
    onClose: () => void;
    defValue: number;
    port: number;
    setPort: (value: number) => void;
}

const usePortModal = (props: PortModalProps) => {
    const { isOpen, onClose, port, setPort, defValue } = props;
    const [portInput, setPortInput] = useState<number>(port);
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = getLang();

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
        handleOnClose();
    }, [defValue, portInput, handleOnClose, setPort, isValidPort]);

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
