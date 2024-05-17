export const { ipcRenderer, platform, NODE_ENV } = window.electron;

export const isDev = () => window.electron.NODE_ENV === 'development';

export const onEscapeKeyPressed = (callback = () => {}) => {
    document.body.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            callback();
        }
    });
};
