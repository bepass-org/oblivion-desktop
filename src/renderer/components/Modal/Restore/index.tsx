import classNames from 'classnames';
import useRestoreModal from './useRestoreModal';

interface RestoreModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    setTheme: (value: string) => void;
    setSystemTray: (value: boolean) => void;
    setLang: (value: string) => void;
    setOpenAtLogin: (value: boolean) => void;
}

export default function RestoreModal({
    title,
    isOpen,
    onClose,
    setTheme,
    setSystemTray,
    setLang,
    setOpenAtLogin
}: RestoreModalProps) {
    const { appLang, handleOnClose, onSaveModal, showModal } = useRestoreModal({
        isOpen,
        onClose,
        setLang,
        setOpenAtLogin,
        setSystemTray,
        setTheme
    });

    if (!isOpen) return null;

    return (
        <div className={classNames('dialog', !showModal ? 'no-opacity' : '')}>
            <div className='dialogBg' onClick={handleOnClose} role='presentation' />
            <div className='dialogBox'>
                <div className='container'>
                    <div className='line'>
                        <div className='miniLine' />
                    </div>
                    <h3>{title}</h3>
                    <p>{appLang?.modal?.restore_desc}</p>
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={onClose}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onClose();
                            }
                        }}
                        tabIndex={0}
                        role='button'
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        aria-hidden='true'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSaveModal();
                            }
                        }}
                        tabIndex={0}
                    >
                        {appLang?.modal?.confirm}
                    </div>
                </div>
            </div>
        </div>
    );
}
