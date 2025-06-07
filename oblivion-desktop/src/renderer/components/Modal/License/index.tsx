import classNames from 'classnames';
import useLicenseModal from './useLicenseModal';
import Input from '../../Input';

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
        showModal,
        handleClearLicenseInput
    } = useLicenseModal({
        isOpen,
        onClose,
        license,
        setLicense
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
                    <h3>
                        {title}
                        <div className='labels'>
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-default',
                                    licenseInput === '' ? 'hidden' : ''
                                )}
                                onClick={handleClearLicenseInput}
                            >
                                <i className='material-icons'>&#xf0ff;</i>
                                {appLang?.modal?.form_clear}
                            </div>
                        </div>
                    </h3>
                    <p className='withMargin'>{appLang?.modal?.license_desc}</p>
                    <div className='clearfix' />
                    <Input
                        id='modal_license_input'
                        value={licenseInput}
                        tabIndex={0}
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
