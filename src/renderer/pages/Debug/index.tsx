import { Toaster } from 'react-hot-toast';
import classNames from 'classnames';
import Nav from '../../components/Nav';
import useDebug from './useDebug';

export default function Debug() {
    const {
        appLang,
        autoScroll,
        handleCopy,
        handleKeyDown,
        log,
        logRef,
        logIsEmpty,
        setAuthScrollDisabled,
        setAuthScrollEnabled
    } = useDebug();
    return (
        <>
            <Nav title={appLang?.log?.title} />
            <div className={classNames('myApp', 'normalPage', 'logPage')}>
                <div className='container'>
                    <div
                        className={classNames('logOptions', logIsEmpty ? 'hidden' : '')}
                        role='menubar'
                    >
                        {log?.length > 1000 &&
                            (autoScroll ? (
                                <div
                                    onClick={setAuthScrollDisabled}
                                    role='presentation'
                                    tabIndex={-1}
                                >
                                    <i className='material-icons' role='link'>
                                        &#xe1a2;
                                    </i>
                                </div>
                            ) : (
                                <div
                                    role='presentation'
                                    onClick={setAuthScrollEnabled}
                                    tabIndex={-1}
                                >
                                    <i className='material-icons' role='link'>
                                        &#xe038;
                                    </i>
                                </div>
                            ))}
                        <div
                            role='button'
                            onClick={handleCopy}
                            onKeyDown={handleKeyDown}
                            tabIndex={0}
                        >
                            <i className='material-icons' role='link'>
                                &#xe14d;
                            </i>
                        </div>
                    </div>
                    <p
                        className={classNames(logIsEmpty ? 'dirRight' : 'dirLeft', 'logText')}
                        ref={logRef}
                        role='log'
                        aria-live='assertive'
                    >
                        {logIsEmpty ? appLang?.log?.desc : log}
                    </p>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
