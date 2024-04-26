import classNames from 'classnames';
import { settings } from '../../lib/settings';
import { useState } from 'react';
import { defaultSettings } from '../../../defaultSettings';

export default function PortModal({
    title,
    isOpen,
    onClose,
    defValue,
    port,
    setPort,
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    defValue: number;
    port: any;
    setPort: any;
}) {
    if (!isOpen) return <></>;
    const [portInput, setPortInput] = useState(port);

    const onSaveModal = () => {
        setPort(Number(portInput) < 1 || portInput === '' ? defValue : portInput);
        settings.set('port', portInput);
        onClose();
    };

    return (
        <>
            <div className='dialog'>
                <div className='dialogBg' onClick={onClose} />
                <div className='dialogBox'>
                    <div className='container'>
                        <div className='line'>
                            <div className='miniLine' />
                        </div>
                        <h3>{title}</h3>
                        <input
                            type='text'
                            value={portInput}
                            className='form-control'
                            onChange={(e) => {
                                setPortInput(e.target.value);
                            }}
                        />
                        <div className='clearfix' />
                        <div className={classNames('btn', 'btn-cancel')} onClick={onClose}>
                            انصراف
                        </div>
                        <div
                            className={classNames('btn', 'btn-save')}
                            onClick={() => {
                                onSaveModal();
                            }}
                        >
                            بروزرسانی
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
