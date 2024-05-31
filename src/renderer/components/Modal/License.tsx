import classNames from 'classnames';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
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
    const [showModal, setshowModal] = useState<boolean>(isOpen);

    useEffect(() => setshowModal(isOpen), [isOpen]);

    const appLang = getLang();

    const handleOnClose = useCallback(() => {
        setshowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const onSaveModal = useCallback(() => {
        const regex = /^[a-zA-Z0-9-]*$/;
        const tmp = regex.test(licenseInput) ? licenseInput : '';
        setLicenseInput(tmp);
        setLicense(tmp);
        settings.set('license', tmp);
        handleOnClose();
    }, [handleOnClose, licenseInput, setLicense]);

    const handleCancelButtonClick = useCallback(() => {
        setLicenseInput(license);
        handleOnClose();
    }, [license, handleOnClose]);

    const handleLicenseInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setLicenseInput(e.target.value.trim());
        },
        [setLicenseInput]
    );

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
                    <p className='withMargin'>{appLang?.modal?.license_desc}</p>
                    <div className='clearfix' />
                    <input
                        value={licenseInput}
                        spellCheck={false}
                        className='form-control'
                        onChange={handleLicenseInputChange}
                    />
                    <div className='clearfix' />
                    <div
                        role='presentation'
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='presentation'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                    >
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
}
