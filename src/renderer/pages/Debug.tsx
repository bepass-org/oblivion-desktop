import { useEffect, useState } from 'react';
import classNames from 'classnames';
import Nav from '../components/Nav';
import { ipcRenderer } from '../lib/utils';

export default function Debug() {
    const [log, setLog] = useState('');

    ipcRenderer.on('log', (data) => {
        console.count('mmd_log');
        console.log('🚀 - ipcRenderer.on - data:', data);
        setLog(String(data));
    });

    useEffect(() => {
        ipcRenderer.sendMessage('log');
    }, []);

    return (
        <>
            <Nav title='لاگ برنامه' />
            <div className={classNames('myApp', 'normalPage', 'logPage')}>
                <div className='container'>
                    <div className={classNames('logOptions', log === '' ? 'hidden' : '')}>
                        <i className='material-icons'>&#xf0ff;</i>
                        <i className='material-icons'>&#xe14d;</i>
                    </div>
                    <p className={classNames(log === '' ? 'dirRight' : 'dirLeft', 'logText')}>
                        {log === ''
                            ? 'درصورت ایجاد لاگ توسط برنامه، اینجا نمایش داده می‌شود.'
                            : log}
                    </p>
                </div>
            </div>
        </>
    );
}
