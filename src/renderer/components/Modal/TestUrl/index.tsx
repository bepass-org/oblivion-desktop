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
        setTestUrlInput
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
                            {testUrlInput !== defaultSettings.testUrl && (
                                <>
                                    <div
                                        role='presentation'
                                        className={classNames('label', 'label-warning')}
                                        onClick={() => {
                                            setTestUrlInput(defaultSettings.testUrl);
                                        }}
                                    >
                                        <i className='material-icons'>&#xe145;</i>
                                        {appLang?.modal?.endpoint_default}
                                    </div>
                                </>
                            )}
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
                </div>
            </div>
        </div>
    );
}
