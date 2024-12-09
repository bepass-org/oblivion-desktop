import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import useSingBox from './useSingBox';
import MTUModal from '../../components/Modal/MTU';
import Tabs from '../../components/Tabs';
import { singBoxGeoIp, singBoxGeoSite } from '../../../defaultSettings';

export default function SingBox() {
    const {
        appLang,
        closeHelper,
        geoIp,
        onChangeGeoIp,
        geoSite,
        onChangeGeoSite,
        mtu,
        setMtu,
        handleCloseHelperOnClick,
        handleCloseHelperOnKeyDown,
        onClickMtu,
        onKeyDownClickMtu,
        showPortModal,
        proxyMode,
        geoBlock,
        handleSingBoxGeoBlockOnClick,
        handleSingBoxGeoBlockOnKeyDown
    } = useSingBox();

    if (
        typeof closeHelper === 'undefined' ||
        typeof geoIp === 'undefined' ||
        typeof geoSite === 'undefined' ||
        typeof mtu === 'undefined' ||
        typeof geoBlock === 'undefined'
    )
        return <div className='settings' />;

    return (
        <>
            <Nav title={appLang.settings.singbox} />
            <div className={classNames('myApp', 'normalPage', 'withScroll')}>
                <Tabs active='singbox' proxyMode={proxyMode} />
                <div className='settings' role='menu'>
                    <div className={classNames('item')}>
                        <label className='key' htmlFor='geo_rules'>
                            {appLang.settings.geo_rules_ip}
                        </label>
                        <div className='value'>
                            <select
                                tabIndex={-1}
                                id='geo_rules'
                                onChange={onChangeGeoIp}
                                value={geoIp}
                            >
                                {singBoxGeoIp.map((option) => (
                                    <option value={option.geoIp} tabIndex={0} key={option.geoIp}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='info'>{appLang.settings.geo_rules_ip_desc}</div>
                    </div>
                    <div className={classNames('item')}>
                        <label className='key' htmlFor='geo_rules'>
                            {appLang.settings.geo_rules_site}
                        </label>
                        <div className='value'>
                            <select
                                tabIndex={-1}
                                id='geo_rules'
                                onChange={onChangeGeoSite}
                                value={geoSite}
                            >
                                {singBoxGeoSite.map((option) => (
                                    <option
                                        value={option.geoSite}
                                        tabIndex={0}
                                        key={option.geoSite}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='info'>{appLang.settings.geo_rules_site_desc}</div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item')}
                        onClick={handleSingBoxGeoBlockOnClick}
                        onKeyDown={handleSingBoxGeoBlockOnKeyDown}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='geo_block'>
                            {appLang.settings.geo_block}
                        </label>
                        <div className='value'>
                            <div
                                className={classNames('checkbox', geoBlock ? 'checked' : '')}
                                tabIndex={-1}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang.settings.geo_block_desc}</div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more_helper}
                </div>
                <div className='settings' role='menu' tabIndex={0}>
                    <div
                        role='button'
                        className={classNames('item')}
                        onClick={handleCloseHelperOnClick}
                        onKeyDown={handleCloseHelperOnKeyDown}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='close_helper'>
                            {appLang.settings.close_helper}
                        </label>
                        <div className='value'>
                            <div
                                className={classNames('checkbox', closeHelper ? 'checked' : '')}
                                tabIndex={-1}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang.settings.close_helper_desc}</div>
                    </div>
                </div>
                <div className='moreSettings'>
                    <i className='material-icons'>&#xe313;</i>
                    {appLang?.settings?.more}
                </div>
                <div className='settings' role='menu' tabIndex={0}>
                    <div
                        role='button'
                        className='item'
                        onClick={onClickMtu}
                        onKeyDown={onKeyDownClickMtu}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='mtu'>
                            {appLang.settings.mtu}
                        </label>
                        <div className='value' id='mtu'>
                            <span className='dirLeft' tabIndex={-1}>
                                {mtu}
                            </span>
                        </div>
                        <div className='info'>{appLang.settings.mtu_desc}</div>
                    </div>
                </div>
            </div>
            <MTUModal
                mtu={mtu}
                setMtu={setMtu}
                title={appLang.modal.mtu_title}
                isOpen={showPortModal}
                onClose={onClickMtu}
            />
            <Toaster
                position='bottom-center'
                reverseOrder={false}
                containerStyle={{ bottom: '70px' }}
            />
        </>
    );
}
