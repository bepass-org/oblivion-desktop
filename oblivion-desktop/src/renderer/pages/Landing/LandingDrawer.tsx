import { FC } from 'react';
import { Link } from 'react-router-dom';

import Drawer from 'react-modern-drawer';
import appIco from '../../../../assets/oblivion.png';
import { Language } from '../../../localization/type';

interface LandingDrawerProps {
    appLang: Language;
    drawerIsOpen: boolean;
    lang?: string;
    hasNewUpdate: boolean;
    toggleDrawer: () => void;
    appVersion: string;
    proxyMode: string;
    betaRelease: boolean;
}

const LandingDrawer: FC<LandingDrawerProps> = ({
    appLang,
    drawerIsOpen,
    hasNewUpdate,
    lang,
    toggleDrawer,
    appVersion,
    proxyMode,
    betaRelease
}) => {
    return (
        <Drawer
            open={drawerIsOpen}
            onClose={toggleDrawer}
            lockBackgroundScroll={false}
            overlayOpacity={1}
            duration={250}
            direction={lang === 'fa' ? 'right' : 'left'}
            className='drawer'
            overlayClassName='drawerOverlay'
            size='80vw'
        >
            <div className='list'>
                <div className='appName' role='main'>
                    <img src={appIco} alt='Oblivion Logo' />
                    <h3>
                        Oblivion <small>Desktop</small>
                    </h3>
                </div>
                <ul role='menu' aria-labelledby='menubutton'>
                    <li role='presentation'>
                        <Link to={'/settings'} role='menuitem'>
                            <i className={'material-icons'}>&#xe429;</i>
                            <span>{appLang?.home?.drawer_settings_warp}</span>
                        </Link>
                    </li>
                    {/*<li>
                <Link to={'/routing'}>
                    <i className={'material-icons'}>&#xe90e;</i>
                    <span>{appLang?.home?.drawer_settings_routing_rules}</span>
                </Link>
            </li>*/}
                    {/*<li className='divider'></li>*/}
                    <li role='presentation'>
                        <Link to={'/network'} role='menuitem'>
                            <i className={'material-icons'}>&#xeb2f;</i>
                            <span>{appLang?.home?.drawer_settings_network}</span>
                        </Link>
                    </li>
                    {proxyMode === 'tun' && (
                        <>
                            <li role='presentation'>
                                <Link to={'/singBox'} role='menuitem'>
                                    <i className={'material-icons'}>&#xea25;</i>
                                    <span>{appLang?.home?.drawer_singbox}</span>
                                </Link>
                            </li>
                        </>
                    )}
                    <li role='presentation'>
                        <Link to={'/scanner'} role='menuitem'>
                            <i className={'material-icons'}>&#xe2db;</i>
                            <span>{appLang?.home?.drawer_settings_scanner}</span>
                        </Link>
                    </li>
                    <li role='presentation'>
                        <Link to={'/options'} role='menuitem'>
                            <i className={'material-icons'}>&#xe8b8;</i>
                            <span>{appLang?.home?.drawer_settings_app}</span>
                        </Link>
                    </li>
                    <li className='divider' />
                    <li className={hasNewUpdate ? '' : 'hidden'} role='presentation'>
                        <a
                            href={`https://github.com/bepass-org/oblivion-desktop/releases${betaRelease ? '' : '/latest'}#download`}
                            target='_blank'
                            rel='noreferrer'
                            role='menuitem'
                        >
                            <i className='material-icons'>&#xe923;</i>
                            <span>{appLang?.home?.drawer_update}</span>
                            <div className='label label-warning label-xs'>
                                {appLang?.home?.drawer_update_label}
                            </div>
                        </a>
                    </li>
                    {/*<li>
                        <a
                            onClick={() => {
                                navigate('/options', { state: { targetId: 'languages' } });
                            }}
                        >
                            <i className='material-icons'>&#xe8e2;</i>
                            <span>{appLang?.home?.drawer_lang}</span>
                        </a>
                    </li>*/}
                    <li role='presentation'>
                        <Link to='/speed' role='menuitem'>
                            <i className={'material-icons'}>&#xe9e4;</i>
                            <span>{appLang?.speedTest?.title}</span>
                        </Link>
                    </li>
                    <li role='presentation'>
                        <Link to='/about' role='menuitem'>
                            <i className={'material-icons'}>&#xe88e;</i>
                            <span>{appLang?.home?.drawer_about}</span>
                        </Link>
                    </li>
                    <li role='presentation'>
                        <Link to={'/debug'} role='menuitem'>
                            <i className={'material-icons'}>&#xe868;</i>
                            <span>{appLang?.home?.drawer_log}</span>
                        </Link>
                    </li>
                </ul>
                <div className='appVersion' role='note'>
                    v<b>{appVersion}</b>
                </div>
            </div>
        </Drawer>
    );
};
export default LandingDrawer;
