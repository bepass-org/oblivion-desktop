import classNames from 'classnames';
import { defaultSettings } from '../../../../defaultSettings';
import useMTUModal from './useMTUModal';
import { lang } from '../../../../localization';

interface MTUModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    defValue?: number;
    mtu: number;
    setMtu: (value: number) => void;
}

export default function MTUModal({
    title,
    isOpen,
    onClose,
    defValue = defaultSettings.singBoxMTU,
    mtu,
    setMtu
}: MTUModalProps) {
    const {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleOnClose,
        handleMtuInputChange,
        onSaveModalClick,
        onSaveModalKeyDown,
        mtuInput,
        showModal
    } = useMTUModal({
        isOpen,
        onClose,
        defValue,
        mtu,
        setMtu
    });
    if (!isOpen) return <></>;

    return (
        <div className={classNames('dialog', !showModal ? 'no-opacity' : '')}>
            <div className='dialogBg' onClick={handleOnClose} role='presentation' />
            <div className='dialogBox'>
                <div className='container'>
                    <div className='line'>
                        <div className='miniLine' />
                    </div>
                    <h3>{title}</h3>
                    <p className='withMargin'>{appLang.modal.mtu_desc}</p>
                    <div className='clearfix' />
                    <input
                        type='number'
                        spellCheck={false}
                        value={mtuInput}
                        className='form-control'
                        onChange={handleMtuInputChange}
                        tabIndex={0}
                    />
                    <div
                        role='button'
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        tabIndex={0}
                        onKeyDown={handleCancelButtonKeyDown}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModalClick}
                        tabIndex={0}
                        onKeyDown={onSaveModalKeyDown}
                    >
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
}
