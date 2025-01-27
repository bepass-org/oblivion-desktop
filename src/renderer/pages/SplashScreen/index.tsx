import useSplashScreen from './useSplashScreen';

export default function SplashScreen() {
    const { show } = useSplashScreen();
    if (!show) return;
    return (
        <div className='splashScreen'>
            <div className='splashScreenImg' />
            <div className='loading'>
                <svg
                    width='80px'
                    height='60px'
                    viewBox='0 0 187.3 93.7'
                    preserveAspectRatio='xMidYMid meet'
                >
                    <path
                        fill='none'
                        stroke-width='5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-miterlimit='10'
                        d='M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 				c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z'
                    />
                    <path
                        fill='none'
                        stroke-width='5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                        stroke-miterlimit='10'
                        d='M93.9,46.4c9.3,9.5,13.8,17.9,23.5,17.9s17.5-7.8,17.5-17.5s-7.8-17.6-17.5-17.5c-9.7,0.1-13.3,7.2-22.1,17.1 				c-8.9,8.8-15.7,17.9-25.4,17.9s-17.5-7.8-17.5-17.5s7.8-17.5,17.5-17.5S86.2,38.6,93.9,46.4z'
                    />
                </svg>
            </div>
        </div>
    );
}
