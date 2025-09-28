// improves developer experience

import { ipcRenderer } from './utils';

export const openDevtoolsOnCtrlShiftI = () => {
    // open devtools on dev environment by ctrl+shift+i
    window.addEventListener('keydown', function (event) {
        // Check if Ctrl, Shift, and I keys are down at the same time
        if (event.ctrlKey && event.shiftKey && event.code == "KeyI") {
            ipcRenderer.sendMessage('open-devtools');
        }
    });
};
