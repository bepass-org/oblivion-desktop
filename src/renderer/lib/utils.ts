export const { ipcRenderer, platform, NODE_ENV, username, arch } = window.electron;

export const isDev = () => window.electron.NODE_ENV === 'development';

export const onEscapeKeyPressed = (callback: Function) => {
    function onKeyDown(event: KeyboardEvent) {
        if (event.code == 'Escape') {
            callback();
        }
    }
    document.body.addEventListener('keydown', onKeyDown);
    return onKeyDown;
};
