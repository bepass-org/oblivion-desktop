import useSplashScreen from './useSplashScreen';

export default function SplashScreen() {
    const { show } = useSplashScreen();
    if (!show) return;
    return (
        <div className='splashScreen'>
            <div className='splashScreenImg' />
            <div className='loading'>
                <div className='spinner' />
            </div>
        </div>
    );
}
