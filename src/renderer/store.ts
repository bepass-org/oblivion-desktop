import { create } from 'zustand';
import { getTranslate } from '../localization';

export interface IStore {
    isConnected: boolean;
    setIsConnected: (bool: boolean) => void;
    isLoading: boolean;
    setIsLoading: (bool: boolean) => void;
    isCheckingForUpdates: boolean;
    setIsCheckingForUpdates: (bool: boolean) => void;
    hasNewUpdate: boolean;
    setHasNewUpdate: (bool: boolean) => void;
    statusText: string;
    setStatusText: (status: string) => void;
    proxyStatus: string;
    setProxyStatus: (status: string) => void;
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
    statusText: appLang.status.disconnected,
    setStatusText: (status: string) => set(() => ({ statusText: status })),
    proxyStatus: '',
    setProxyStatus: (status: string) => set(() => ({ proxyStatus: status }))
}));
