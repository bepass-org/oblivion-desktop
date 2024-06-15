import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';

interface LicenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    license: string;
    setLicense: (value: string) => void;
}

const useLicenseModal = (props: LicenseModalProps) => {
    const { isOpen, license, onClose, setLicense } = props;
    const [licenseInput, setLicenseInput] = useState<string>(license);
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onSaveModalClick = useCallback(() => {
        const regex = /^[a-zA-Z0-9-]*$/;
        const tmp = regex.test(licenseInput) ? licenseInput : '';
        setLicenseInput(tmp);
        setLicense(tmp);
        settings.set('license', tmp);
        handleOnClose();
    }, [handleOnClose, licenseInput, setLicense]);

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
        setLicenseInput(license);
        handleOnClose();
    }, [license, handleOnClose]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

    const handleLicenseInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setLicenseInput(e.target.value.trim());
        },
        [setLicenseInput]
    );

    const handleClearLicenseInput = useCallback(() => {
        setLicenseInput('');
        setLicense('');
        settings.set('license', '');
        handleOnClose();
    }, [setLicenseInput, setLicense, handleOnClose]);

    return {
        appLang,
        handleCancelButtonClick,
        handleLicenseInputChange,
        handleOnClose,
        licenseInput,
        onSaveModalClick,
        showModal,
        handleCancelButtonKeyDown,
        onSaveModalKeyDown,
        handleClearLicenseInput
    };
};

export default useLicenseModal;
