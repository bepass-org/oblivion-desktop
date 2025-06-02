import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

type ContextMenuStyleType = {
    left: number;
    top: number;
};

const useInput = (value: string, onChange: (event: ChangeEvent<HTMLInputElement>) => void) => {
    const [contextMenuStyle, setContextMenuStyle] = useState<ContextMenuStyleType | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleContextMenu = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
        event.preventDefault();
        event.stopPropagation();
        /*const inputElement = event.currentTarget;
        inputElement.select();*/

        const positionX = event.clientX;
        const positionY = event.clientY;
        const menuWidth = 100;
        const menuHeight = 100;
        const maxX = window.innerWidth - menuWidth;
        const parent = inputRef.current?.offsetParent as HTMLElement;
        const parentHeight = parent?.clientHeight ?? 0; 
        const maxY = parentHeight + 15 - menuHeight;
        const left = Math.min(positionX, maxX);
        const top = Math.min(positionY, maxY);

        setContextMenuStyle({ left, top });
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            const selectedText = inputRef.current?.value.substring(
                inputRef.current?.selectionStart || 0,
                inputRef.current?.selectionEnd || 0
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
                onChange({ target: { value: newValue } } as ChangeEvent<HTMLInputElement>);
            }
        } catch (err) {
            console.error('Failed to cut:', err);
        }
        setContextMenuStyle(null);
    }, [value, onChange, inputRef]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            const selectionStart = inputRef.current?.selectionStart || 0;
            const selectionEnd = inputRef.current?.selectionEnd || 0;
            const newValue =
                value.substring(0, selectionStart) + text + value.substring(selectionEnd);
            onChange({ target: { value: newValue } } as ChangeEvent<HTMLInputElement>);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
        setContextMenuStyle(null);
    }, [value, onChange, inputRef]);

    const handleCloseContextMenu = useCallback(() => {
        setContextMenuStyle(null);
    }, []);

    return {
        inputRef,
        contextMenuStyle,
        handleContextMenu,
        handleCopy,
        handleCut,
        handlePaste,
        handleCloseContextMenu
    };
};
export default useInput;
