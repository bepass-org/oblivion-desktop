import { useEffect, useState } from 'react';
import { isDev } from '../lib/utils';
import AnimatedComponent from '../components/Animated';

export default function SplashScreen() {
    const [show, setShow] = useState<boolean>(true);
    useEffect(() => {
        setTimeout(
            () => {
                setShow(false);
            },
            isDev() ? 0 : 5000
        );
    }, []);

    if (!show) return;
    return (
        <AnimatedComponent>
            <div className='splashScreen'>
                <div className='splashScreenImg' />
                <div className='loading'>
                    <div className='spinner' />
                </div>
            </div>
        </AnimatedComponent>
    );
}
