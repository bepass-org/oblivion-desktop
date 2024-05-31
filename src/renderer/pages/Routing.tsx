import classNames from 'classnames';
import { useState, useEffect, useCallback } from 'react';
import Lottie from 'lottie-react';
import Nav from '../components/Nav';
import RoutingRulesModal from '../components/Modal/RoutingRules';
import { settings } from '../lib/settings';
import LottieFile from '../../../assets/json/1713988096625.json';
import { toPersianNumber } from '../lib/toPersianNumber';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';

export default function Routing() {
    const [routingRules, setRoutingRules] = useState<string>();
    const [showRoutingRulesModal, setShowRoutingRulesModal] = useState<boolean>(false);

    useGoBackOnEscape();

    // loading settings
    useEffect(() => {
        settings.get('routingRules').then((value) => {
            setRoutingRules(typeof value === 'undefined' ? '' : value);
        });
    }, []);

    const countRoutingRules = useCallback((value: string) => {
        if (value === '') {
            return 'غیرفعال';
        }
        const lines = value.split('\n');
        return lines?.length > 0 ? toPersianNumber(lines.length) + ' مورد' : 'غیرفعال';
    }, []);

    const onCloseRoutingRulesModal = useCallback(() => setShowRoutingRulesModal(false), []);
    const onOpenRoutingRulesModal = useCallback(() => setShowRoutingRulesModal(true), []);

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
