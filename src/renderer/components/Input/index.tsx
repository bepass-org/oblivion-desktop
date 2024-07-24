import React, { ChangeEvent, FC } from 'react';
import useInput from './useInput';

interface InputProps {
    id?: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    tabIndex?: number;
    type?: string;
    placeholder?: string;
}

const Input: FC<InputProps> = ({ id, onChange, value, tabIndex = 0, type = 'text', placeholder='' }) => {
    const {
        contextMenuStyle,
        handleCloseContextMenu,
        handleContextMenu,
        handleCopy,
        handleCut,
        handlePaste,
        inputRef
    } = useInput(value, onChange);
    return (
        <>
            <input
                ref={inputRef}
                id={id}
                value={value}
                tabIndex={tabIndex}
                spellCheck={false}
                className='form-control'
                onChange={onChange}
                onContextMenu={handleContextMenu}
                placeholder={placeholder}
                type={type}
            />
            {contextMenuStyle && (
                <div
                    role='presentation'
                    className='contextMenu'
                    style={{
                        position: 'fixed',
                        left: contextMenuStyle.left,
                        top: contextMenuStyle.top
                    }}
                    onClick={handleCloseContextMenu}
                >
                    <div className='menuItem' onClick={handleCopy} role='presentation'>
                        Copy
                    </div>
                    <div className='menuItem' onClick={handleCut} role='presentation'>
                        Cut
                    </div>
                    <div className='menuItem' onClick={handlePaste} role='presentation'>
                        Paste
                    </div>
                </div>
            )}
        </>
    );
};

export default Input;
