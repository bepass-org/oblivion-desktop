import { create } from 'zustand';

export interface IStore {
    isConnected: boolean;
    setIsConnected: any;
    isLoading: boolean;
    setIsLoading: any;
    statusText: string;
    setStatusText: any;
}

export const useStore = create<IStore>((set) => ({
    isConnected: false,
    setIsConnected: (bool: boolean) => set(() => ({ isConnected: bool })),
    isLoading: false,
    setIsLoading: (bool: boolean) => set(() => ({ isLoading: bool })),
    statusText: 'متصل نیستید',
    setStatusText: (status: string) => set(() => ({ statusText: status }))
}));
