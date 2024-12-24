import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import useSingBox from './useSingBox';
import MTUModal from '../../components/Modal/MTU';
import Tabs from '../../components/Tabs';
import { singBoxGeoIp, singBoxGeoSite, singBoxLog, singBoxStack } from '../../../defaultSettings';

export default function SingBox() {
    const {
        appLang,
        settingsState,
        handleToggleSetting,
        handleSelectChange,
        handleKeyDown,
        showPortModal,
        onClickMtu,
        onKeyDownClickMtu,
        setMtu
    } = useSingBox();

    const {
        closeHelper,
        singBoxGeoIp: geoIp,
        singBoxGeoSite: geoSite,
        singBoxMTU: mtu,
        singBoxGeoBlock: geoBlock,
        singBoxLog: log,
        singBoxStack: stack,
        singBoxSniff: sniff,
        proxyMode
    } = settingsState;

    if (
        typeof closeHelper === 'undefined' ||
        typeof geoIp === 'undefined' ||
        typeof geoSite === 'undefined' ||
        typeof mtu === 'undefined' ||
        typeof geoBlock === 'undefined' ||
        typeof log === 'undefined' ||
        typeof stack === 'undefined' ||
        typeof sniff === 'undefined' ||
        typeof proxyMode === 'undefined'
    )
        return <div className='settings' />;

    return (
        <>
            <Nav title={appLang.settings.singbox} />
            <div className={classNames('myApp', 'normalPage', 'withScroll')}>
                <div className='container'>
                    <Tabs active='singbox' proxyMode={proxyMode as string} />
                    <div className='settings' role='menu'>
                        <div className={classNames('item')}>
                            <label className='key' htmlFor='geo_rules'>
                                {appLang.settings.geo_rules_ip}
                            </label>
                            <div className='value'>
                                <select
                                    tabIndex={-1}
                                    id='geo_rules'
                                    onChange={handleSelectChange('singBoxGeoIp')}
                                    value={geoIp as string}
                                >
                                    {singBoxGeoIp.map((option) => (
                                        <option
                                            value={option.geoIp}
                                            tabIndex={0}
                                            key={option.geoIp}
                                        >
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
                                    onChange={handleSelectChange('singBoxGeoSite')}
                                    value={geoSite as string}
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
                            onClick={() => handleToggleSetting('singBoxGeoBlock')}
                            onKeyDown={handleKeyDown('singBoxGeoBlock')}
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
                                    <i className='material-icons'></i>
                                </div>
                            </div>
                            <div className='info'>{appLang.settings.geo_block_desc}</div>
                        </div>
                    </div>
                    <div className='moreSettings'>
                        <i className='material-icons'></i>
                        {appLang?.settings?.more_helper}
                    </div>
                    <div className='settings' role='menu' tabIndex={0}>
                        <div
                            role='button'
                            className={classNames('item')}
                            onClick={() => handleToggleSetting('closeHelper')}
                            onKeyDown={handleKeyDown('closeHelper')}
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
                                    <i className='material-icons'></i>
                                </div>
                            </div>
                            <div className='info'>{appLang.settings.close_helper_desc}</div>
                        </div>
                    </div>
                    <div className='moreSettings'>
                        <i className='material-icons'></i>
                        {appLang?.settings?.more}
                    </div>
                    <div className='settings' role='menu' tabIndex={0}>
                        <div className={classNames('item')}>
                            <label className='key' htmlFor='log'>
                                {appLang.settings.singbox_log}
                            </label>
                            <div className='value'>
                                <select
                                    tabIndex={-1}
                                    id='log'
                                    onChange={handleSelectChange('singBoxLog')}
                                    value={log as string}
                                >
                                    {singBoxLog.map((option) => (
                                        <option
                                            value={option.value}
                                            tabIndex={0}
                                            key={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='info'>{appLang.settings.singbox_log_desc}</div>
                        </div>

                        <div className={classNames('item')}>
                            <label className='key' htmlFor='stack'>
                                {appLang.settings.singbox_stack}
                            </label>
                            <div className='value'>
                                <select
                                    tabIndex={-1}
                                    id='stack'
                                    onChange={handleSelectChange('singBoxStack')}
                                    value={stack as string}
                                >
                                    {singBoxStack.map((option) => (
                                        <option
                                            value={option.value}
                                            tabIndex={0}
                                            key={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='info'>{appLang.settings.singbox_stack_desc}</div>
                        </div>

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

                        <div
                            role='button'
                            className={classNames('item')}
                            onClick={() => handleToggleSetting('singBoxSniff')}
                            onKeyDown={handleKeyDown('singBoxSniff')}
                            tabIndex={0}
                        >
                            <label className='key' htmlFor='sniff'>
                                {appLang.settings.singbox_sniff}
                            </label>
                            <div className='value'>
                                <div
                                    className={classNames('checkbox', sniff ? 'checked' : '')}
                                    tabIndex={-1}
                                >
                                    <i className='material-icons'></i>
                                </div>
                            </div>
                            <div className='info'>{appLang.settings.singbox_sniff_desc}</div>
                        </div>
                    </div>
                </div>
            </div>
            <MTUModal
                mtu={mtu as number}
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
