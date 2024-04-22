import { useState } from 'react';
import classNames from 'classnames';
import { loadSettings, saveSettings } from '../../lib/utils';

export default function PortModal({
    title,
    isOpen,
    onClose,
    defValue,
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    defValue: number;
}) {
    const [port, setPort] = useState(loadSettings('OBLIVION_PORT') || defValue);
    if (!isOpen) return null;

    const onSaveModal = () => {
        if (!port || port === '' || port < 1) {
            setPort(Number(defValue));
        }
        saveSettings('OBLIVION_PORT', port);
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
                            type='number'
                            value={port}
                            className='form-control'
                            onChange={(event) => {
                                setPort(Number(event.target.value));
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
