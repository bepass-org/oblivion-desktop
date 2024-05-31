import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import classNames from 'classnames';
import Nav from '../components/Nav';
import { ipcRenderer, username } from '../lib/utils';
import { defaultToast } from '../lib/toasts';
import { getLang } from '../lib/loaders';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';

export default function Debug() {
    const [log, setLog] = useState<string>('');
    const [autoScroll, setAutoScroll] = useState<boolean>(false);
    const logRef = useRef<HTMLParagraphElement>(null);
    //const [isBottom, setIsBottom] = useState(true);
    const appLang = getLang();

    // asking for log every 1.5sec
    useEffect(() => {
        ipcRenderer.sendMessage('getLogs');
        const intervalId = setInterval(() => {
            ipcRenderer.sendMessage('getLogs');
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
    ipcRenderer.on('getLogs', (data) => {
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
        (e: MouseEvent<HTMLElement>, value: string) => {
            e.preventDefault();
            navigator.clipboard.writeText(value);
            defaultToast(`${appLang?.toast?.copied}`, 'COPIED', 2000);
        },
        [appLang?.toast?.copied]
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

    return (
        <>
            <Nav title={appLang?.log?.title} />
            <div className={classNames('myApp', 'normalPage', 'logPage')}>
                <div className='container'>
                    <div className={classNames('logOptions', log === '' ? 'hidden' : '')} role='menubar'>
                        {/*<i
                            className='material-icons'
                            onClick={(e: any) => {
                                handleClearLog(
                                    e
                                );
                            }}
                        >&#xf0ff;</i>*/}
                        {log?.length > 1000 && (
                            <>
                                {autoScroll ? (
                                    <>
                                        <i
                                            className='material-icons'
                                            onClick={setAuthScrollDisabled}
                                            role='link'
                                        >
                                            &#xe1a2;
                                        </i>
                                    </>
                                ) : (
                                    <>
                                        <i
                                            className='material-icons'
                                            onClick={setAuthScrollEnabled}
                                            role='link'
                                        >
                                            &#xe038;
                                        </i>
                                    </>
                                )}
                                {/*{isBottom ? (
                                    <>
                                        <i
                                            className='material-icons'
                                            onClick={() => {
                                                logRef?.current?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'end'
                                                });
                                            }}
                                        >
                                            &#xeb53;
                                        </i>
                                    </>
                                ) : (
                                    <>
                                        <i
                                            className='material-icons'
                                            onClick={() => {
                                                logRef?.current?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'start'
                                                });
                                            }}
                                        >
                                            &#xeb2e;
                                        </i>
                                    </>
                                )}*/}
                            </>
                        )}
                        <i
                            className='material-icons'
                            role='link'
                            onClick={(e) => {
                                handleCopy(e, log);
                            }}
                        >
                            &#xe14d;
                        </i>
                    </div>
                    <p
                        className={classNames(log === '' ? 'dirRight' : 'dirLeft', 'logText')}
                        ref={logRef}
                        role='log'
                        aria-live='assertive'
                    >
                        {log === '' ? appLang?.log?.desc : log}
                    </p>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
