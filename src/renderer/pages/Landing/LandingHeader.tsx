import { FC, KeyboardEvent, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { saveConfig } from '../../lib/inputSanitizer';
import { Language } from '../../../localization/type';

interface LandingHeaderProps {
    toggleDrawer: () => void;
    hasNewUpdate: boolean;
    handleMenuOnKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
    isConnected: boolean;
    isLoading: boolean;
    appLang: Language;
}

const LandingHeader: FC<LandingHeaderProps> = ({
    handleMenuOnKeyDown,
    hasNewUpdate,
    toggleDrawer,
    isConnected,
    isLoading,
    appLang
}) => {
    const [showPasteOption, setShowPasteOption] = useState(false);
    const [clipboardContent, setClipboardContent] = useState<string | null>(null);

    const checkClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text.toLowerCase().startsWith('oblivion://')) {
                setShowPasteOption(true);
                setClipboardContent(text);
            } else {
                setShowPasteOption(false);
            }
        } catch (err) {
            //console.error('Error reading clipboard:', err);
        }
    };

    useEffect(() => {
        const handleFocus = () => {
            checkClipboard();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleIconClick = () => {
        if (clipboardContent) {
            //alert(clipboardContent);
            saveConfig(clipboardContent, isConnected, isLoading, appLang);
            setShowPasteOption(false);
        }
    };

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
                <Link to='/about' tabIndex={0}>
                    <i className={classNames('material-icons', 'navLeft')}>&#xe88e;</i>
                </Link>
                <Link to={'/debug'} tabIndex={0}>
                    <i className={classNames('material-icons', 'log')}>&#xe868;</i>
                </Link>
                {showPasteOption && (
                    <div onClick={handleIconClick}>
                        <i className={classNames('material-icons', 'navPaste')}>&#xea8e;</i>
                    </div>
                )}
            </div>
        </nav>
    );
};
export default LandingHeader;
