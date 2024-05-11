import classNames from 'classnames';
import { useState } from 'react';
import { settings } from '../../lib/settings';
import { getLang } from '../../lib/loaders';

export default function LicenseModal({
    title,
    isOpen,
    onClose,
    license,
    setLicense
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    license: any;
    setLicense: any;
}) {
    const [licenseInput, setLicenseInput] = useState(license);

    if (!isOpen) return <></>;

    const appLang = getLang();

    const onSaveModal = () => {
        const regex = /^[a-zA-Z0-9-]*$/;
        const tmp = regex.test(licenseInput) ? licenseInput : '';
        setLicenseInput(tmp);
        setLicense(tmp);
        settings.set('license', tmp);
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
                        <p className='withMargin'>{appLang?.modal?.license_desc}</p>
                        <div className='clearfix' />
                        <input
                            value={licenseInput}
                            spellCheck={false}
                            className='form-control'
                            onChange={(e) => {
                                setLicenseInput(e.target.value);
                            }}
                        />
                        <div className='clearfix' />
                        <div className={classNames('btn', 'btn-cancel')} onClick={onClose}>
                            {appLang?.modal?.cancel}
                        </div>
                        <div
                            className={classNames('btn', 'btn-save')}
                            onClick={() => {
                                onSaveModal();
                            }}
                        >
                            {appLang?.modal?.update}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
