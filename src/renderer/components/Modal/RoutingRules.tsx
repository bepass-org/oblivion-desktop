import classNames from 'classnames';
import { settings } from '../../lib/settings';
import { useState } from 'react';

export default function RoutingRulesModal({
    title,
    isOpen,
    onClose,
    routingRules,
    setRoutingRules,
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    routingRules: any;
    setRoutingRules: any;
}) {
    if (!isOpen) return null;
    const [routingRulesInput, setRoutingRulesInput] = useState(routingRules);

    const validateRules = (textareaContent: string) => {
        if (textareaContent === "") {
            return false;
        }
        const lines = textareaContent.split('\n');
        const validEntriesSet = new Set();
        const entryRegex = /^(geoip|regexp|domain|geosite):(.+)$/;
        const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
        const ipRangeRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                continue;
            }
            const lineWithoutQuotes = trimmedLine.replace(/['"]/g, '');
            const entry = lineWithoutQuotes.endsWith(',') ? lineWithoutQuotes.slice(0, -1) : lineWithoutQuotes;
            const cleanedEntry = entry.replace(/,+$/, '');
            const match = cleanedEntry.match(entryRegex);
            const ipMatch = cleanedEntry.match(ipRegex);
            const ipRangeMatch = cleanedEntry.match(ipRangeRegex);
            if (match || ipMatch || ipRangeMatch) {
                validEntriesSet.add(cleanedEntry);
            }
        }
        const validEntries = Array.from(validEntriesSet);
        return validEntries.length > 0 ? validEntries.join(',\n') : validEntries;
    }

    const onSaveModal = () => {
        const checkRules = validateRules(routingRulesInput);
        if ( checkRules ) {
            setRoutingRules(checkRules);
            settings.set('routingRules', checkRules);
        }
        else {
            setRoutingRules("");
            settings.set('routingRules', "");
        }
        onClose();
    };

    return (
        <>
            <div className='dialog'>
                <div className='dialogBg' onClick={onClose} />
                <div className='dialogBox'>
                    <div className='container'>
                        <div className='line'>
                            <div className='miniLine' />
                        </div>
                        <h3>
                            {title}
                            <div className='labels'>
                                <div
                                    className={classNames(
                                        "label",
                                        "label-warning",
                                        "pull-right",
                                        (routingRulesInput === "" ? "" : "hidden"),
                                    )}
                                    onClick={(e) => {
                                        setRoutingRulesInput(`regexp:.*\\.ir$\ndomain:dolat.ir,\ngeosite:apple,\ngeoip:ir`);
                                    }}
                                >
                                    <i className='material-icons'>&#xe145;</i>
                                    نمونه
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
                        <div className={classNames('btn', 'btn-cancel')} onClick={onClose}>
                            انصراف
                        </div>
                        <div
                            className={classNames('btn', 'btn-save')}
                            onClick={() => {
                                onSaveModal();
                            }}
                        >
                            بروزرسانی
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
