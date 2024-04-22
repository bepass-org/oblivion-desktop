import { useEffect } from 'react';
import BackButton from './BackButton';

export default function Nav({ title }: { title: string }) {
    const isSticky = () => {
        const header = document.querySelector('nav');
        const scrollTop = window?.scrollY;
        if (header) {
            if (scrollTop >= 20) {
                header.classList.add('isSticky');
            } else {
                header?.classList.remove('isSticky');
            }
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, []);

    return (
        <>
            <nav>
                <div className='container'>
                    <h3>{title}</h3>
                    <BackButton />
                </div>
            </nav>
        </>
    );
}
