import classNames from 'classnames';
import useRoutingRulesModal from './useRoutingRulesModal';
import Textarea from '../../Textarea';

interface RoutingRulesModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    routingRules: string;
    setRoutingRules: (value: string) => void;
    proxyMode: string;
}

export default function RoutingRulesModal({
    title,
    isOpen,
    onClose,
    routingRules,
    setRoutingRules
}: RoutingRulesModalProps) {
    const {
        appLang,
        handleCancelButtonClick,
        handleCancelButtonKeyDown,
        handleOnClose,
        handleRoutingRulesInput,
        handleSetRoutingRulesSimple,
        onSaveModal,
        onUpdateKeyDown,
        routingRulesInput,
        showModal,
        proxyMode
    } = useRoutingRulesModal({
        isOpen,
        onClose,
        routingRules,
        setRoutingRules
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
                                    'label-warning',
                                    'pull-right',
                                    routingRulesInput === '' ? '' : 'hidden'
                                )}
                                onClick={handleSetRoutingRulesSimple}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.routing_rules_sample}
                            </div>
                        </div>
                    </h3>
                    <Textarea
                        id='modal_routing_rules_textarea'
                        value={routingRulesInput}
                        onChange={handleRoutingRulesInput}
                    />
                    {proxyMode !== '' && (
                        <>
                            <div className='clearfix' />
                            <div className={classNames('appToast', 'inModal')}>
                                <div>
                                    <i className='material-icons'>&#xe0f0;</i>
                                    {proxyMode === 'tun'
                                        ? appLang?.modal?.routing_rules_alert_tun
                                        : appLang?.modal?.routing_rules_alert_system}
                                </div>
                            </div>
                        </>
                    )}
                    <div className='clearfix' />
                    <div
                        role='button'
                        tabIndex={0}
                        aria-hidden='true'
                        className={classNames('btn', 'btn-cancel')}
                        onClick={handleCancelButtonClick}
                        onKeyDown={handleCancelButtonKeyDown}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        tabIndex={0}
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                        onKeyDown={onUpdateKeyDown}
                    >
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
}
