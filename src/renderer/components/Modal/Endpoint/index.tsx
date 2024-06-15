import classNames from 'classnames';
import { FC } from 'react';
import { defaultSettings } from '../../../../defaultSettings';
import useEndpointModal from './useEndpointModal';
import Input from '../../Input';

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
                            {[...suggestion.keys()].map((key) => (
                                <>
                                    <div
                                        role='presentation'
                                        className={classNames(
                                            'label',
                                            'label-default',
                                            endpointInput === suggestion[key] ? 'hidden' : ''
                                        )}
                                        key={key}
                                        onClick={() => {
                                            setEndpointSuggestion(key);
                                        }}
                                    >
                                        <i className='material-icons'>&#xe145;</i>S{key + 1}
                                    </div>
                                </>
                            ))}
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
