import React, { ChangeEvent, FC, useState, useEffect, useRef, useCallback } from 'react';

interface InputProps {
    id?: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    tabIndex?: number;
}

type ContextMenuStyleType = {
    left: number;
    top: number;
};

const Textarea: FC<InputProps> = ({ id, onChange, value, tabIndex = 0 }) => {
    const [contextMenuStyle, setContextMenuStyle] = useState<ContextMenuStyleType | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setContextMenuStyle(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleContextMenu = useCallback((event: React.MouseEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        event.stopPropagation();
        /*const inputElement = event.currentTarget;
    inputElement.select();*/

        const positionX = event.clientX;
        const positionY = event.clientY;
        const menuWidth = 100;
        const menuHeight = 100;
        const maxX = window.innerWidth - menuWidth;
        const maxY = window.innerHeight - menuHeight;
        const left = Math.min(positionX, maxX);
        const top = Math.min(positionY, maxY);

        setContextMenuStyle({ left, top });
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            const selectedText = inputRef.current?.value.substring(
                inputRef?.current.selectionStart,
                inputRef.current.selectionEnd
            );
            if (selectedText) {
                await navigator.clipboard.writeText(selectedText);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        setContextMenuStyle(null);
    }, [inputRef]);

    const handleCut = useCallback(async () => {
        try {
            const selectionStart = inputRef.current?.selectionStart || 0;
            const selectionEnd = inputRef.current?.selectionEnd || 0;
            const selectedText = inputRef.current?.value.substring(selectionStart, selectionEnd);
            if (selectedText) {
                await navigator.clipboard.writeText(selectedText);
                const newValue = value.substring(0, selectionStart) + value.substring(selectionEnd);
                onChange({ target: { value: newValue } } as ChangeEvent<HTMLTextAreaElement>);
            }
        } catch (err) {
            console.error('Failed to cut:', err);
        }
        setContextMenuStyle(null);
    }, [value, onChange, inputRef]);

    const handlePaste = useCallback(async () => {
        try {
            const selectionStart = inputRef.current?.selectionStart || 0;
            const selectionEnd = inputRef.current?.selectionEnd || 0;

            const text = await navigator.clipboard.readText();
            const newValue =
                value.substring(0, selectionStart) + text + value.substring(selectionEnd);
            onChange({ target: { value: newValue } } as ChangeEvent<HTMLTextAreaElement>);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
        setContextMenuStyle(null);
    }, [value, onChange, inputRef]);

    const handleCloseContextMenu = useCallback(() => {
        setContextMenuStyle(null);
    }, []);

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
