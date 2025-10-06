import { create } from 'zustand';
import { getTranslate } from '../localization';
import { defaultSettings } from '../defaultSettings';

type DownloadProgress = {
    status: string;
    percent: number;
};

export interface IStore {
    isConnected: boolean;
    setIsConnected: (bool: boolean) => void;
    isLoading: boolean;
    setIsLoading: (bool: boolean) => void;
    isCheckingForUpdates: boolean;
    setIsCheckingForUpdates: (bool: boolean) => void;
    hasNewUpdate: boolean;
    setHasNewUpdate: (bool: boolean) => void;
    downloadProgress: DownloadProgress;
    setDownloadProgress: (status: DownloadProgress) => void;
    statusText: string;
    setStatusText: (status: string) => void;
    proxyStatus: string;
    setProxyStatus: (status: string) => void;
    proxyMode: string;
    setProxyMode: (mode: string) => void;
}

const appLang = getTranslate('en');
export const useStore = create<IStore>((set) => ({
    isConnected: false,
    setIsConnected: (bool: boolean) => set(() => ({ isConnected: bool })),
    isLoading: false,
    setIsLoading: (bool: boolean) => set(() => ({ isLoading: bool })),
    isCheckingForUpdates: false,
    setIsCheckingForUpdates: (bool: boolean) => set(() => ({ isCheckingForUpdates: bool })),
    hasNewUpdate: false,
    setHasNewUpdate: (bool: boolean) => set(() => ({ hasNewUpdate: bool })),
    downloadProgress: {
        status: 'pending',
        percent: 0
    },
    setDownloadProgress: (status: DownloadProgress) => set(() => ({ downloadProgress: status })),
    statusText: appLang.status.disconnected,
    setStatusText: (status: string) => set(() => ({ statusText: status })),
    proxyStatus: defaultSettings.proxyMode,
    setProxyStatus: (status: string) => set(() => ({ proxyStatus: status })),
    proxyMode: defaultSettings.proxyMode,
    setProxyMode: (status: string) => set(() => ({ proxyMode: status }))
}));
