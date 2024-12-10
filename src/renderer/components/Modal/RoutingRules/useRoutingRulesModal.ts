import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { settings } from '../../../lib/settings';
import useTranslate from '../../../../localization/useTranslate';
import { useStore } from '../../../store';
import { settingsHaveChangedToast } from '../../../lib/toasts';
import { defaultSettings } from '../../../../defaultSettings';

interface RoutingRulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    routingRules: string;
    setRoutingRules: (value: string) => void;
}

const useRoutingRulesModal = (props: RoutingRulesModalProps) => {
    const { isConnected, isLoading } = useStore();
    const { isOpen, onClose, routingRules, setRoutingRules } = props;
    const [routingRulesInput, setRoutingRulesInput] = useState<string>(routingRules);
    const [showModal, setShowModal] = useState<boolean>(isOpen);
    const [proxyMode, setProxyMode] = useState<string>('');

    useEffect(() => {
        setShowModal(isOpen), [isOpen];
        settings.get('proxyMode').then((value) => {
            setProxyMode(typeof value === 'undefined' ? defaultSettings.proxyMode : value);
        });
    });

    const handleOnClose = useCallback(() => {
        setShowModal(false);
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
                if (match || ipMatch || ipRangeMatch) {
                    validEntriesSet.add(cleanedEntry);
                }
            }
        });
        const validEntries = Array.from(validEntriesSet);
        return validEntries.length > 0 ? validEntries.join(',\n') : '';
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

    const onUpdateKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onSaveModal();
            }
        },
        [onSaveModal]
    );

    const handleCancelButtonClick = useCallback(() => {
        setRoutingRulesInput(routingRules);
        handleOnClose();
    }, [routingRules, handleOnClose]);

    const handleCancelButtonKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCancelButtonClick();
            }
        },
        [handleCancelButtonClick]
    );

    const handleRoutingRulesInput = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            setRoutingRulesInput(e.target.value);
        },
        [setRoutingRulesInput]
    );

    const handleSetRoutingRulesSimple = useCallback(() => {
        setRoutingRulesInput(
            `domain:dolat.ir,\ndomain:apple.com,\nip:127.0.0.1,\ndomain:*.ir,\napp:Figma`
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
        showModal,
        proxyMode
    };
};
export default useRoutingRulesModal;
