import { useCallback, useEffect, useState } from 'react';
import useGoBackOnEscape from '../../hooks/useGoBackOnEscape';
import { settings } from '../../lib/settings';
import { toPersianNumber } from '../../lib/toPersianNumber';

const useRouting = () => {
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
    return {
        routingRules,
        showRoutingRulesModal,
        countRoutingRules,
        onCloseRoutingRulesModal,
        onOpenRoutingRulesModal,
        setRoutingRules
    };
};
export default useRouting;
