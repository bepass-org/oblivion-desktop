import {
    ChangeEvent,
    KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { defaultSettings } from '../../../../defaultSettings';

type EndpointModalProps = {
    isOpen: boolean;
    onClose: () => void;
    defValue: string;
    endpoint: string;
    setEndpoint: (value: string) => void;
    profiles: any;
};
const useEndpointModal = (props: EndpointModalProps) => {
    const { endpoint, isOpen, onClose, setEndpoint, defValue } = props;

    const suggestionRef = useRef<HTMLDivElement>(null);

    const [endpointInput, setEndpointInput] = useState<string>(endpoint);
    const [showModal, setShowModal] = useState<boolean>(isOpen);
    const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<string>('');
    
    const defEndpoint = {
        ipv4: [
            //'188.114.98.224:2408',
            '162.159.192.175:891',
            '162.159.192.36:908',
            '162.159.195.55:908',
            '188.114.97.159:942',
            '188.114.97.47:4233',
        ],
        ipv6: [
            '[2606:4700:d1::27d0:ac63:30e2:5dfb]:864',
            '[2606:4700:d1:0:4241:c24c:54ad:7920]:903',
            '[2606:4700:d0:0:799c:392:47ed:bf4e]:955',
        ]
    };
    const [suggestion, setSuggestion] = useState<any>(defEndpoint);

    const fetchEndpoints = async () => {
        try {
            const response = await fetch(
                'https://raw.githubusercontent.com/ircfspace/endpoint/main/ip.json'
            );
            if (response.ok) {
                const data = await response.json();
                if (data?.ipv4 && data?.ipv6) {
                    setSuggestion(data);
                }
            } else {
                setSuggestion(defEndpoint);
                console.error('Failed to fetch Endpoints:', response.statusText);
            }
        } catch (error) {
            setSuggestion(defEndpoint);
            console.error('Failed to fetch Endpoints:', error);
        }
    };

    useEffect(() => {
        settings.get('scanResult').then((value) => {
            setScanResult(typeof value === 'undefined' ? defaultSettings.scanResult : value);
        });

        fetchEndpoints();

        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestion(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const appLang = useTranslate();

    const handleOnClose = useCallback(() => {
        setShowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

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

    const onUpdateKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                onSaveModal();
            }
        },
        [onSaveModal]
    );

    const setEndpointSuggestion = useCallback((item: string) => {
        setEndpointInput(item);
    }, []);

    const setEndpointDefault = useCallback(() => {
        setEndpointInput(defValue);
    }, [defValue]);

    const handleCancelButtonClick = useCallback(() => {
        setEndpointInput(endpoint);
        handleOnClose();
    }, [endpoint, handleOnClose]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

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
        showSuggestion,
        scanResult,
        suggestionRef,
        onSaveModal,
        onUpdateKeyDown,
        setEndpointSuggestion,
        setEndpointDefault,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleEndpointInputChange,
        handleOnClose,
        setShowSuggestion
    };
};

export default useEndpointModal;
