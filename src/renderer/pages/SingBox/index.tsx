import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import useSingBox from './useSingBox';
import MTUModal from '../../components/Modal/MTU';

export default function SingBox() {
    const {
        appLang,
        closeSingBox,
        closeHelper,
        mtu,
        setMtu,
        handleCloseSingBoxOnClick,
        handleCloseSingBoxOnKeyDown,
        handleCloseHelperOnClick,
        handleCloseHelperOnKeyDown,
        onClickMtu,
        onKeyDownClickMtu,
        showPortModal
    } = useSingBox();

    if (
        typeof closeSingBox === 'undefined' ||
        typeof closeHelper === 'undefined' ||
        typeof mtu === 'undefined'
    )
        return <div className='settings' />;

    return (
        <>
            <Nav title={appLang.settings.singbox} />
            <div className={classNames('myApp', 'normalPage', 'withScroll')}>
                <div className='settings' role='menu'>
                    <div
                        role='button'
                        className={classNames('item')}
                        onClick={handleCloseSingBoxOnClick}
                        onKeyDown={handleCloseSingBoxOnKeyDown}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='sing-box'>
                            {appLang.settings.close_singbox}
                        </label>
                        <div className='value'>
                            <div
                                className={classNames('checkbox', closeSingBox ? 'checked' : '')}
                                tabIndex={-1}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>{appLang.settings.close_singbox_desc}</div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item')}
                        onClick={handleCloseHelperOnClick}
                        onKeyDown={handleCloseHelperOnKeyDown}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='sing-box'>
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
                    <div
                        role='button'
                        className='item'
                        onClick={onClickMtu}
                        onKeyDown={onKeyDownClickMtu}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='port'>
                            {appLang.settings.mtu}
                        </label>
                        <div className='value' id='port'>
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
