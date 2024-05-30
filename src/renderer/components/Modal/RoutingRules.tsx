import classNames from 'classnames';
import { useState } from 'react';
import { settings } from '../../lib/settings';
import { getLang } from '../../lib/loaders';

export default function RoutingRulesModal({
    title,
    isOpen,
    onClose,
    routingRules,
    setRoutingRules
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    routingRules: any;
    setRoutingRules: any;
}) {
    const [routingRulesInput, setRoutingRulesInput] = useState(routingRules);
    const appLang = getLang();

    if (!isOpen) return <></>;

    const validateRules = (textareaContent: string) => {
        if (textareaContent === '') {
            return false;
        }
        const lines = textareaContent.split('\n');
        const validEntriesSet = new Set<string>();
        const entryRegex = /^(geoip|domain):(.+)$/;
        const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
        const ipRangeRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const lineWithoutQuotes = trimmedLine.replace(/['"]/g, '').replace(/ /g, '');
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
        return validEntries.length > 0 ? validEntries.join(',\n') : validEntries;
    };

    const onSaveModal = () => {
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
        onClose();
    };

    return (
        <div className='dialog'>
            <div className='dialogBg' onClick={onClose} role='presentation' />
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
                                onClick={() => {
                                    setRoutingRulesInput(
                                        `domain:dolat.ir,\ndomain:apple.com,\ngeoip:127.0.0.1,\ndomain:*.ir`
                                    );
                                }}
                            >
                                <i className='material-icons'>&#xe145;</i>
                                {appLang?.modal?.routing_rules_sample}
                            </div>
                        </div>
                    </h3>
                    <textarea
                        value={routingRulesInput}
                        spellCheck={false}
                        className='form-control'
                        onChange={(e) => {
                            setRoutingRulesInput(e.target.value);
                        }}
                    />
                    <div className='clearfix' />
                    <div
                        role='button'
                        tabIndex={0}
                        aria-hidden='true'
                        className={classNames('btn', 'btn-cancel')}
                        onClick={() => {
                            setRoutingRulesInput(routingRules);
                            onClose();
                        }}
                    >
                        {appLang?.modal?.cancel}
                    </div>
                    <div
                        role='button'
                        tabIndex={0}
                        aria-hidden='true'
                        className={classNames('btn', 'btn-save')}
                        onClick={onSaveModal}
                    >
                        {appLang?.modal?.update}
                    </div>
                </div>
            </div>
        </div>
    );
}
