import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import EndpointModal from '../../components/Modal/Endpoint';
import ProfileModal from '../../components/Modal/Profile';
import Tabs from '../../components/Tabs';
import useScanner from './useScanner';
import Dropdown from '../../components/Dropdown';

export default function Scanner() {
    const {
        onChangeRTT,
        setEndpoint,
        onChangeType,
        onClickReservedButton,
        onCloseEndpointModal,
        onKeyDownEndpoint,
        onKeyDownReservedButton,
        onOpenEndpointModal,
        appLang,
        endpoint,
        ipType,
        reserved,
        rtt,
        ipSelectorItems,
        rttSelectorItems,
        showEndpointModal,
        loading,
        profiles,
        isDefaultEndpoint,
        setProfiles,
        showProfileModal,
        onOpenProfileModal,
        onCloseProfileModal,
        onKeyDownProfile,
        countProfiles,
        proxyMode
    } = useScanner();

    if (loading) return <div className='settings' />;

    return (
        <>
            <Nav title={appLang?.settings?.scanner} />
            <EndpointModal
                endpoint={endpoint || ''}
                setEndpoint={setEndpoint}
                profiles={profiles}
                title={appLang?.modal?.endpoint_title}
                isOpen={showEndpointModal}
                onClose={onCloseEndpointModal}
            />
            <ProfileModal
                endpoint={endpoint || ''}
                profiles={profiles}
                setProfiles={setProfiles}
                title={appLang?.modal?.profile_title}
                isOpen={showProfileModal}
                onClose={onCloseProfileModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='scanner' proxyMode={proxyMode} />
                <div className='settings' role='menu'>
                    <div
                        role='button'
                        className={classNames('item')}
                        onClick={onOpenEndpointModal}
                        onKeyDown={onKeyDownEndpoint}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='endpoint'>
                            {appLang?.settings?.endpoint}
                        </label>
                        <div className='value'>
                            <span className='dirLeft' id='endpoint' tabIndex={-1}>
                                {endpoint}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.endpoint_desc}</div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item', isDefaultEndpoint ? '' : 'disabled')}
                        tabIndex={0}
                    >
                        <Dropdown
                            id='id-type-select'
                            onChange={onChangeType}
                            value={ipType || ''}
                            label={appLang?.settings?.scanner_ip_type}
                            tabIndex={0}
                            disabled={!isDefaultEndpoint}
                            items={ipSelectorItems}
                        />
                        <div className='info'>{appLang?.settings?.scanner_ip_type_desc}</div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item', isDefaultEndpoint ? '' : 'disabled')}
                    >
                        <Dropdown
                            label={appLang?.settings?.scanner_rtt}
                            id='rtt-select'
                            onChange={onChangeRTT}
                            value={rtt || ''}
                            disabled={!isDefaultEndpoint}
                            tabIndex={0}
                            items={rttSelectorItems}
                        />
                        <div className='info' role='note'>
                            {appLang?.settings?.scanner_rtt_desc}
                        </div>
                    </div>
                    <div
                        role='button'
                        className={'item'}
                        onClick={onClickReservedButton}
                        onKeyDown={onKeyDownReservedButton}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='reserved'>
                            {appLang?.settings?.scanner_reserved}
                        </label>
                        <div className='value'>
                            <div
                                tabIndex={-1}
                                id='reserved'
                                className={classNames('checkbox', reserved ? 'checked' : '')}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang?.settings?.scanner_reserved_desc}</div>
                    </div>
                </div>
                {/*<div
                    className={classNames(
                        'appToast',
                        endpoint === defaultSettings.endpoint ? 'hidden' : ''
                    )}
                >
                    <div>
                        <i className='material-icons'>&#xe0f0;</i>
                        {appLang?.settings?.scanner_alert}
                    </div>
                </div>*/}
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings'>
                    <div
                        role='button'
                        className={classNames('item')}
                        onClick={onOpenProfileModal}
                        onKeyDown={onKeyDownProfile}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='endpoint'>
                            {appLang?.settings?.profile}
                        </label>
                        <div className='value'>
                            <span className='dirLeft' id='profile' dir='auto' tabIndex={-1}>
                                {countProfiles(profiles?.length || 0)}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.profile_desc}</div>
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
