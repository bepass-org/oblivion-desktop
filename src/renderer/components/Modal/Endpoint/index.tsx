import classNames from 'classnames';
import { FC } from 'react';
import { defaultSettings } from '../../../../defaultSettings';
import useEndpointModal from './useEndpointModal';
import Input from '../../Input';
import { Profile } from '../../../pages/Scanner/useScanner';

interface EndpointModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    defValue?: string;
    endpoint: string;
    profiles: Profile[];
    setEndpoint: (value: string) => void;
}

const EndpointModal: FC<EndpointModalProps> = ({
    title,
    isOpen,
    onClose,
    defValue = defaultSettings.endpoint,
    endpoint,
    setEndpoint,
    profiles
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
        setShowSuggestion,
        fetchEndpoints,
        updaterRef,
        showModal,
        scanResult,
        showSuggestion,
        suggestion,
        suggestionRef,
        method
    } = useEndpointModal({
        isOpen,
        onClose,
        defValue,
        endpoint,
        setEndpoint,
        profiles
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
                            {scanResult &&
                                !suggestion[method]?.ipv4.includes(scanResult) &&
                                !suggestion[method]?.ipv6.includes(scanResult) && (
                                    <>
                                        <div
                                            role='presentation'
                                            className={classNames(
                                                'label',
                                                'label-primary',
                                                scanResult === endpointInput ? 'disabled' : ''
                                            )}
                                            onClick={() => {
                                                setEndpointSuggestion(scanResult);
                                            }}
                                        >
                                            <i className='material-icons'>&#xe145;</i>
                                            {appLang?.modal?.endpoint_latest}
                                        </div>
                                    </>
                                )}
                            <div
                                role='presentation'
                                className={classNames('label', 'label-danger')}
                                onClick={() => {
                                    setShowSuggestion((pre) => !pre);
                                }}
                                ref={suggestionRef}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.endpoint_suggested}
                                <div
                                    className={classNames(
                                        'dropDownInLabel',
                                        showSuggestion ? '' : 'hidden',
                                        suggestion[method]?.ipv4.length > 0 &&
                                            suggestion[method].ipv6.length > 0
                                            ? 'splitter'
                                            : ''
                                    )}
                                    data-list={profiles.length > 0 ? 3 : 2}
                                >
                                    <div className='split'>
                                        {[...(suggestion[method]?.ipv4 ?? [])]
                                            .sort((a, b) => b.localeCompare(a))
                                            .slice(0, 25)
                                            .map((item, index) => (
                                                <div
                                                    className={classNames(
                                                        'item',
                                                        item === endpointInput ? 'disabled' : ''
                                                    )}
                                                    role='presentation'
                                                    key={index}
                                                    onClick={() => setEndpointSuggestion(item)}
                                                >
                                                    #{index + 1} <small>IPv4</small>
                                                </div>
                                            ))}{' '}
                                    </div>
                                    <div className='split'>
                                        {[...(suggestion[method]?.ipv6 ?? [])]
                                            .sort((a, b) => b.localeCompare(a))
                                            .slice(0, 15)
                                            .map((item, index) => (
                                                <div
                                                    className={classNames(
                                                        'item',
                                                        item === endpointInput ? 'disabled' : ''
                                                    )}
                                                    role='presentation'
                                                    key={index}
                                                    onClick={() => setEndpointSuggestion(item)}
                                                >
                                                    #{index + 1} <small>IPv6</small>
                                                </div>
                                            ))}
                                    </div>
                                    {profiles?.length > 0 && (
                                        <div className='split'>
                                            {profiles.map(
                                                (item: Profile, key: number) =>
                                                    typeof item.endpoint === 'string' &&
                                                    item.endpoint.length > 7 && (
                                                        <>
                                                            <div
                                                                key={Number(key)}
                                                                className={classNames(
                                                                    'item',
                                                                    item.endpoint === endpointInput
                                                                        ? 'disabled'
                                                                        : ''
                                                                )}
                                                                role='presentation'
                                                                onClick={() => {
                                                                    setEndpointSuggestion(
                                                                        item.endpoint
                                                                    );
                                                                    //setShowSuggestion(false);
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                        </>
                                                    )
                                            )}
                                        </div>
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
                                {appLang?.modal?.form_default}
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
                    <div
                        className={classNames('btn', 'btn-update')}
                        onClick={() => fetchEndpoints(true)}
                        role='button'
                        ref={updaterRef}
                        tabIndex={0}
                    >
                        <i
                            className='material-icons updater'
                            title={appLang?.modal?.endpoint_update}
                        >
                            &#xeb5a;
                        </i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EndpointModal;
