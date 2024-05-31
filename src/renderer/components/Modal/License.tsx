import classNames from 'classnames';
import { ChangeEvent, useCallback, useState } from 'react';
import { settings } from '../../lib/settings';
import { getLang } from '../../lib/loaders';

interface LicenseModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    license: string;
    setLicense: (value: string) => void;
}

export default function LicenseModal({
    title,
    isOpen,
    onClose,
    license,
    setLicense
}: LicenseModalProps) {
    const [licenseInput, setLicenseInput] = useState<string>(license);

    const appLang = getLang();

    const onSaveModal = useCallback(() => {
        const regex = /^[a-zA-Z0-9-]*$/;
        const tmp = regex.test(licenseInput) ? licenseInput : '';
        setLicenseInput(tmp);
        setLicense(tmp);
        settings.set('license', tmp);
        onClose();
    }, [onClose, licenseInput, setLicense]);

    const handleCancelButtonClick = useCallback(() => {
        setLicenseInput(license);
        onClose();
    }, [license, onClose]);

    const handleLicenseInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setLicenseInput(e.target.value.trim());
        },
        [setLicenseInput]
    );

    if (!isOpen) return <></>;

    return (
        <div className='dialog'>
            <div className='dialogBg' onClick={onClose} role='presentation' />
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
                        tabIndex={0}
                        spellCheck={false}
                        className='form-control'
                        onChange={handleLicenseInputChange}
                        type='text'
                    />
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        tabIndex={2}
                        role='button'
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
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        tabIndex={1}
                        role='button'
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
