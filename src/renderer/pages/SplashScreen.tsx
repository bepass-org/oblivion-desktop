import { useEffect, useState } from 'react';

export default function SplashScreen() {
    const [show, setShow] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setShow(false);
        }, 5000);
    }, []);

    if (!show) return <></>;
    return <div>SplashScreen</div>;
}
