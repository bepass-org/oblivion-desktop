import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import { useStore } from '../../../store';
import useTranslate from '../../../../localization/useTranslate';
import { settingsHaveChangedToast } from '../../../lib/toasts';
import { validateLicense } from '../../../lib/inputSanitizer';
import useButtonKeyDown from '../../../hooks/useButtonKeyDown';

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

    const { isConnected, isLoading } = useStore();
    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onSaveModalClick = useCallback(() => {
        const tmp = validateLicense(licenseInput) ? licenseInput : '';
        setLicenseInput(tmp);
        setLicense(tmp);
        settings.set('license', tmp);
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [handleOnClose, licenseInput, setLicense, isConnected, isLoading, appLang]);

    const onSaveModalKeyDown = useButtonKeyDown(onSaveModalClick);

    const handleCancelButtonClick = useCallback(() => {
        setLicenseInput(license);
        handleOnClose();
    }, [license, handleOnClose]);

    const handleCancelButtonKeyDown = useButtonKeyDown(handleCancelButtonClick);

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
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [setLicense, isConnected, isLoading, appLang, handleOnClose]);

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
