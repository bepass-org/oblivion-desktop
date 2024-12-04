import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { FC, KeyboardEvent } from 'react';

interface LandingHeaderProps {
    toggleDrawer: () => void;
    hasNewUpdate: boolean;
    handleMenuOnKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

const LandingHeader: FC<LandingHeaderProps> = ({
    handleMenuOnKeyDown,
    hasNewUpdate,
    toggleDrawer
}) => {
    return (
        <nav className='header'>
            <div className='container'>
                <div
                    onClick={toggleDrawer}
                    className='navMenu'
                    role='menu'
                    aria-controls='menu'
                    tabIndex={0}
                    onKeyDown={handleMenuOnKeyDown}
                >
                    <i className={classNames('material-icons', 'pull-right')}>&#xe5d2;</i>
                    <div className={classNames('indicator', hasNewUpdate ? '' : 'hidden')} />
                </div>
                <Link to='/about' tabIndex={0} style={{ outline: 'none' }}>
                    <i className={classNames('material-icons', 'navLeft')}>&#xe88e;</i>
                </Link>
                <Link to={'/debug'} tabIndex={0} style={{ outline: 'none' }}>
                    <i className={classNames('material-icons', 'log')}>&#xe868;</i>
                </Link>
            </div>
        </nav>
    );
};
export default LandingHeader;
