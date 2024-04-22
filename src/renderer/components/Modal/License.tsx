import { useState } from 'react';
import classNames from 'classnames';
import { loadSettings, saveSettings } from '../../lib/utils';

export default function LicenseModal({
    title,
    isOpen,
    onClose,
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
}) {
    const [license, setLicense] = useState(loadSettings('OBLIVION_LICENSE'));
    if (!isOpen) return null;

    const onSaveModal = () => {
        saveSettings('OBLIVION_LICENSE', license);
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
                            value={license ? license : ''}
                            className='form-control'
                            onChange={(event) => {
                                setLicense(event.target.value);
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
