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
    | 'download-update'
    | 'download-progress';

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: Channels, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args);
        },
        on(channel: Channels, func: (...args: unknown[]) => void) {
            const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
            ipcRenderer.on(channel, subscription);
            //console.log(`Adding listener for ${channel}`);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
                //console.log(`Removed listener for ${channel}`);
            };
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
    username: process.env.USER || process.env.USERNAME || null
};

//ipcRenderer.setMaxListeners(20);

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
