import classNames from 'classnames';
import { defaultSettings } from '../../../defaultSettings';
import { settings } from '../../lib/settings';
import { useState } from 'react';

export default function LicenseModal({
    title,
    isOpen,
    onClose,
    license,
    setLicense,
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    license: any;
    setLicense: any;
}) {

    if (!isOpen) return null;
    const [licenseInput, setLicenseInput] = useState(license);

    const onSaveModal = () => {
        setLicense(licenseInput);
        settings.set('license', licenseInput);
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
                            value={licenseInput}
                            className='form-control'
                            onChange={(e) => {
                                setLicenseInput(e.target.value);
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
