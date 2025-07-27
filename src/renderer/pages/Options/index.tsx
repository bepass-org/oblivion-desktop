import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import { languages } from '../../../defaultSettings';
import RestoreModal from '../../components/Modal/Restore';
import Tabs from '../../components/Tabs';
import useOptions from './useOptions';
import Dropdown from '../../components/Dropdown';
import { platform } from '../../lib/utils';
import { isAnyUndefined } from '../../lib/isAnyUndefined';

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
        onCloseRestoreModal,
        onKeyDownAutoStartButton,
        onKeyDownAutoConnectButton,
        onClickForceCloseButton,
        onKeyDownForceCloseButton,
        onKeyDownChangeTheme,
        onKeyDownRestore,
        openAtLogin,
        autoConnect,
        forceClose,
        showRestoreModal,
        setTheme,
        setLang,
        setOpenAtLogin,
        setAutoConnect,
        setForceClose,
        setShortcut,
        theme,
        proxyMode,
        onClickBetaReleaseButton,
        onKeyDownBetaReleaseButton,
        betaRelease,
        soundEffect,
        onClickSoundEffectButton,
        onKeyDownSoundEffectButton,
        startMinimized,
        setStartMinimized,
        onClickStartMinimizedButton,
        onKeyDownStartMinimizedButton
    } = useOptions();

    if (
        isAnyUndefined(
            theme,
            lang,
            openAtLogin,
            startMinimized,
            forceClose,
            soundEffect,
            autoConnect,
            betaRelease
        )
    ) {
        return <div className='settings' />;
    }

    return (
        <>
            <Nav title={appLang?.settings?.option} />
            <RestoreModal
                setTheme={setTheme}
                setForceClose={setForceClose}
                setLang={setLang}
                setOpenAtLogin={setOpenAtLogin}
                setStartMinimized={setStartMinimized}
                setAutoConnect={setAutoConnect}
                setShortcut={setShortcut}
                title={appLang?.modal?.restore_title}
                isOpen={showRestoreModal}
                onClose={onCloseRestoreModal}
            />
            <div className={classNames('myApp', 'normalPage', 'withScroll')}>
                <div className='container'>
                    <Tabs active='options' proxyMode={proxyMode} />
                    <div className='settings' role='menu'>
                        <div
                            role='button'
                            className='item'
                            onClick={onClickChangeTheme}
                            onKeyDown={onKeyDownChangeTheme}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='flexSwitchCheckChecked'>
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
                            role='button'
                            className='item'
                            onClick={onClickSoundEffectButton}
                            onKeyDown={onKeyDownSoundEffectButton}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='soundEffect'>
                                {appLang?.settings?.sound_effect}
                            </label>
                            <div className='value'>
                                <div
                                    tabIndex={-1}
                                    id='soundEffect'
                                    className={classNames('checkbox', soundEffect ? 'checked' : '')}
                                >
                                    <i className='material-icons'>&#xe876;</i>
                                </div>
                            </div>
                            <div className='info'>{appLang?.settings?.sound_effect_desc}</div>
                        </div>
                    </div>
                    <div className='moreSettings'>
                        <i className='material-icons'>&#xe313;</i>
                        {appLang?.settings?.more_duties}
                    </div>
                    <div className='settings' role='menu'>
                        <div
                            role='button'
                            className={classNames('item', platform === 'linux' ? 'disabled' : '')}
                            onClick={platform !== 'linux' ? onClickAutoStartButton : undefined}
                            onKeyDown={platform !== 'linux' ? onKeyDownAutoStartButton : undefined}
                            tabIndex={0}
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
                            role='button'
                            className={classNames('item', platform === 'darwin' ? 'disabled' : '')}
                            onClick={
                                platform !== 'darwin' ? onClickStartMinimizedButton : undefined
                            }
                            onKeyDown={
                                platform !== 'darwin' ? onKeyDownStartMinimizedButton : undefined
                            }
                            tabIndex={0}
                        >
                            <label
                                className='key'
                                htmlFor='open-login'
                                // role='label'
                            >
                                {appLang?.settings?.start_minimized}
                            </label>
                            <div className='value'>
                                <div
                                    tabIndex={-1}
                                    id='open-login'
                                    className={classNames(
                                        'checkbox',
                                        startMinimized ? 'checked' : ''
                                    )}
                                >
                                    <i className='material-icons'>&#xe876;</i>
                                </div>
                            </div>
                            <div className='info'>{appLang?.settings?.start_minimized_desc}</div>
                        </div>
                        <div
                            role='button'
                            className='item'
                            onClick={onClickAutoConnectButton}
                            onKeyDown={onKeyDownAutoConnectButton}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='auto-connect'>
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
                        <div
                            role='button'
                            className='item'
                            onClick={onClickForceCloseButton}
                            onKeyDown={onKeyDownForceCloseButton}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='force-close'>
                                {appLang?.settings?.force_close}
                            </label>
                            <div className='value'>
                                <div
                                    tabIndex={-1}
                                    id='force-close'
                                    className={classNames('checkbox', forceClose ? 'checked' : '')}
                                >
                                    <i className='material-icons'>&#xe876;</i>
                                </div>
                            </div>
                            <div className='info'>{appLang?.settings?.force_close_desc}</div>
                        </div>
                    </div>
                    <div className='moreSettings'>
                        <i className='material-icons'>&#xe313;</i>
                        {appLang?.settings?.more}
                    </div>
                    <div className='settings' role='menu'>
                        <div
                            role='button'
                            className='item'
                            onClick={onClickBetaReleaseButton}
                            onKeyDown={onKeyDownBetaReleaseButton}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='beta-release'>
                                {appLang?.settings?.beta_release}
                            </label>
                            <div className='value'>
                                <div
                                    tabIndex={-1}
                                    id='beta-release'
                                    className={classNames('checkbox', betaRelease ? 'checked' : '')}
                                >
                                    <i className='material-icons'>&#xe876;</i>
                                </div>
                            </div>
                            <div className='info'>{appLang?.settings?.beta_release_desc}</div>
                        </div>
                        <div
                            role='button'
                            className={'item'}
                            onClick={onClickRestore}
                            onKeyDown={onKeyDownRestore}
                            tabIndex={0}
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
            </div>
            <Toaster
                position='bottom-center'
                reverseOrder={false}
                containerStyle={{ bottom: '70px' }}
            />
        </>
    );
}
