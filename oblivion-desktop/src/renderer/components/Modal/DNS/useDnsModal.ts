import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../localization/useTranslate';

interface DnsModalProps {
    isOpen: boolean;
    plainDns: string;
    DoH: string;
    onClose: () => void;
    setDefaultDns: () => void;
    cleanDns: () => void;
    setCustomDns: (plainDns: string, doh: string) => void;
}

const useDnsModal = (props: DnsModalProps) => {
    const { isOpen, plainDns, DoH, onClose, setDefaultDns, cleanDns, setCustomDns } = props;
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
        const cleanedPlain = plainDnsInput
            ?.replace(/https?:\/\//gi, '')
            ?.split('/')[0]
            ?.replace(/\//g, '');
        let fixedDoh = dohInput.trim();
        if (!/^https?:\/\//i.test(fixedDoh)) {
            fixedDoh = `https://${fixedDoh}`;
        }
        fixedDoh = fixedDoh?.replace(/\/+$/, '');
        setPlainDnsInput(cleanedPlain);
        setDohInput(fixedDoh);
        setCustomDns(cleanedPlain, fixedDoh);
        handleOnClose();
    }, [plainDnsInput, dohInput, plainDns, DoH, setCustomDns, handleOnClose]);

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
        cleanDns();
        handleOnClose();
    }, []);

    const handleSetDefault = useCallback(() => {
        setDefaultDns();
        handleOnClose();
    }, []);

    const handleCancelButtonClick = useCallback(() => {
        setPlainDnsInput(plainDns);
        setDohInput(DoH);
        handleOnClose();
    }, [handleOnClose, plainDns, DoH]);

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
        handleClearInputs,
        handleSetDefault
    };
};

export default useDnsModal;
