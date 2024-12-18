import { useCallback, useEffect } from 'react';
import { ipcRenderer } from '../../lib/utils';

const useNav = () => {
    const isSticky = useCallback(() => {
        const header = document.querySelector('nav');
        const scrollTop = window?.scrollY;
        if (header) {
            if (scrollTop >= 20) {
                header.classList.add('isSticky');
            } else {
                header?.classList.remove('isSticky');
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, [isSticky]);

    useEffect(() => {
        //ipcRenderer.clean();
    }, []);

};
export default useNav;
