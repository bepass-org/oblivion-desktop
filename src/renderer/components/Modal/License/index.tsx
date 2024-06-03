import classNames from 'classnames';
import useLicenseModal from './useLicenseModal';

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
    const {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleLicenseInputChange,
        handleOnClose,
        licenseInput,
        onSaveModalClick,
        onSaveModalKeyDown,
        showModal
    } = useLicenseModal({
        isOpen,
        onClose,
        license,
        setLicense,
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
                        tabIndex={0}
                        role='button'
                        onKeyDown={handleCancelButtonKeyDown}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModalClick}
                        tabIndex={0}
                        role='button'
                        onKeyDown={onSaveModalKeyDown}
                    >
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
}
