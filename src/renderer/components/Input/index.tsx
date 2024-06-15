import React, { ChangeEvent, FC, useState, useEffect, useRef } from 'react';

interface InputProps {
    id?: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    tabIndex?: number;
    type?: string;
}

const Input: FC<InputProps> = ({ id, onChange, value, tabIndex = 0, type = 'text' }) => {
    const [contextMenuStyle, setContextMenuStyle] = useState<{ left: number; top: number } | null>(
        null
    );
    const inputRef = useRef<any>(null);

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

    const handleContextMenu = (event: React.MouseEvent<HTMLInputElement>) => {
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
    };

    const handleCopy = async () => {
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
    };

    const handleCut = async () => {
        try {
            const selectedText = inputRef.current?.value.substring(
                inputRef.current.selectionStart,
                inputRef.current.selectionEnd
            );
            if (selectedText) {
                await navigator.clipboard.writeText(selectedText);
                const newValue =
                    value.substring(0, inputRef.current.selectionStart) +
                    value.substring(inputRef.current.selectionEnd);
                onChange({ target: { value: newValue } } as ChangeEvent<HTMLInputElement>);
            }
        } catch (err) {
            console.error('Failed to cut:', err);
        }
        setContextMenuStyle(null);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const selectionStart = inputRef.current.selectionStart;
            const selectionEnd = inputRef.current.selectionEnd;
            const newValue =
                value.substring(0, selectionStart) + text + value.substring(selectionEnd);
            onChange({ target: { value: newValue } } as ChangeEvent<HTMLInputElement>);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
        setContextMenuStyle(null);
    };

    const handleCloseContextMenu = () => {
        setContextMenuStyle(null);
    };

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
                type={type}
            />
            {contextMenuStyle && (
                <div
                    className='contextMenu'
                    style={{
                        position: 'fixed',
                        left: contextMenuStyle.left,
                        top: contextMenuStyle.top
                    }}
                    onClick={handleCloseContextMenu}
                >
                    <div className='menuItem' onClick={handleCopy}>
                        Copy
                    </div>
                    <div className='menuItem' onClick={handleCut}>
                        Cut
                    </div>
                    <div className='menuItem' onClick={handlePaste}>
                        Paste
                    </div>
                </div>
            )}
        </>
    );
};

export default Input;
