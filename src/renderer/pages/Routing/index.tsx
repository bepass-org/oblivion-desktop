import classNames from 'classnames';
import Lottie from 'lottie-react';
import Nav from '../../components/Nav';
import RoutingRulesModal from '../../components/Modal/RoutingRules';
import LottieFile from '../../../../assets/json/1713988096625.json';
import useRouting from './useRouting';

export default function Routing() {
    const {
        countRoutingRules,
        onCloseRoutingRulesModal,
        onOpenRoutingRulesModal,
        routingRules,
        showRoutingRulesModal,
        setRoutingRules
    } = useRouting();
    if (typeof routingRules === 'undefined')
        return (
            <div className='settings'>
                <div className='lottie'>
                    <Lottie animationData={LottieFile} loop={true} />
                </div>
            </div>
        );

    return (
        <>
            <Nav title='قوانین مسیریابی' />
            <RoutingRulesModal
                routingRules={routingRules}
                setRoutingRules={setRoutingRules}
                title='لیست سیاه'
                isOpen={showRoutingRulesModal}
                onClose={onCloseRoutingRulesModal}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='settings'>
                    <div role='presentation' className='item' onClick={onOpenRoutingRulesModal}>
                        <label className='key' htmlFor='routing-rules'>
                            لیست سیاه
                        </label>
                        <div className='value' id='routing-rules'>
                            <span className='dirLeft' dir='rtl'>
                                {countRoutingRules(routingRules)}
                            </span>
                        </div>
                        <div className='info'>جلوگیری از عبور ترافیک از وارپ</div>
                    </div>
                </div>
            </div>
        </>
    );
}
