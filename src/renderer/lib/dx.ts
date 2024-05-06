// improves developer experience

import { ipcRenderer } from './utils';

export const openDevtoolsOnCtrlShiftI = () => {
    // open devtools on dev enviroment by ctrl+shift+i
    let keysDown: any = {};
    window.addEventListener('keydown', function (event) {
        keysDown[event.keyCode] = true;
        // Check if Ctrl, Shift, and I keys are down at the same time
        if (keysDown[17] && keysDown[16] && keysDown[73]) {
            ipcRenderer.sendMessage('open-devtools');
            setTimeout(() => {
                keysDown = {};
            }, 0);
        }
    });

    window.addEventListener('keyup', function (event) {
        delete keysDown[event.keyCode];
    });
};
