import { FC } from 'react';
import BackButton from '../BackButton';
import useNav from './useNav';

interface NavProps {
    title: string;
}

const Nav: FC<NavProps> = ({ title }) => {
    useNav();

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
