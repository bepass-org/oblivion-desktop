import classNames from 'classnames';
import { useState } from 'react';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { getLang } from '../../lib/loaders';

export default function PortModal({
    title,
    isOpen,
    onClose,
    defValue = defaultSettings.port,
    port,
    setPort
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    defValue?: number;
    port: any;
    setPort: any;
}) {
    const [portInput, setPortInput] = useState(port);
    const appLang = getLang();

    const isValidPort = (port2: any) => {
        return /^\d{1,5}$/.test(port2) && parseInt(port2, 10) >= 20 && parseInt(port2, 10) <= 65535;
    };

    const onSaveModal = () => {
        const tmp = isValidPort(portInput) ? portInput : defValue;
        setPortInput(tmp);
        setPort(tmp);
        settings.set('port', tmp);
        onClose();
    };

    if (!isOpen) return <></>;

    return (
        <>
            <div className='dialog'>
                <div className='dialogBg' onClick={onClose} role='presentation' />
                <div className='dialogBox'>
                    <div className='container'>
                        <div className='line'>
                            <div className='miniLine' />
                        </div>
                        <h3>{title}</h3>
                        <input
                            type='text'
                            spellCheck={false}
                            value={portInput}
                            className='form-control'
                            onChange={(e) => {
                                setPortInput(e.target.value);
                            }}
                        />
                        <div className='clearfix' />
                        <div
                            role='presentation'
                            className={classNames('btn', 'btn-cancel')}
                            onClick={() => {
                                setPortInput(port);
                                onClose();
                            }}
                        >
                            {appLang?.modal?.cancel}
                        </div>
                        <div
                            role='presentation'
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
