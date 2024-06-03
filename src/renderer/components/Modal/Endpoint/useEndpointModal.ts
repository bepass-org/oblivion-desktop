import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { getLang } from '../../../lib/loaders';
import { settings } from '../../../lib/settings';

type EndpointModalProps = {
    isOpen: boolean;
    onClose: () => void;
    defValue: string;
    endpoint: string;
    setEndpoint: (value: string) => void;
};
const useEndpointModal = (props: EndpointModalProps) => {
    const { endpoint, isOpen, onClose, setEndpoint, defValue } = props;

    const [endpointInput, setEndpointInput] = useState<string>(endpoint);
    const [showModal, setShowModal] = useState<boolean>(isOpen);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = getLang();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const suggestion = useMemo(() => ['188.114.98.224:2408', '162.159.192.175:891'], []);

    const onSaveModal = useCallback(() => {
        const endpointInputModified = endpointInput.replace(/^https?:\/\//, '').replace(/\/$/, '');
        let regex = /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?::\d{1,5})$/;
        if (endpointInput.startsWith('[')) {
            regex =
                /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))/;
        }
        const tmp = regex.test(endpointInputModified) ? endpointInputModified : defValue;
        setEndpointInput(tmp);
        setEndpoint(tmp);
        settings.set('endpoint', tmp);
        handleOnClose();
    }, [defValue, endpointInput, handleOnClose, setEndpoint]);

    const setEndpointSuggestion = useCallback(
        (item: number) => {
            if (typeof item === 'undefined' || !item) {
                item = 0;
            }
            setEndpointInput(suggestion[item]);
        },
        [suggestion]
    );

    const setEndpointDefault = useCallback(() => {
        setEndpointInput(defValue);
    }, [defValue]);

    const handleCancelButtonClick = useCallback(() => {
        setEndpointInput(endpoint);
        handleOnClose();
    }, [endpoint, handleOnClose]);

    const handleEndpointInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setEndpointInput(e.target.value.toLowerCase().trim());
        },
        [setEndpointInput]
    );

    return {
        endpointInput,
        showModal,
        appLang,
        suggestion,
        onSaveModal,
        setEndpointSuggestion,
        setEndpointDefault,
        handleCancelButtonClick,
        handleEndpointInputChange,
        handleOnClose
    };
};

export default useEndpointModal;
