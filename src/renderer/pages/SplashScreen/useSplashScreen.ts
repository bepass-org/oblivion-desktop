import { useEffect, useState } from 'react';
import { isDev } from '../../lib/utils';

const useSplashScreen = () => {
    const [show, setShow] = useState<boolean>(true);
    useEffect(() => {
        setTimeout(
            () => {
                setShow(false);
                localStorage.setItem('OBLIVION_NEWUPDATE', 'false');
            },
            isDev() ? 0 : 5000
        );
    }, []);

    return {
        show
    };
};
export default useSplashScreen;
