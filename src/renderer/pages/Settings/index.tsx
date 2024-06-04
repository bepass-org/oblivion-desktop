import classNames from 'classnames';
import Lottie from 'lottie-react';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import Tabs from '../../components/Tabs';
import LicenseModal from '../../components/Modal/License';
import { countries } from '../../../defaultSettings';
import LottieFile from '../../../../assets/json/1713988096625.json';
import useSettings from './useSettings';
import Dropdown from '../../components/Dropdown';

export default function Settings() {
    const {
        appLang,
        license,
        location,
        method,
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
        showLicenseModal
    } = useSettings();
    if (
        typeof location === 'undefined' ||
        typeof license === 'undefined' ||
        typeof method === 'undefined'
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
                license={license}
                setLicense={setLicense}
                title={appLang?.modal?.license_title}
                isOpen={showLicenseModal}
                onClose={onCloseLicenseModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <Tabs active='settings' />
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
                            role='presentation'
                            className={classNames('item')}
                            onClick={onEnableWarp}
                            onKeyDown={onKeyDownWarp}
                        >
                            <label
                                className='key'
                                htmlFor='flex-switch-check-checked'
                                // role='label'
                            >
                                {appLang?.settings?.method_warp}
                            </label>
                            <div className='value' id='flex-switch-check-checked'>
                                <div
                                    tabIndex={-1}
                                    className={classNames('switch', method === '' ? 'checked' : '')}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_warp_desc}</div>
                        </div>
                        <div
                            role='presentation'
                            className={classNames('item')}
                            onClick={onEnableGool}
                            onKeyDown={onKeyDownGool}
                        >
                            <label
                                className='key'
                                htmlFor='flex-switch-check-checked-gool'
                                // role='label'
                            >
                                {appLang?.settings?.method_gool}
                            </label>
                            <div className='value' id='flex-switch-check-checked-gool'>
                                <div
                                    tabIndex={-1}
                                    className={classNames(
                                        'switch',
                                        method === 'gool' ? 'checked' : ''
                                    )}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_gool_desc}</div>
                        </div>
                        <div
                            role='presentation'
                            className={classNames('item')}
                            onClick={onEnablePsiphon}
                            onKeyDown={onKeyDownPsiphon}
                        >
                            <label
                                className='key'
                                htmlFor='flex-switch-check-checked-psiphon'
                                // role='label'
                            >
                                {appLang?.settings?.method_psiphon}
                            </label>
                            <div className='value' id='flex-switch-check-checked-psiphon'>
                                <div
                                    tabIndex={-1}
                                    className={classNames(
                                        'switch',
                                        method === 'psiphon' ? 'checked' : ''
                                    )}
                                />
                            </div>
                            <div className='info'>{appLang?.settings?.method_psiphon_desc}</div>
                        </div>
                    </div>
                    <div className={classNames('item', method === 'psiphon' ? '' : 'disabled')}>
                        <Dropdown
                            id='flex-switch-check-checked-psiphon-location'
                            onChange={onChangeLocation}
                            value={location}
                            label={appLang?.settings?.method_psiphon_location}
                            tabIndex={-1}
                            disabled={method !== 'psiphon'}
                            items={[
                                {
                                    value: '',
                                    label: appLang?.settings?.method_psiphon_location_auto
                                },
                                ...countries
                            ]}
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
                <div className='settings' role='menu'>
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
                        role='presentation'
                        className='item'
                        onClick={onOpenLicenseModal}
                        onKeyDown={onKeyDownLicense}
                    >
                        <label
                            className='key'
                            htmlFor='flex-switch-check-checked-license'
                            // role='label'
                        >
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
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
}
