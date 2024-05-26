import classNames from 'classnames';
import { useState } from 'react';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { getLang } from '../../lib/loaders';

export default function EndpointModal({
    title,
    isOpen,
    onClose,
    defValue = defaultSettings.endpoint,
    endpoint,
    setEndpoint
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    defValue?: string;
    endpoint: any;
    setEndpoint: any;
}) {
    const [endpointInput, setEndpointInput] = useState(endpoint);
    const appLang = getLang();

    const onSaveModal = () => {
        const endpointInputModified = endpointInput.replace(/^https?:\/\//, '').replace(/\/$/, '');
        let regex = /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?::\d{1,5})$/;
        if (endpointInput.startsWith('[')) {
            regex =
                /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))/;
        }
        const tmp = regex.test(endpointInputModified) ? endpointInputModified : defValue;
        setEndpointInput(tmp);
        setEndpoint(tmp);
        settings.set('endpoint', tmp);
        onClose();
    };

    if (!isOpen) return <></>;

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
                            value={endpointInput}
                            spellCheck={false}
                            className='form-control'
                            onChange={(e) => {
                                setEndpointInput(String(e.target.value).toLowerCase().trim());
                            }}
                        />
                        <div className='clearfix' />
                        <div
                            className={classNames('btn', 'btn-cancel')}
                            onClick={() => {
                                setEndpointInput(endpoint);
                                onClose();
                            }}
                        >
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
