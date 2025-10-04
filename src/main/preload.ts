import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
    | 'ipc-example'
    | 'open-devtools'
    | 'wp-start'
    | 'wp-end'
    | 'get-logs'
    | 'settings'
    | 'guide-toast'
    | 'tray-icon'
    | 'tray-menu'
    | 'localization'
    | 'startup'
    | 'net-stats'
    | 'speed-test'
    | 'process-url'
    | 'new-update'
    | 'check-update'
    | 'download-progress'
    | 'local-ips'
    | 'change-proxy-mode'
    | 'tray-state';

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: Channels, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args);
        },
        on(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.on(channel, func);
        },
        once(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
        removeListener(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.removeListener(channel, func);
        },
        removeAllListeners(channel: Channels) {
            ipcRenderer.removeAllListeners(channel);
        },
        invoke(channel: Channels, ...args: unknown[]) {
            return ipcRenderer.invoke(channel, ...args);
        },
        clean() {
            ipcRenderer.removeAllListeners('settings');
            ipcRenderer.removeAllListeners('guide-toast');
            ipcRenderer.removeAllListeners('tray-menu');
            ipcRenderer.removeAllListeners('wp-start');
            ipcRenderer.removeAllListeners('wp-end');
            ipcRenderer.removeAllListeners('net-stats');
        }
    },
    NODE_ENV: process.env.NODE_ENV,
    platform: process.platform,
    username: process.env.USER || process.env.USERNAME || null,
    arch: process.arch
};

//ipcRenderer.setMaxListeners(20);

contextBridge.exposeInMainWorld('electron', electronHandler);

contextBridge.exposeInMainWorld('platformAPI', {
    getPlatform: () => process.platform
});

export type ElectronHandler = typeof electronHandler;
