import classNames from 'classnames';
import { defaultSettings } from '../../../../defaultSettings';
import usePortModal from './usePortModal';

interface PortModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    defValue?: number;
    port: number;
    setPort: (value: number) => void;
}

export default function PortModal({
    title,
    isOpen,
    onClose,
    defValue = defaultSettings.port,
    port,
    setPort
}: PortModalProps) {
    const {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleOnClose,
        handlePortInputChange,
        onSaveModalClick,
        onSaveModalKeyDown,
        portInput,
        showModal
    } = usePortModal({
        isOpen,
        onClose,
        defValue,
        port,
        setPort
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
                    <input
                        type='number'
                        spellCheck={false}
                        value={portInput}
                        className='form-control'
                        onChange={handlePortInputChange}
                        tabIndex={0}
                    />
                    <div className='clearfix' />
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
