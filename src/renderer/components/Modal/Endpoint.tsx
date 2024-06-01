import classNames from 'classnames';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { getLang } from '../../lib/loaders';

interface EndpointModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    defValue?: string;
    endpoint: string;
    setEndpoint: (value: string) => void;
}

const EndpointModal: FC<EndpointModalProps> = ({
    title,
    isOpen,
    onClose,
    defValue = defaultSettings.endpoint,
    endpoint,
    setEndpoint
}) => {
    const [endpointInput, setEndpointInput] = useState<string>(endpoint);
    const [showModal, setshowModal] = useState<boolean>(isOpen);

    useEffect(() => setshowModal(isOpen), [isOpen]);

    const appLang = getLang();

    const handleOnClose = useCallback(() => {
        setshowModal(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const suggestion = useMemo(() => ['188.114.98.224:2408', '162.159.192.175:891'], []);

    const onSaveModal = useCallback(() => {
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
        handleOnClose();
    }, [defValue, endpointInput, handleOnClose, setEndpoint]);

    const setEndpointSuggestion = useCallback(
        (item: number) => {
            if (typeof item === 'undefined' || !item) {
                item = 0;
            }
            setEndpointInput(suggestion[item]);
        },
        [suggestion]
    );

    const setEndpointDefault = useCallback(() => {
        setEndpointInput(defValue);
    }, [defValue]);

    const handleCancelButtonClick = useCallback(() => {
        setEndpointInput(endpoint);
        handleOnClose();
    }, [endpoint, handleOnClose]);

    const handleEndpointInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setEndpointInput(e.target.value.toLowerCase().trim());
        },
        [setEndpointInput]
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
                    <h3>
                        {title}
                        <div className='labels'>
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-danger',
                                    endpointInput === suggestion[0] ? 'hidden' : ''
                                )}
                                onClick={() => {
                                    setEndpointSuggestion(0);
                                }}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                E1
                            </div>
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-primary',
                                    endpointInput === suggestion[1] ? 'hidden' : ''
                                )}
                                onClick={() => {
                                    setEndpointSuggestion(1);
                                }}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                E2
                            </div>
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-warning',
                                    endpointInput === defValue ? 'hidden' : ''
                                )}
                                onClick={setEndpointDefault}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.endpoint_default}
                            </div>
                        </div>
                    </h3>
                    <input
                        tabIndex={0}
                        value={endpointInput}
                        spellCheck={false}
                        className='form-control'
                        onChange={handleEndpointInputChange}
                        type='text'
                    />
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCancelButtonClick();
                            }
                        }}
                        role='button'
                        tabIndex={0}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
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
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EndpointModal;
