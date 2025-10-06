import {
    KeyboardEvent,
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { ipcRenderer, username } from '../../lib/utils';
import { defaultToast } from '../../lib/toasts';
import useTranslate from '../../../localization/useTranslate';

const useDebug = () => {
    const [log, setLog] = useState<string>('');
    const logRef = useRef<HTMLParagraphElement>(null);
    const appLang = useTranslate();

    const initAutoScroll = useMemo(
        () =>
            localStorage?.getItem('OBLIVION_SCROLLER')
                ? localStorage.getItem('OBLIVION_SCROLLER')
                : '0',
        []
    );
    const [autoScroll, setAutoScroll] = useState<boolean>(initAutoScroll === '1');

    useEffect(() => {
        const userFlag = '<USERNAME>';
        ipcRenderer.on('get-logs', (data) => {
            let logs = String(data);
            logs = logs.replaceAll(username || '', userFlag);
            logs = logs.replaceAll(/\\\\/g, '\\');
            setLog(logs);
        });

        // asking for log every 1.5sec
        ipcRenderer.sendMessage('get-logs');
        const intervalId = setInterval(() => {
            ipcRenderer.sendMessage('get-logs');
        }, 1500);

        // Cleanup
        return () => {
            ipcRenderer.removeAllListeners('get-logs');
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (autoScroll) {
            logRef?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
        localStorage.setItem('OBLIVION_SCROLLER', autoScroll ? '1' : '0');
    }, [autoScroll]);

    useEffect(() => {
        if (autoScroll) {
            logRef?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [log]);

    const handleCopy = useCallback(
        (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLDivElement>) => {
            event.preventDefault();
            navigator.clipboard.writeText(log);
            defaultToast(`${appLang?.toast?.copied}`, 'COPIED', 2000);
        },
        [appLang?.toast?.copied, log]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter') {
                handleCopy(event);
            }
        },
        [handleCopy]
    );

    const setAuthScrollEnabled = useCallback(() => setAutoScroll(true), []);

    const setAuthScrollDisabled = useCallback(() => setAutoScroll(false), []);

    const logIsEmpty = log === '';

    return {
        log,
        autoScroll,
        logRef,
        appLang,
        logIsEmpty,
        handleCopy,
        handleKeyDown,
        setAuthScrollEnabled,
        setAuthScrollDisabled
    };
};

export default useDebug;
