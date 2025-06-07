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
import { useStore } from '../../../store';
import useTranslate from '../../../../localization/useTranslate';
import { loadingToast, settingsHaveChangedToast, stopLoadingToast } from '../../../lib/toasts';
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
    const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const updaterRef = useRef<HTMLDivElement>(null);

    useEffect(() => setShowModal(isOpen), [isOpen]);

    const { isConnected, isLoading } = useStore();
    const appLang = useTranslate();

    useEffect(() => {
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

    const initSuggestion = useMemo(() => {
        const storedSuggestion = localStorage?.getItem('OBLIVION_TEST_URL');
        const data = storedSuggestion ? JSON.parse(storedSuggestion) : JSON.parse('[]');
        return data;
    }, []);

    const [suggestion, setSuggestion] = useState<any>(initSuggestion);

    const fetchTestUrl = async (openInEnd: boolean = true) => {
        loadingToast(appLang?.toast?.please_wait);
        try {
            const response = await fetch(
                'https://raw.githubusercontent.com/ircfspace/testUrl/refs/heads/main/url.json'
            );
            if (response.ok) {
                const data = await response.json();
                if (data?.length > 0) {
                    setSuggestion(data);
                    localStorage.setItem('OBLIVION_TEST_URL', JSON.stringify(data));
                }
            } else {
                console.error('Failed to fetch TestUrl:', response.statusText);
            }
        } catch (error) {
            console.log('Failed to fetch TestUrl:', error);
        } finally {
            if (openInEnd) {
                setTimeout(() => {
                    setShowSuggestion(true);
                }, 1000);
            }
            updaterRef.current?.classList.add('hidden');
            stopLoadingToast();
        }
    };

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
        setTestUrlInput,
        showSuggestion,
        suggestionRef,
        setShowSuggestion,
        fetchTestUrl,
        updaterRef,
        suggestion
    };
};

export default useTestUrlModal;
