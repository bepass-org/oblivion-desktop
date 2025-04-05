import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../localization/useTranslate';

interface DnsModalProps {
    isOpen: boolean;
    plainDns: string;
    DoH: string;
    onClose: () => void;
    setDefaultDns: () => void;
    setCustomDns: (plainDns: string, doh: string) => void;
}

const useDnsModal = (props: DnsModalProps) => {
    const { isOpen, plainDns, DoH, onClose, setDefaultDns, setCustomDns } = props;
    const [showModal, setShowModal] = useState<boolean>(isOpen);
    const [plainDnsInput, setPlainDnsInput] = useState<string>(plainDns);
    const [dohInput, setDohInput] = useState<string>(DoH);
    const appLang = useTranslate();

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [setShowModal, onClose]);

    const onSaveModalClick = useCallback(() => {
        setCustomDns(plainDnsInput, dohInput);
        handleOnClose();
    }, [plainDnsInput, dohInput, plainDns, DoH, setCustomDns]);

    const onSaveModalKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onSaveModalClick();
            }
        },
        [onSaveModalClick]
    );

    const handleClearInputs = useCallback(() => {
        setPlainDnsInput('');
        setDohInput('');
        setDefaultDns();
        handleOnClose();
    }, []);

    const handleCancelButtonClick = useCallback(() => {
        handleOnClose();
    }, [handleOnClose]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

    const handlePlainDnsInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setPlainDnsInput(e.target.value.trim());
        },
        [setPlainDnsInput]
    );

    const handleDoHInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setDohInput(e.target.value.trim());
        },
        [setDohInput]
    );

    return {
        appLang,
        plainDnsInput,
        dohInput,
        showModal,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handlePlainDnsInputChange,
        handleDoHInputChange,
        handleOnClose,
        onSaveModalClick,
        onSaveModalKeyDown,
        handleClearInputs
    };
};

export default useDnsModal;
