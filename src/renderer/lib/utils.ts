export const ipcRenderer = window.electron.ipcRenderer;

export const isDev = () => window.electron.nodeEnv === 'development';
