import classNames from 'classnames';
import { Link } from 'react-router';
import useTranslate from '../../localization/useTranslate';

interface TabsProps {
    active: string;
    proxyMode: string;
}

export default function Tabs({ active, proxyMode }: TabsProps) {
    const appLang = useTranslate();
    return (
        <div
            className={classNames(
                'tabs',
                active !== 'landing' ? 'inSettings' : 'inHome',
                proxyMode === 'tun' ? 'withSingbox' : ''
            )}
        >
            <ul role='menubar' aria-orientation='horizontal'>
                <li className={active === 'landing' ? 'active' : ''}>
                    <Link to={'/'} role='tab'>
                        <i className={'material-icons'}>&#xe9f6;</i>
                        <span>{appLang?.tabs?.home}</span>
                    </Link>
                </li>
                <li className={active === 'settings' ? 'active' : ''}>
                    <Link to={'/settings'} role='tab'>
                        <i className={'material-icons'}>&#xe429;</i>
                        <span>{appLang?.tabs?.warp}</span>
                    </Link>
                </li>
                <li className={active === 'network' ? 'active' : ''}>
                    <Link to={'/network'} role='tab'>
                        <i className={'material-icons'}>&#xeb2f;</i>
                        <span>{appLang?.tabs?.network}</span>
                    </Link>
                </li>
                {proxyMode === 'tun' && (
                    <>
                        <li className={active === 'singbox' ? 'active' : ''}>
                            <Link to={'/singbox'} role='tab'>
                                <i className={'material-icons'}>&#xea25;</i>
                                <span data-item='sb'>{appLang?.tabs?.singbox}</span>
                            </Link>
                        </li>
                    </>
                )}
                <li className={active === 'scanner' ? 'active' : ''}>
                    <Link to={'/scanner'} role='tab'>
                        <i className={'material-icons'}>&#xe2db;</i>
                        <span>{appLang?.tabs?.scanner}</span>
                    </Link>
                </li>
                <li className={active === 'options' ? 'active' : ''}>
                    <Link to={'/options'} role='tab'>
                        <i className={'material-icons'}>&#xe8b8;</i>
                        <span>{appLang?.tabs?.app}</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
