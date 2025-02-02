import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import { useStore } from '../../../store';
import useTranslate from '../../../../localization/useTranslate';
import { settingsHaveChangedToast } from '../../../lib/toasts';
import { validateTestUrl } from '../../../lib/inputSanitizer';

interface TestUrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    testUrl: string;
    setTestUrl: (value: string) => void;
}

const useTestUrlModal = (props: TestUrlModalProps) => {
    const { isOpen, testUrl, onClose, setTestUrl } = props;
    const [testUrlInput, setTestUrlInput] = useState<string>(testUrl);
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const { isConnected, isLoading } = useStore();
    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onSaveModalClick = useCallback(() => {
        const tmp = validateTestUrl(testUrlInput);
        setTestUrlInput(tmp);
        setTestUrl(tmp);
        settings.set('testUrl', tmp);
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [handleOnClose, testUrlInput, setTestUrl, isConnected, isLoading, appLang]);

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
        setTestUrlInput(testUrl);
        handleOnClose();
    }, [testUrl, handleOnClose]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

    const handleTestUrlInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setTestUrlInput(e.target.value.trim());
        },
        [setTestUrlInput]
    );

    /*const handleClearTestUrlInput = useCallback(() => {
        setTestUrlInput('');
        setTestUrl('');
        settings.set('testUrl', '');
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [setTestUrl, isConnected, isLoading, appLang, handleOnClose]);*/

    return {
        appLang,
        handleCancelButtonClick,
        handleTestUrlInputChange,
        handleOnClose,
        testUrlInput,
        onSaveModalClick,
        showModal,
        handleCancelButtonKeyDown,
        onSaveModalKeyDown,
        setTestUrlInput
    };
};

export default useTestUrlModal;
