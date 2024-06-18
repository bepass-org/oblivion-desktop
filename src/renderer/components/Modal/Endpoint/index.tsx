import classNames from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import { defaultSettings } from '../../../../defaultSettings';
import useEndpointModal from './useEndpointModal';
import Input from '../../Input';
import { settings } from '../../../lib/settings';

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
    const {
        appLang,
        endpointInput,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleEndpointInputChange,
        handleOnClose,
        onSaveModal,
        onUpdateKeyDown,
        setEndpointDefault,
        setEndpointSuggestion,
        showModal,
        suggestion
    } = useEndpointModal({
        isOpen,
        onClose,
        defValue,
        endpoint,
        setEndpoint
    });

    const suggestionRef = useRef<any>(null);
    const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<string>('');

    useEffect(() => {
        settings.get('scanResult').then((value) => {
            setScanResult(typeof value === 'undefined' ? defaultSettings.scanResult : value);
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestion(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

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
                                className={classNames('label', 'label-danger')}
                                onClick={() => {
                                    setShowSuggestion(!showSuggestion);
                                }}
                                ref={suggestionRef}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.endpoint_suggested}
                                <div
                                    className={classNames(
                                        'dropDownInLabel',
                                        showSuggestion ? '' : 'hidden'
                                    )}
                                >
                                    {[...suggestion.ipv4.keys()].map((key) => (
                                        <>
                                            <div
                                                className={classNames(
                                                    'item',
                                                    suggestion.ipv4[key] === endpointInput
                                                        ? 'disabled'
                                                        : ''
                                                )}
                                                role='presentation'
                                                key={key}
                                                onClick={() => {
                                                    setEndpointSuggestion(suggestion.ipv4[key]);
                                                    setShowSuggestion(false);
                                                }}
                                            >
                                                #{key + 1}
                                                <small> IPv4</small>
                                            </div>
                                        </>
                                    ))}
                                    {[...suggestion.ipv6.keys()].map((key) => (
                                        <>
                                            <div
                                                className={classNames(
                                                    'item',
                                                    suggestion.ipv6[key] === endpointInput
                                                        ? 'disabled'
                                                        : ''
                                                )}
                                                role='presentation'
                                                key={key}
                                                onClick={() => {
                                                    setEndpointSuggestion(suggestion.ipv6[key]);
                                                    setShowSuggestion(false);
                                                }}
                                            >
                                                #{key + suggestion.ipv4.length + 1}
                                                <small> IPv6</small>
                                            </div>
                                        </>
                                    ))}
                                    {scanResult && (
                                        <>
                                            <div
                                                className={classNames(
                                                    'item',
                                                    scanResult === endpointInput ? 'disabled' : ''
                                                )}
                                                role='presentation'
                                                onClick={() => {
                                                    setEndpointSuggestion(scanResult);
                                                    setShowSuggestion(false);
                                                }}
                                            >
                                                #
                                                {suggestion.ipv4.length +
                                                    suggestion.ipv6.length +
                                                    1}
                                                <small>
                                                    {' '}
                                                    {scanResult.match(/^[0-9a-fA-F:]+$/) !== null
                                                        ? 'IPv6'
                                                        : 'IPv4'}
                                                </small>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-warning',
                                    endpointInput === defValue ? 'disabled' : ''
                                )}
                                onClick={setEndpointDefault}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.endpoint_default}
                            </div>
                        </div>
                    </h3>
                    <Input
                        id='modal_endpoint_input'
                        value={endpointInput}
                        tabIndex={0}
                        onChange={handleEndpointInputChange}
                        type='text'
                    />
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        onKeyDown={handleCancelButtonKeyDown}
                        role='button'
                        tabIndex={0}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        onKeyDown={onUpdateKeyDown}
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
