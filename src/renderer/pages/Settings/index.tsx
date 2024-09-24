import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import Tabs from '../../components/Tabs';
import LicenseModal from '../../components/Modal/License';
import useSettings from './useSettings';
import Dropdown from '../../components/Dropdown';

export default function Settings() {
    const {
        appLang,
        license,
        location,
        method,
        methodIsGool,
        methodIsPsiphon,
        methodIsWarp,
        onChangeLocation,
        onCloseLicenseModal,
        onEnableGool,
        onEnablePsiphon,
        onEnableWarp,
        onKeyDownGool,
        onKeyDownLicense,
        onKeyDownPsiphon,
        onKeyDownWarp,
        onOpenLicenseModal,
        setLicense,
        showLicenseModal,
        loading,
        locationItems,
        proxyMode
    } = useSettings();

    if (loading) return <div className='settings' />;

    return (
        <>
            <Nav title={appLang?.settings?.title} />
            {/*<EndpointModal
                {...{
                    endpoint,
                    setEndpoint
                }}
                title={appLang?.modal?.endpoint_title}
                isOpen={showEndpointModal}
                onClose={() => {
                    setShowEndpointModal(false);
                    settingsHaveChangedToast({ ...{ isConnected, isLoading } });
                }}
            />*/}
            <LicenseModal
                license={license || ''}
                setLicense={setLicense}
                title={appLang?.modal?.license_title}
                isOpen={showLicenseModal}
                onClose={onCloseLicenseModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='settings' proxyMode={proxyMode} />
                <div className='settings' role='menu'>
                    {/*<div
                        className={'item'}
                        onClick={() => {
                            setScan(!scan);
                            settings.set('scan', !scan);
                            settingsHaveChanged();
                        }}
                    >
                        <label className='key'>اسکنر</label>
                        <div className='value'>
                            <div className={classNames('checkbox', scan ? 'checked' : '')}>
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>جستجو در IP و پورت‌های وارپ</div>
                    </div>
                    <div className='item hidden'>
                        <label className='key'>نوع IP</label>
                        <div className='value'>
                            <select
                                onChange={(e) => {
                                    setIpType(e.target.value);
                                    settings.set('ipType', e.target.value);
                                    settingsHaveChanged();
                                }}
                                value={ipType}
                            >
                                <option value=''>Automatic</option>
                                <option value='-4'>IPv4</option>
                                <option value='-6'>IPv6</option>
                            </select>
                        </div>
                        <div className='info'>برای اندپوینت تصادفی</div>
                    </div>*/}
                    <div className='grouped' role='radiogroup'>
                        <div
                            role='button'
                            className={classNames('item')}
                            onClick={onEnableWarp}
                            onKeyDown={onKeyDownWarp}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='flex-switch-check-checked'>
                                {appLang?.settings?.method_warp}
                            </label>
                            <div className='value' id='flex-switch-check-checked'>
                                <div
                                    tabIndex={-1}
                                    className={classNames('switch', methodIsWarp ? 'checked' : '')}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_warp_desc}</div>
                        </div>
                        <div
                            role='button'
                            className={classNames('item')}
                            onClick={onEnableGool}
                            onKeyDown={onKeyDownGool}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='flex-switch-check-checked-gool'>
                                {appLang?.settings?.method_gool}
                            </label>
                            <div className='value' id='flex-switch-check-checked-gool'>
                                <div
                                    tabIndex={-1}
                                    className={classNames('switch', methodIsGool ? 'checked' : '')}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_gool_desc}</div>
                        </div>
                        <div
                            role='button'
                            className={classNames('item')}
                            onClick={onEnablePsiphon}
                            onKeyDown={onKeyDownPsiphon}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='flex-switch-check-checked-psiphon'>
                                {appLang?.settings?.method_psiphon}
                            </label>
                            <div className='value' id='flex-switch-check-checked-psiphon'>
                                <div
                                    tabIndex={-1}
                                    className={classNames(
                                        'switch',
                                        methodIsPsiphon ? 'checked' : ''
                                    )}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_psiphon_desc}</div>
                        </div>
                    </div>
                    <div className={classNames('item', methodIsPsiphon ? '' : 'disabled')}>
                        <Dropdown
                            id='flex-switch-check-checked-psiphon-location'
                            onChange={onChangeLocation}
                            value={location || ''}
                            label={appLang?.settings?.method_psiphon_location}
                            tabIndex={-1}
                            disabled={method !== 'psiphon'}
                            items={locationItems}
                        />
                        <div className='info'>
                            {appLang?.settings?.method_psiphon_location_desc}
                        </div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings' role='menu' tabIndex={0}>
                    {/*<div
                        className={classNames('item')}
                        onClick={() => {
                            setShowEndpointModal(true);
                        }}
                    >
                        <label className='key'>{appLang?.settings?.endpoint}</label>
                        <div className='value'>
                            <span className='dirLeft'>{endpoint}</span>
                        </div>
                        <div className='info'>{appLang?.settings?.endpoint_desc}</div>
                    </div>*/}
                    <div
                        role='button'
                        className='item'
                        onClick={onOpenLicenseModal}
                        onKeyDown={onKeyDownLicense}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='flex-switch-check-checked-license'>
                            {appLang?.settings?.license}
                        </label>
                        <div className='value' role='link'>
                            <span
                                className='dirLeft'
                                id='flex-switch-check-checked-license'
                                tabIndex={-1}
                            >
                                {license || 'Free'}
                            </span>
                        </div>
                        <div className='info'>{appLang?.settings?.license_desc}</div>
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
