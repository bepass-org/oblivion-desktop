import classNames from 'classnames';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import { languages } from '../../../defaultSettings';
import LottieFile from '../../../../assets/json/1713988096625.json';
import RestoreModal from '../../components/Modal/Restore';
import Tabs from '../../components/Tabs';
import useOptions from './useOptions';
import Dropdown from '../../components/Dropdown';

export default function Options() {
    const {
        appLang,
        lang,
        langRef,
        onChangeLanguage,
        onClickAutoStartButton,
        onClickAutoConnectButton,
        onClickChangeTheme,
        onClickRestore,
        // onClickSystemTrayButton,
        onCloseRestoreModal,
        onKeyDownAutoStartButton,
        onKeyDownAutoConnectButton,
        onKeyDownChangeTheme,
        onKeyDownRestore,
        // onKeyDownSystemTrayButton,
        openAtLogin,
        autoConnect,
        showRestoreModal,
        setTheme,
        setSystemTray,
        setLang,
        setOpenAtLogin,
        setAutoConnect,
        systemTray,
        theme
    } = useOptions();

    if (
        typeof theme === 'undefined' ||
        typeof lang === 'undefined' ||
        typeof systemTray === 'undefined' ||
        typeof openAtLogin === 'undefined' ||
        typeof autoConnect === 'undefined'
    )
        return (
            <div className='settings'>
                <div className='lottie'>
                    <Lottie animationData={LottieFile} loop={true} />
                </div>
            </div>
        );

    return (
        <>
            <Nav title={appLang?.settings?.option} />
            <RestoreModal
                {...{
                    setTheme,
                    setSystemTray,
                    setLang,
                    setOpenAtLogin,
                    setAutoConnect
                }}
                title={appLang?.modal?.restore_title}
                isOpen={showRestoreModal}
                onClose={onCloseRestoreModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='options' />
                <div className='settings' role='menu'>
                    <div
                        role='presentation'
                        className='item'
                        onClick={onClickChangeTheme}
                        onKeyDown={onKeyDownChangeTheme}
                    >
                        <label
                            className='key'
                            htmlFor='flexSwitchCheckChecked'
                            // role='label'
                        >
                            {appLang?.settings?.dark_mode}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                className={classNames(
                                    'checkbox',
                                    theme === 'dark' ? 'checked' : ''
                                )}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info' id='flexSwitchCheckChecked'>
                            {appLang?.settings?.dark_mode_desc}
                        </div>
                    </div>
                    <div className='item' role='presentation' ref={langRef}>
                        <Dropdown
                            id='lang-select'
                            onChange={onChangeLanguage}
                            value={lang}
                            label={appLang?.settings?.lang}
                            tabIndex={0}
                            items={languages}
                        />
                        <div className='info'>{appLang?.settings?.lang_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className='item'
                        onClick={onClickAutoStartButton}
                        onKeyDown={onKeyDownAutoStartButton}
                    >
                        <label
                            className='key'
                            htmlFor='open-login'
                            // role='label'
                        >
                            {appLang?.settings?.open_login}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                id='open-login'
                                className={classNames('checkbox', openAtLogin ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.open_login_desc}</div>
                    </div>
                    <div
                        role='presentation'
                        className='item'
                        onClick={onClickAutoConnectButton}
                        onKeyDown={onKeyDownAutoConnectButton}
                    >
                        <label
                            className='key'
                            htmlFor='auto-connect'
                            // role='label'
                        >
                            {appLang?.settings?.auto_connect}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                id='auto-connect'
                                className={classNames('checkbox', autoConnect ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.auto_connect_desc}</div>
                    </div>
                    {/*<div
                        role='presentation'
                        className='item'
                        onClick={onClickSystemTrayButton}
                        onKeyDown={onKeyDownSystemTrayButton}
                    >
                        <label
                            className='key'
                            htmlFor='system-tray'
                            // role='label'
                        >
                            {appLang?.settings?.system_tray}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                id='system-tray'
                                className={classNames('checkbox', systemTray ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.system_tray_desc}</div>
                    </div>*/}
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings' role='menu'>
                    <div
                        role='presentation'
                        className={'item'}
                        onClick={onClickRestore}
                        onKeyDown={onKeyDownRestore}
                    >
                        <label
                            className='key'
                            htmlFor='restore'
                            // role='label'
                        >
                            {appLang?.settings?.restore}
                        </label>
                        <div className='value' id='restore' tabIndex={-1}>
                            <i className='material-icons'>&#xe8ba;</i>
                        </div>
                        <div className='info'>{appLang?.settings?.restore_desc}</div>
                    </div>
                </div>
            </div>
            <Toaster
                position='bottom-center'
                reverseOrder={false}
                containerStyle={{ bottom: '70px' }}
            />
        </>
    );
}
