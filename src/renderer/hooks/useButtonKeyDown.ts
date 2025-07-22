import { KeyboardEvent, useCallback } from 'react';

const useButtonKeyDown = (func: () => void) => {
    return useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                func();
            }
        },
        [func]
    );
};
export default useButtonKeyDown;
