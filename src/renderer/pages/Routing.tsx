import classNames from 'classnames';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import Nav from '../components/Nav';
import RoutingRulesModal from '../components/Modal/RoutingRules';
import { settings } from '../lib/settings';
import LottieFile from '../../../assets/json/1713988096625.json';
import { toPersianNumber } from '../lib/toPersianNumber';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';

export default function Routing() {
    const [routingRules, setRoutingRules] = useState();
    const [showRoutingRulesModal, setShowRoutingRulesModal] = useState(false);

    useGoBackOnEscape();

    // loading settings
    useEffect(() => {
        settings.get('routingRules').then((value) => {
            setRoutingRules(typeof value === 'undefined' ? '' : value);
        });
    }, []);

    const countRoutingRules = (value: any) => {
        if (value === '') {
            return 'غیرفعال';
        }
        const lines = value.split('\n');
        return lines?.length > 0 ? toPersianNumber(lines.length) + ' مورد' : 'غیرفعال';
    };

    if (typeof routingRules === 'undefined')
        return (
            <>
                <div className='settings'>
                    <div className='lottie'>
                        <Lottie animationData={LottieFile} loop={true} />
                    </div>
                </div>
            </>
        );

    return (
        <>
            <Nav title='قوانین مسیریابی' />
            <RoutingRulesModal
                {...{
                    routingRules,
                    setRoutingRules
                }}
                title='لیست سیاه'
                isOpen={showRoutingRulesModal}
                onClose={() => {
                    setShowRoutingRulesModal(false);
                }}
            />
            <div className={classNames('myApp', 'normalPage')}>
                <div className='settings'>
                    <div
                        className='item'
                        onClick={() => {
                            setShowRoutingRulesModal(true);
                        }}
                    >
                        <label className='key'>لیست سیاه</label>
                        <div className='value'>
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
