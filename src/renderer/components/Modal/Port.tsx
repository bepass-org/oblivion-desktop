import classNames from 'classnames';
import { settings } from '../../lib/settings';

export default function PortModal({
    title,
    isOpen,
    onClose,
    defValue,
    port,
    setPort,
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    defValue: number;
    port: any;
    setPort: any;
}) {
    if (!isOpen) return <></>;

    const onSaveModal = () => {
        if (!port || port === '' || port < 1) {
            setPort(Number(defValue));
        }
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
                            type='number'
                            value={port}
                            className='form-control'
                            onChange={(e) => {
                                setPort(Number(e.target.value));
                                settings.set('port', Number(e.target.value));
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
