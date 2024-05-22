import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { getLang } from '../lib/loaders';

export default function Tabs({ active }: { active: string }) {
    const appLang = getLang();
    return (
        <>
            <div className={classNames('tabs', 'inSettings')}>
                <ul>
                    <li className={active === 'settings' ? 'active' : ''}>
                        <Link to={'/settings'}>
                            <i className={'material-icons'}>&#xe429;</i>
                            <span>{appLang?.tabs?.warp}</span>
                        </Link>
                    </li>
                    <li className={active === 'network' ? 'active' : ''}>
                        <Link to={'/network'}>
                            <i className={'material-icons'}>&#xeb2f;</i>
                            <span>{appLang?.tabs?.network}</span>
                        </Link>
                    </li>
                    <li className={active === 'scanner' ? 'active' : ''}>
                        <Link to={'/scanner'}>
                            <i className={'material-icons'}>&#xe2db;</i>
                            <span>{appLang?.tabs?.scanner}</span>
                        </Link>
                    </li>
                    <li className={active === 'options' ? 'active' : ''}>
                        <Link to={'/options'}>
                            <i className={'material-icons'}>&#xe8b8;</i>
                            <span>{appLang?.tabs?.app}</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
}
