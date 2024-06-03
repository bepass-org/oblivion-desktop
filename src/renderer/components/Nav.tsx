import { FC, useCallback, useEffect } from 'react';
import BackButton from './BackButton';

interface NavProps {
    title: string;
}

const Nav: FC<NavProps> = ({ title }) => {
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

    return (
        <nav className='header'>
            <div className='container'>
                <h3
                // role='heading'
                >
                    {title}
                </h3>
                <BackButton />
            </div>
        </nav>
    );
};

export default Nav;
