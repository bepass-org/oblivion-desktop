import classNames from 'classnames';
import { settings } from '../../lib/settings';

export default function EndpointModal({
    title,
    isOpen,
    onClose,
    defValue,
    endpoint,
    setEndpoint,
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    defValue: string;
    endpoint: any;
    setEndpoint: any;
}) {
    if (!isOpen) return null;

    const onSaveModal = () => {
        if (endpoint.trim() === '') {
            setEndpoint(defValue);
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
                            value={endpoint}
                            className='form-control'
                            onChange={(e) => {
                                setEndpoint(e.target.value);
                                settings.set('endpoint', e.target.value);
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
