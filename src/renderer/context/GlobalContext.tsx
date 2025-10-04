import React, { createContext, useContext, useEffect } from 'react';
import useOptions from '../pages/Network/useOptions';
import { openDevtoolsOnCtrlShiftI } from '../lib/dx';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';

const GlobalContext = createContext<ReturnType<typeof useOptions> | null>(null);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    const options = useOptions();
    openDevtoolsOnCtrlShiftI();
    useGoBackOnEscape();
    return <GlobalContext.Provider value={options}>{children}</GlobalContext.Provider>;
};

export const useOptionsContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useOptionsContext must be used within an <OptionsProvider>');
    }
    return context;
};
