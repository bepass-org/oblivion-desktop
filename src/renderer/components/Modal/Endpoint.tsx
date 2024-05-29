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
    const suggestion = '188.114.98.224:2408';

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
                <div className='dialogBg' onClick={onClose} role='presentation' />
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
                                        'label-warning',
                                        endpointInput === defValue ? 'hidden' : ''
                                    )}
                                    onClick={() => {
                                        setEndpointInput(defValue);
                                    }}
                                >
                                    <i className='material-icons'>&#xe145;</i>
                                    {appLang?.modal?.endpoint_default}
                                </div>
                                <div
                                    role='presentation'
                                    className={classNames(
                                        'label',
                                        'label-danger',
                                        endpointInput === suggestion ? 'hidden' : ''
                                    )}
                                    onClick={() => {
                                        setEndpointInput(suggestion);
                                    }}
                                >
                                    <i className='material-icons'>&#xe145;</i>
                                    {appLang?.modal?.endpoint_suggested}
                                </div>
                            </div>
                        </h3>
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
                            role='presentation'
                            className={classNames('btn', 'btn-cancel')}
                            onClick={() => {
                                setEndpointInput(endpoint);
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
