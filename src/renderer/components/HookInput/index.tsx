import React, { ChangeEvent } from 'react';

interface HookInputProps {
    label: string;
    description: string;
    executableValue: string;
    argsValue: string;
    onExecutableChange: (value: string) => void;
    onArgsChange: (value: string) => void;
    onBrowse: () => void;
    argsLabel: string;
    argsDescription: string;
    browseLabel: string;
    hookType: string;
    executablePlaceholder?: string;
    argsPlaceholder?: string;
}

const HookInput: React.FC<HookInputProps> = ({
    label,
    description,
    executableValue,
    argsValue,
    onExecutableChange,
    onArgsChange,
    onBrowse,
    argsLabel,
    argsDescription,
    browseLabel,
    hookType,
    executablePlaceholder = 'Path to executable',
    argsPlaceholder = 'Optional command line arguments'
}) => {
    const handleExecutableChange = (e: ChangeEvent<HTMLInputElement>) => {
        onExecutableChange(e.target.value);
    };

    const handleArgsChange = (e: ChangeEvent<HTMLInputElement>) => {
        onArgsChange(e.target.value);
    };

    const executableId = `hook-executable-${hookType}`;
    const argsId = `hook-args-${hookType}`;

    return (
        <>
            <div className='item'>
                <label className='key' htmlFor={executableId}>
                    {label}
                </label>
                <div className='value hook-input-group'>
                    <input
                        id={executableId}
                        type='text'
                        value={executableValue}
                        onChange={handleExecutableChange}
                        placeholder={executablePlaceholder}
                        className='hook-executable-input'
                    />
                    <button type='button' onClick={onBrowse} className='hook-browse-button'>
                        {browseLabel}
                    </button>
                </div>
                <div className='info'>{description}</div>
            </div>
            <div className='item'>
                <label className='key' htmlFor={argsId}>
                    {argsLabel}
                </label>
                <div className='value'>
                    <input
                        id={argsId}
                        type='text'
                        value={argsValue}
                        onChange={handleArgsChange}
                        placeholder={argsPlaceholder}
                        className='hook-args-input'
                    />
                </div>
                <div className='info'>{argsDescription}</div>
            </div>
        </>
    );
};

export default HookInput;
