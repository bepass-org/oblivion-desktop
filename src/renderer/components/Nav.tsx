import BackButton from './BackButton';
import { useEffect } from 'react';

export default function Nav({ title }: { title: string }) {

    useEffect(() => {
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    });

    const isSticky = () => {
        const header = document.querySelector('nav');
        const scrollTop = window.scrollY;
        if ( scrollTop >= 20 ) {
            header.classList.add('isSticky')
        }
        else {
            header.classList.remove('isSticky');
        }
    };

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
