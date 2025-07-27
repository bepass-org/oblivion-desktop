import classNames from 'classnames';
import useRestoreModal from './useRestoreModal';

interface RestoreModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    setTheme: (value: string) => void;
    setLang: (value: string) => void;
    setOpenAtLogin: (value: boolean) => void;
    setStartMinimized: (value: boolean) => void;
    setAutoConnect: (value: boolean) => void;
    setForceClose: (value: boolean) => void;
    setShortcut: (value: boolean) => void;
    setHookConnectSuccess?: (value: string) => void;
    setHookConnectSuccessArgs?: (value: string) => void;
    setHookConnectFail?: (value: string) => void;
    setHookConnectFailArgs?: (value: string) => void;
    setHookDisconnect?: (value: string) => void;
    setHookDisconnectArgs?: (value: string) => void;
    setHookConnectionError?: (value: string) => void;
    setHookConnectionErrorArgs?: (value: string) => void;
}

export default function RestoreModal({
    title,
    isOpen,
    onClose,
    setTheme,
    setLang,
    setOpenAtLogin,
    setStartMinimized,
    setAutoConnect,
    setForceClose,
    setShortcut,
    setHookConnectSuccess,
    setHookConnectSuccessArgs,
    setHookConnectFail,
    setHookConnectFailArgs,
    setHookDisconnect,
    setHookDisconnectArgs,
    setHookConnectionError,
    setHookConnectionErrorArgs
}: RestoreModalProps) {
    const { appLang, handleOnClose, onSaveModal, onCancelKeyDown, onConfirmKeyDown, showModal } =
        useRestoreModal({
            isOpen,
            onClose,
            setTheme,
            setLang,
            setOpenAtLogin,
            setStartMinimized,
            setAutoConnect,
            setForceClose,
            setShortcut,
            setHookConnectSuccess,
            setHookConnectSuccessArgs,
            setHookConnectFail,
            setHookConnectFailArgs,
            setHookDisconnect,
            setHookDisconnectArgs,
            setHookConnectionError,
            setHookConnectionErrorArgs
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
                        onKeyDown={onCancelKeyDown}
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
                        onKeyDown={onConfirmKeyDown}
                        tabIndex={0}
                    >
                        {appLang?.modal?.confirm}
                    </div>
                </div>
            </div>
        </div>
    );
}
