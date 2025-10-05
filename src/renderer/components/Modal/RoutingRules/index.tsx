import classNames from 'classnames';
import useRoutingRulesModal from './useRoutingRulesModal';
import Textarea from '../../Textarea';

interface RoutingRulesModalProps {
    title: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    routingRules: string;
    setRoutingRules: (value: string) => void;
}

export default function RoutingRulesModal({
    title,
    isOpen,
    setIsOpen,
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
        proxyMode
    } = useRoutingRulesModal({
        setIsOpen,
        onClose,
        routingRules,
        setRoutingRules
    });

    if (!isOpen) return <></>;

    return (
        <div className={classNames('dialog', !isOpen ? 'no-opacity' : '')}>
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
                                    routingRulesInput === '' ? '' : 'hidden'
                                )}
                                onClick={handleSetRoutingRulesSimple}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.routing_rules_sample}
                            </div>
                            <a
                                href='https://github.com/bepass-org/oblivion-desktop/wiki/How-to-use-Routing-Rules'
                                target='_blank'
                                className={classNames('label', 'label-default')}
                                rel='noreferrer'
                            >
                                {appLang?.toast?.help_btn}
                            </a>
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
