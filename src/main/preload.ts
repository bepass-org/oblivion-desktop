import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { platform } from 'os';

export type Channels =
    | 'ipc-example'
    | 'open-devtools'
    | 'wp-start'
    | 'wp-end'
    | 'getLogs'
    | 'settings'
    | 'guide-toast'
    | 'exit';

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
    platform: process.platform
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
