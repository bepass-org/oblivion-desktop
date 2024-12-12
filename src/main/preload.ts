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
    | 'netStats-command'
    | 'netStats-stats'
    | 'sb-terminate'
    | 'speed-test-command'
    | 'speed-test-results';

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: Channels, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args);
        },
        on(channel: Channels, func: (...args: unknown[]) => void) {
            const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
            ipcRenderer.on(channel, subscription);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        },
        once(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        }
    },
    NODE_ENV: process.env.NODE_ENV,
    platform: process.platform,
    username: process.env.USER || process.env.USERNAME || null
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
