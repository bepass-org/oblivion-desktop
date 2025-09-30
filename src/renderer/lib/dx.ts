// improves developer experience

import { useEffect } from 'react';
import { ipcRenderer } from './utils';

export const openDevtoolsOnCtrlShiftI = () => {
    useEffect(() => {
        // open devtools on dev environment by ctrl+shift+i
        function onKeyDown(event: KeyboardEvent) {
            // Check if Ctrl, Shift, and I keys are down at the same time
            if (event.ctrlKey && event.shiftKey && event.code == 'KeyI') {
                ipcRenderer.sendMessage('open-devtools');
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);
};
