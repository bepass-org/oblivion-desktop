import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import useSingBox from './useSingBox';
import MTUModal from '../../components/Modal/MTU';

export default function SingBox() {
    const {
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
            <Nav title='SingBox Settings' />
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
                            Close SingBox
                        </label>
                        <div className='value'>
                            <div
                                className={classNames('checkbox', closeSingBox ? 'checked' : '')}
                                tabIndex={-1}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>Automatically close sing-box on disconnect</div>
                    </div>
                    <div
                        role='button'
                        className={classNames('item')}
                        onClick={handleCloseHelperOnClick}
                        onKeyDown={handleCloseHelperOnKeyDown}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='sing-box'>
                            Close Helper
                        </label>
                        <div className='value'>
                            <div
                                className={classNames('checkbox', closeHelper ? 'checked' : '')}
                                tabIndex={-1}
                            >
                                <i className='material-icons'>&#xe876;</i>
                            </div>
                        </div>
                        <div className='info'>Automatically close helper on exit</div>
                    </div>
                    <div
                        role='button'
                        className='item'
                        onClick={onClickMtu}
                        onKeyDown={onKeyDownClickMtu}
                        tabIndex={0}
                    >
                        <label className='key' htmlFor='port'>
                            MTU
                        </label>
                        <div className='value' id='port'>
                            <span className='dirLeft' tabIndex={-1}>
                                {mtu}
                            </span>
                        </div>
                        <div className='info'>Define MTU</div>
                    </div>
                </div>
            </div>
            <MTUModal
                mtu={mtu}
                setMtu={setMtu}
                title={'Set MTU'}
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
