import { create } from 'zustand';

export interface IStore {
    isConnected: boolean;
    setIsConnected: any;
}

export const useStore = create<IStore>((set) => ({
    isConnected: false,
    setIsConnected: (bool: boolean) => set(() => ({ isConnected: bool }))
}));
