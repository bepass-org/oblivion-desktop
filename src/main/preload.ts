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
        sendMessage(channel: Channels, ...args: any[]) {
            ipcRenderer.send(channel, ...args);
        },
        on(
            channel: Channels,
            func: (...args: any[]) => void
        ): (_event: Electron.IpcRendererEvent, ...args: any[]) => void {
            const subscription = (_event: IpcRendererEvent, ...args: any[]) => func(...args);
            ipcRenderer.on(channel, subscription);

            return subscription;
        },
        once(
            channel: Channels,
            func: (...args: any[]) => void
        ): (_event: Electron.IpcRendererEvent, ...args: any[]) => void {
            const subscription = (_event: IpcRendererEvent, ...args: any[]) => func(...args);
            ipcRenderer.once(channel, subscription);

            return subscription;
        },
        removeListener(channel: Channels, func: (...args: any[]) => void) {
            ipcRenderer.removeListener(channel, func);
        },
        removeAllListeners(channel: Channels) {
            ipcRenderer.removeAllListeners(channel);
        },
        invoke(channel: Channels, ...args: any[]) {
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
