import { KeyboardEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ipcRenderer, username } from '../../lib/utils';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { defaultToast } from '../../lib/toasts';
import useTranslate from '../../../localization/useTranslate';

const useDebug = () => {
    const [log, setLog] = useState<string>('');
    const [autoScroll, setAutoScroll] = useState<boolean>(false);
    const logRef = useRef<HTMLParagraphElement>(null);
    //const [isBottom, setIsBottom] = useState(true);
    const appLang = useTranslate();
    const navigate = useNavigate();

    useEffect(() => {
        ipcRenderer.on('tray-menu', (args: any) => {
            if (args.key === 'changePage') {
                navigate(args.msg);
            }
        });

        // asking for log every 1.5sec
        ipcRenderer.sendMessage('get-logs');
        const intervalId = setInterval(() => {
            ipcRenderer.sendMessage('get-logs');
        }, 1500);
        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (autoScroll) {
            logRef?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [autoScroll]);

    useEffect(() => {
        if (autoScroll) {
            logRef?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [log]);

    useGoBackOnEscape();

    const userFlag = '<USERNAME>';
    ipcRenderer.on('get-logs', (data) => {
        let logs = String(data);
        // protect user privacy
        // @ts-ignore
        logs = logs.replaceAll(username, userFlag);
        logs = logs.replaceAll(/\\\\/g, '\\');
        // updatedData = updatedData.replace(/([A-Z]):\\/g, '<DRIVE>:\\');
        // updatedData = updatedData.replace(/\/home\/[^\\]+\//, 'home/<USER>/');
        // updatedData = updatedData.replace(/\\www\\[^\\]+\\/, '\\www\\<DIR>\\');
        // updatedData = updatedData.replace(/\\htdocs\\[^\\]+\\/, '\\www\\<DIR>\\');
        setLog(logs);
    });

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

    // const handleClearLog = (e: { preventDefault: () => void }) => {
    //     e.preventDefault();
    //     defaultToast(`${appLang?.toast?.cleared}`, 'CLEARED', 2000);
    // };

    /*const onScroll = () => {
        const isNearBottom =
            Math.ceil(window.innerHeight + window.scrollY + 200) >=
            document.documentElement.scrollHeight;
        if (!isNearBottom) {
            setIsBottom(true);
        } else {
            setIsBottom(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);*/
    return {
        log,
        autoScroll,
        logRef,
        appLang,
        handleCopy,
        handleKeyDown,
        setAuthScrollEnabled,
        setAuthScrollDisabled
    };
};

export default useDebug;
