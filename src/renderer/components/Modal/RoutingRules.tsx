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

    const validateRules = (textareaContent:string) => {
        if (textareaContent === "") {
            return "";
        }
        const lines = textareaContent.split('\n');
        const validEntriesSet = new Set(); // Use Set to store unique entries
        const entryRegex = /^(geoip|regexp|domain|geosite):(.+)$/;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                continue;
            }
            const lineWithoutQuotes = trimmedLine.replace(/"/g, '');
            const entry = lineWithoutQuotes.endsWith(',') ? lineWithoutQuotes.slice(0, -1) : lineWithoutQuotes;
            const cleanedEntry = entry.replace(/,+$/, '');
            const match = cleanedEntry.match(entryRegex);
            if (match) {
                validEntriesSet.add(cleanedEntry);
            } else {
                return false;
            }
        }
        const validEntries = Array.from(validEntriesSet);
        return validEntries.length > 0 ? validEntries.join(',\n') : validEntries;
    }

    const onSaveModal = () => {
        const checkRules = validateRules(routingRulesInput);
        if ( checkRules || checkRules === "") {
            setRoutingRules(checkRules);
            settings.set('routingRules', checkRules);
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
                        <h3>{title}</h3>
                        <textarea
                            value={routingRulesInput}
                            spellCheck={false}
                            className='form-control'
                            onChange={(e) => {
                                setRoutingRulesInput(e.target.value);
                            }}
                            placeholder={`regexp:.*\\.ir$\ndomain:dolat.ir,\ngeosite:apple,\ngeoip:ir`}
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
