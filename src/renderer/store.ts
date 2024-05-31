import { create } from 'zustand';
import { getLang } from './lib/loaders';

export interface IStore {
    isConnected: boolean;
    setIsConnected: (bool: boolean) => void;
    isLoading: boolean;
    setIsLoading: (bool: boolean) => void;
    statusText: string;
    setStatusText: (status: string) => void;
}

const appLang = getLang();
export const useStore = create<IStore>((set) => ({
    isConnected: false,
    setIsConnected: (bool: boolean) => set(() => ({ isConnected: bool })),
    isLoading: false,
    setIsLoading: (bool: boolean) => set(() => ({ isLoading: bool })),
    statusText: appLang?.status?.disconnected,
    setStatusText: (status: string) => set(() => ({ statusText: status }))
}));
