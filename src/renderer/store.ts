import { create } from 'zustand';
import { getLang } from './lib/loaders';

export interface IStore {
    isConnected: boolean;
    setIsConnected: any;
    isLoading: boolean;
    setIsLoading: any;
    statusText: string;
    setStatusText: any;
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
