import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import classNames from 'classnames';
import Nav from '../components/Nav';
import { ipcRenderer } from '../lib/utils';

export default function Debug() {
    const [log, setLog] = useState('');

    // asking for log every 1sec
    useEffect(() => {
        ipcRenderer.sendMessage('log');
        const intervalId = setInterval(() => {
            ipcRenderer.sendMessage('log');
        }, 1000);

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);

    ipcRenderer.on('log', (data) => {
        setLog(String(data));
    });

    const handleCopy = (e: { preventDefault: () => void }, value: any) => {
        e.preventDefault();
        navigator.clipboard.writeText(value);
        toast('کپی شد!', {
            id: 'copied',
            style: {
                fontSize: '13px',
                borderRadius: '10px',
                background: '#333',
                color: '#fff'
            },
            duration: 2000
        });
    };

    const handleClearLog = (e: { preventDefault: () => void }) => {
        e.preventDefault();
    };

    return (
        <>
            <Nav title='لاگ برنامه' />
            <div className={classNames('myApp', 'normalPage', 'logPage')}>
                <div className='container'>
                    <div className={classNames('logOptions', log === '' ? 'hidden' : '')}>
                        {/*<i
                            className='material-icons'
                            onClick={(e: any) => {
                                handleClearLog(
                                    e
                                );
                            }}
                        >&#xf0ff;</i>*/}
                        <i
                            className='material-icons'
                            onClick={(e: any) => {
                                handleCopy(e, log);
                            }}
                        >
                            &#xe14d;
                        </i>
                    </div>
                    <p className={classNames(log === '' ? 'dirRight' : 'dirLeft', 'logText')}>
                        {log === ''
                            ? 'درصورت ایجاد لاگ توسط برنامه، اینجا نمایش داده می‌شود.'
                            : log}
                    </p>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
