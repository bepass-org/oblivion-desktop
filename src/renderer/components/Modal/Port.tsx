import classNames from 'classnames';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { getLang } from '../../lib/loaders';

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
    const [portInput, setPortInput] = useState<number>(port);
    const [showModal, setshowModal] = useState<boolean>(isOpen);

    useEffect(() => setshowModal(isOpen), [isOpen]);

    const appLang = getLang();

    const handleOnClose = useCallback(() => {
        setshowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const isValidPort = useCallback((value: number) => {
        // return /^\d{1,5}$/.test(value) && parseInt(value, 10) >= 20 && parseInt(value, 10) <= 65535;
        return /^\d{1,5}$/.test(value.toString()) && value >= 20 && value <= 65535;
    }, []);

    const onSaveModal = useCallback(() => {
        const tmp = isValidPort(portInput) ? portInput : defValue;
        setPortInput(tmp);
        setPort(tmp);
        settings.set('port', tmp);
        handleOnClose();
    }, [defValue, portInput, handleOnClose, setPort, isValidPort]);

    const handleCancelButtonClick = useCallback(() => {
        setPortInput(port);
        handleOnClose();
    }, [port, handleOnClose]);

    const handlePortInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setPortInput(Number(event.target.value));
    }, []);

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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCancelButtonClick();
                            }
                        }}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSaveModal();
                            }
                        }}
                    >
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
}
