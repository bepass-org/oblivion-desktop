export const ipcRenderer = window.electron.ipcRenderer;

export const isDev = () => window.electron.nodeEnv === 'development';

export const exitOnCtrlW = () => {
    window.onbeforeunload = () => {
        ipcRenderer.sendMessage('exit');
    };
};
