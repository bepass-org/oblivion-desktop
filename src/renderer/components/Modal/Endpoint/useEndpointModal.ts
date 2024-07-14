import {
    ChangeEvent,
    KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
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

    useEffect(() => {
        settings.get('scanResult').then((value) => {
            setScanResult(typeof value === 'undefined' ? defaultSettings.scanResult : value);
        });

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

    const suggestion = useMemo(
        () => ({
            ipv4: [
                '188.114.98.224:2408',
                '162.159.192.175:891',
                '162.159.192.36:908',
                '162.159.195.55:908',
                '188.114.97.159:942',
                '188.114.97.47:4233',
                '162.159.195.149:5279',
                '162.159.192.173:7559',
                '188.114.96.78:878',
                '162.159.192.106:890',
                '188.114.98.138:7103'
            ],
            ipv6: [
                '[2606:4700:d1::c993:5abb:1a22:99d9]:1002',
                '[2606:4700:d0::52be:e711:53f6:a475]:4198',
                '[2606:4700:d0::122b:2a97:9042:aa01]:4198',
                '[2606:4700:d0::679e:04c8:97ab:cdd7]:1014',
                '[2606:4700:d1::8765:7151:9816:d51f]:1014'
            ]
        }),
        []
    );

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
