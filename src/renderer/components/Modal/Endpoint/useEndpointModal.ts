import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../../store';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { defaultSettings } from '../../../../defaultSettings';
import { loadingToast, settingsHaveChangedToast, stopLoadingToast } from '../../../lib/toasts';
import { Profile } from '../../../pages/Scanner/useScanner';
import useButtonKeyDown from '../../../hooks/useButtonKeyDown';
import { withDefault } from '../../../lib/withDefault';

type EndpointModalProps = {
    isOpen: boolean;
    onClose: () => void;
    defValue: string;
    endpoint: string;
    setEndpoint: (value: string) => void;
    profiles: Profile[];
};

type Method = keyof Suggestion;
type Suggestion = {
    warp: { ipv4: string[]; ipv6: string[] };
    masque: { ipv4: string[]; ipv6: string[] };
};

const useEndpointModal = (props: EndpointModalProps) => {
    const { isConnected, isLoading } = useStore();
    const appLang = useTranslate();
    const { endpoint, isOpen, onClose, setEndpoint, defValue } = props;
    const suggestionRef = useRef<HTMLDivElement>(null);
    const updaterRef = useRef<HTMLDivElement>(null);
    const [endpointInput, setEndpointInput] = useState<string>(endpoint);
    const [showModal, setShowModal] = useState<boolean>(isOpen);
    const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<string>('');
    const [method, setMethod] = useState<Method>('warp');

    const removeDuplicates = (endpoints: Suggestion): Suggestion => {
        return {
            warp: {
                ipv4: Array.from(new Set(endpoints.warp?.ipv4 ?? [])),
                ipv6: Array.from(new Set(endpoints.warp?.ipv6 ?? []))
            },
            masque: {
                ipv4: Array.from(new Set(endpoints.masque?.ipv4 ?? [])),
                ipv6: Array.from(new Set(endpoints.masque?.ipv6 ?? []))
            }
        };
    };

    const defEndpoint = {
        warp: {
            ipv4: [
                '162.159.195.1:500',
                '162.159.195.1:1701',
                '162.159.195.1:2408',
                '162.159.195.1:4500',
                '162.159.193.3:500',
                '162.159.193.3:1701',
                '162.159.193.3:2408',
                '162.159.193.3:4500',
                '162.159.192.1:500',
                '162.159.192.1:1701',
                '162.159.192.1:2408',
                '162.159.192.1:4500'
            ],
            ipv6: [
                '[2606:4700:d0::a29f:c001]:500',
                '[2606:4700:d0::a29f:c001]:1701',
                '[2606:4700:d0::a29f:c001]:4500',
                '[2606:4700:d0::a29f:c001]:2408'
            ]
        },
        masque: {
            ipv4: ['162.159.198.1:443', '162.159.198.2:443'],
            ipv6: ['2606:4700:103::1', '2606:4700:103::2']
        }
    };
    const initSuggestion: Suggestion = useMemo(() => {
        const storedSuggestion = localStorage?.getItem('OBLIVION_SUGGESTION');
        let data: Suggestion = storedSuggestion ? JSON.parse(storedSuggestion) : defEndpoint;
        return removeDuplicates(data);
    }, []);

    const [suggestion, setSuggestion] = useState<Suggestion>(initSuggestion);

    const fetchEndpoints = async (openInEnd: boolean = true) => {
        loadingToast(appLang?.toast?.please_wait);
        try {
            const response = await fetch(
                'https://api.github.com/repos/ircfspace/endpoint/contents/v2.json',
                {
                    headers: {
                        accept: 'application/vnd.github.raw+json'
                    }
                }
            );
            if (!response.ok) {
                console.error('Failed to fetch Endpoints:', response.statusText);
                return;
            }
            const data = await response.json();
            const normalized: Suggestion = {
                warp: {
                    ipv4: Array.from(new Set(data.warp?.ipv4 ?? [])),
                    ipv6: Array.from(new Set(data.warp?.ipv6 ?? []))
                },
                masque: {
                    ipv4: Array.from(new Set(data.masque?.ipv4 ?? [])),
                    ipv6: Array.from(new Set(data.masque?.ipv6 ?? []))
                }
            };
            setSuggestion(normalized);
            try {
                localStorage.setItem('OBLIVION_SUGGESTION', JSON.stringify(normalized));
                console.log('Saved to localStorage');
            } catch (e) {
                console.error('Failed to save localStorage', e);
            }
        } catch (error) {
            console.log('Fetch error:', error);
        } finally {
            if (openInEnd) setTimeout(() => setShowSuggestion(true), 1000);
            updaterRef.current?.classList.add('hidden');
            stopLoadingToast();
        }
    };

    useEffect(() => {
        settings.get('scanResult').then((value) => {
            setScanResult(withDefault(value, defaultSettings.scanResult));
        });

        settings.get('method').then((value) => {
            const checkMethod = withDefault(value, defaultSettings.method);
            setMethod(checkMethod === 'masque' ? 'masque' : 'warp');
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

    useEffect(() => {
        setShowModal(isOpen);

        if (!isOpen) return;
        if (suggestion[method]?.ipv4?.length === defEndpoint[method]?.ipv4?.length) {
            fetchEndpoints(false);
        }
    }, [isOpen]);

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
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [endpointInput, defValue, setEndpoint, isConnected, isLoading, appLang, handleOnClose]);

    const onUpdateKeyDown = useButtonKeyDown(onSaveModal);

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

    const handleCancelButtonKeyDown = useButtonKeyDown(handleCancelButtonClick);

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
        setShowSuggestion,
        fetchEndpoints,
        updaterRef,
        method
    };
};

export default useEndpointModal;
