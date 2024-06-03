import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Drawer from 'react-modern-drawer';
import { Swipe } from 'react-swipe-component';
import appIco from '../../../../assets/oblivion.png';
import 'react-modern-drawer/dist/index.css';
import packageJsonData from '../../../../package.json';
import { cfFlag } from '../../lib/cfFlag';
import useLanding from './useLanding';

export default function Landing() {
    const {
        appLang,
        drawerIsOpen,
        ipData,
        lang,
        proxyMode,
        handleMenuOnKeyDown,
        handleOnClickIp,
        handleOnClickPing,
        handleOnSwipedLeft,
        handleOnSwipedRight,
        hasNewUpdate,
        ipInfo,
        isConnected,
        isLoading,
        onSubmit,
        ping,
        statusText,
        toggleDrawer
    } = useLanding();
    return (
        <>
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
                </div>
            </nav>
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
                        {/*<li>
                            <Link to='/speed'>
                                <i className={'material-icons'}>&#xe9e4;</i>
                                <span>{appLang?.home?.drawer_speed_test}</span>
                            </Link>
                        </li>*/}
                        <li className={hasNewUpdate ? '' : 'hidden'} role='presentation'>
                            <a
                                href='https://github.com/bepass-org/oblivion-desktop/releases/latest'
                                target='_blank'
                                rel='noreferrer'
                                role='menuitem'
                            >
                                <i className={'material-icons'}>&#xe923;</i>
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
                        v<b>{packageJsonData.version}</b>
                    </div>
                </div>
            </Drawer>
            <div className={classNames('myApp', 'verticalAlign')}>
                <div className='container'>
                    <div className='homeScreen'>
                        <div className='title'>
                            <h1>OBLIVION</h1>
                            <h2>{appLang?.home?.title_warp_based}</h2>
                        </div>
                        <form action='' onSubmit={onSubmit}>
                            <div className='connector'>
                                <Swipe
                                    nodeName='div'
                                    onSwipedLeft={handleOnSwipedLeft}
                                    onSwipedRight={handleOnSwipedRight}
                                >
                                    <button
                                        type='submit'
                                        role='switch'
                                        aria-checked={isConnected}
                                        tabIndex={0}
                                        className={classNames(
                                            'switch',
                                            isConnected ? 'active' : '',
                                            isLoading ? 'isLoading' : ''
                                        )}
                                    >
                                        <div className='circle'>
                                            <div className='spinner' />
                                        </div>
                                    </button>
                                </Swipe>
                            </div>
                        </form>
                        <div
                            className={classNames(
                                'status',
                                isConnected && !isLoading && (ipInfo?.countryCode || !ipData)
                                    ? 'active'
                                    : ''
                            )}
                        >
                            {statusText}
                        </div>
                        <div
                            className={classNames(
                                'inFoot',
                                'withIp',
                                isConnected &&
                                    !isLoading &&
                                    proxyMode !== 'none' &&
                                    proxyMode !== '' &&
                                    ipData
                                    ? 'active'
                                    : ''
                            )}
                        >
                            <div
                                role='presentation'
                                className={classNames('item', ipData ? '' : 'hidden')}
                                onClick={handleOnClickIp}
                            >
                                <img
                                    src={cfFlag(ipInfo.countryCode ? ipInfo?.countryCode : 'xx')}
                                    alt={`${ipInfo?.countryCode} Flag`}
                                />
                                <span className={ipInfo?.countryCode ? '' : 'shimmer'}>
                                    {ipInfo.ip ? ipInfo.ip : '127.0.0.1'}
                                </span>
                            </div>
                            <div
                                role='presentation'
                                className={classNames('item', 'ping')}
                                onClick={handleOnClickPing}
                            >
                                <i className='material-icons'>&#xebca;</i>
                                <span className={ping === 0 ? 'shimmer' : ''}>
                                    {ping > 0
                                        ? String(ping).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ms'
                                        : 'timeout'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
