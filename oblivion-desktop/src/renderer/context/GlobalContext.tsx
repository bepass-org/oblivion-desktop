import React, { createContext, useContext, useEffect } from 'react';
import { ipcRenderer } from '../lib/utils';
import useOptions from '../pages/Network/useOptions';

const GlobalContext = createContext<ReturnType<typeof useOptions> | null>(null);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    const options = useOptions();
    useEffect(() => {
        ipcRenderer.on('change-proxy-mode', (value: any) => {
            options.onChangeProxyMode(value);
        });
    }, []);
    return <GlobalContext.Provider value={options}>{children}</GlobalContext.Provider>;
};

export const useOptionsContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useOptionsContext must be used within an <OptionsProvider>');
    }
    return context;
};
