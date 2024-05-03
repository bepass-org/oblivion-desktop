import { useEffect, useState } from 'react';
import { isDev } from '../lib/utils';

export default function SplashScreen() {
    const [show, setShow] = useState(true);
    useEffect(() => {
        setTimeout(
            () => {
                setShow(false);
            },
            isDev() ? 0 : 5000
        );
    }, []);

    if (!show) return <></>;
    return (
        <>
            <div className='splashScreen'>
                <div className='splashScreenImg' />
                <div className='loading'>
                    <div className='spinner' />
                </div>
            </div>
        </>
    );
}
