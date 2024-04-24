import classNames from 'classnames';
import { defaultSettings } from '../../../defaultSettings';
import { settings } from '../../lib/settings';

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

    const onSaveModal = () => {
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
                            value={license || defaultSettings.license}
                            className='form-control'
                            onChange={(e) => {
                                setLicense(e.target.value);
                                settings.set('license', e.target.value);
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
