import classNames from 'classnames';
import useTestUrlModal from './useTestUrlModal';
import Input from '../../Input';
import { defaultSettings } from '../../../../defaultSettings';

interface TestUrlModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    testUrl: string;
    setTestUrl: (value: string) => void;
}

export default function TestUrlModal({
    title,
    isOpen,
    onClose,
    testUrl,
    setTestUrl
}: TestUrlModalProps) {
    const {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleTestUrlInputChange,
        handleOnClose,
        testUrlInput,
        onSaveModalClick,
        onSaveModalKeyDown,
        showModal,
        setTestUrlInput,
        showSuggestion,
        suggestionRef,
        setShowSuggestion,
        suggestion,
        fetchTestUrl,
        updaterRef
    } = useTestUrlModal({
        isOpen,
        onClose,
        testUrl,
        setTestUrl
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
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-danger',
                                    suggestion?.length > 0 ? '' : 'disabled'
                                )}
                                onClick={() => {
                                    if (suggestion?.length > 0) {
                                        setShowSuggestion((pre) => !pre);
                                    }
                                }}
                                ref={suggestionRef}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.endpoint_suggested}
                                <div
                                    className={classNames(
                                        'dropDownInLabel',
                                        showSuggestion ? '' : 'hidden',
                                        suggestion?.length > 0 ? 'splitter' : ''
                                    )}
                                    data-list={1}
                                >
                                    <div className='split'>
                                        {[...suggestion.keys()].slice(0, 25).map((key, index) => (
                                            <>
                                                <div
                                                    className={classNames(
                                                        'item',
                                                        suggestion[key] === testUrlInput
                                                            ? 'disabled'
                                                            : ''
                                                    )}
                                                    role='presentation'
                                                    key={key}
                                                    onClick={() => {
                                                        setTestUrlInput(suggestion[key]);
                                                        //setShowSuggestion(false);
                                                    }}
                                                >
                                                    #{index + 1}
                                                    <small> Url</small>
                                                </div>
                                            </>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div
                                role='presentation'
                                className={classNames(
                                    'label',
                                    'label-warning',
                                    testUrlInput !== defaultSettings.testUrl ? '' : 'disabled'
                                )}
                                onClick={() => {
                                    setTestUrlInput(defaultSettings.testUrl);
                                }}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.form_default}
                            </div>
                        </div>
                    </h3>
                    <div className='clearfix' />
                    <Input
                        id='modal_test_url_input'
                        value={testUrlInput}
                        tabIndex={0}
                        onChange={handleTestUrlInputChange}
                        type='text'
                    />
                    <div className='clearfix' />
                    <div
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        tabIndex={0}
                        role='button'
                        onKeyDown={handleCancelButtonKeyDown}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModalClick}
                        tabIndex={0}
                        role='button'
                        onKeyDown={onSaveModalKeyDown}
                    >
                        {appLang?.modal?.update}
                    </div>
                    <div
                        className={classNames('btn', 'btn-update')}
                        onClick={() => fetchTestUrl(true)}
                        role='button'
                        ref={updaterRef}
                        tabIndex={0}
                    >
                        <i
                            className='material-icons updater'
                            title={appLang?.modal?.test_url_update}
                        >
                            &#xeb5a;
                        </i>
                    </div>
                </div>
            </div>
        </div>
    );
}
