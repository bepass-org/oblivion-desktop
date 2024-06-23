import React, { ChangeEvent, FC } from 'react';
import useTextarea from './useTextarea';

interface InputProps {
    id?: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    tabIndex?: number;
}

const Textarea: FC<InputProps> = ({ id, onChange, value, tabIndex = 0 }) => {
    const {
        contextMenuStyle,
        handleCloseContextMenu,
        handleContextMenu,
        handleCopy,
        handleCut,
        handlePaste,
        inputRef
    } = useTextarea(value, onChange);

    return (
        <>
            <textarea
                ref={inputRef}
                id={id}
                value={value}
                tabIndex={tabIndex}
                spellCheck={false}
                className='form-control'
                onChange={onChange}
                onContextMenu={handleContextMenu}
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

export default Textarea;
