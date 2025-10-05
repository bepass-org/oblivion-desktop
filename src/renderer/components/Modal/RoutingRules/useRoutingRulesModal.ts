import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { useStore } from '../../../store';
import { settingsHaveChangedToast } from '../../../lib/toasts';
import { defaultRoutingRules } from '../../../../defaultSettings';
import useButtonKeyDown from '../../../hooks/useButtonKeyDown';

interface RoutingRulesModalProps {
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    routingRules: string;
    setRoutingRules: (value: string) => void;
}

const useRoutingRulesModal = (props: RoutingRulesModalProps) => {
    const { isConnected, isLoading, proxyMode } = useStore();
    const { setIsOpen, onClose, routingRules, setRoutingRules } = props;
    const [routingRulesInput, setRoutingRulesInput] = useState<string>(routingRules);

    const handleOnClose = useCallback(() => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    const appLang = useTranslate();

    const validateRules = useCallback((textareaContent: string): string => {
        if (textareaContent === '') {
            return '';
        }
        const lines = textareaContent.split('\n');
        const validEntriesSet = new Set<string>();
        const entryRegex = /^(geoip|domain|ip|range|app):(.+)$/;
        const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
        const ipRangeRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const lineWithoutQuotes = trimmedLine
                    .replace(/['"]/g, '')
                    .replace(/:\s+/g, ':')
                    .replace(/و+/g, ',')
                    .replace(/[\\/]/g, '')
                    .replace(/\s*,\s*/g, ',')
                    .replace(/,+/g, ',');
                const entry = lineWithoutQuotes.endsWith(',')
                    ? lineWithoutQuotes.slice(0, -1)
                    : lineWithoutQuotes;
                const cleanedEntry = entry.replace(/,+$/, '');
                const match = cleanedEntry.match(entryRegex);
                const ipMatch = cleanedEntry.match(ipRegex);
                const ipRangeMatch = cleanedEntry.match(ipRangeRegex);
                // eslint-disable-next-line no-useless-escape
                const isIpv6Like = /^ip:.*[:\[\]]/.test(cleanedEntry);
                if (match || ipMatch || ipRangeMatch) {
                    if (!isIpv6Like) {
                        validEntriesSet.add(cleanedEntry);
                    }
                }
            }
        });
        const validEntries = Array.from(validEntriesSet);
        const priorityEntries = validEntries.filter((entry) => entry.startsWith('domain:!'));
        const otherEntries = validEntries.filter((entry) => !entry.startsWith('domain:!'));
        const orderedEntries = [...priorityEntries, ...otherEntries];
        return orderedEntries.length > 0 ? orderedEntries.join(',\n') : '';
    }, []);

    const onSaveModal = useCallback(() => {
        const checkRules = validateRules(routingRulesInput);
        if (checkRules) {
            setRoutingRules(checkRules);
            setRoutingRulesInput(checkRules);
            settings.set('routingRules', checkRules);
        } else {
            setRoutingRules('');
            setRoutingRulesInput('');
            settings.set('routingRules', '');
        }
        settingsHaveChangedToast({ ...{ isConnected, isLoading, appLang } });
        handleOnClose();
    }, [
        validateRules,
        routingRulesInput,
        isConnected,
        isLoading,
        appLang,
        handleOnClose,
        setRoutingRules
    ]);

    const onUpdateKeyDown = useButtonKeyDown(onSaveModal);

    const handleCancelButtonClick = useCallback(() => {
        setRoutingRulesInput(routingRules);
        handleOnClose();
    }, [routingRules, handleOnClose]);

    const handleCancelButtonKeyDown = useButtonKeyDown(handleCancelButtonClick);

    const handleRoutingRulesInput = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            setRoutingRulesInput(e.target.value);
        },
        [setRoutingRulesInput]
    );

    const handleSetRoutingRulesSimple = useCallback(() => {
        setRoutingRulesInput(
            defaultRoutingRules.map((rule) => `${rule.type}:${rule.value}`).join(',\n')
        );
    }, [setRoutingRulesInput]);

    return {
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
    };
};
export default useRoutingRulesModal;
