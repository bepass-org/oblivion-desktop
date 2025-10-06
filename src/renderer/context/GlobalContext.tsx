import React from 'react';
import { openDevtoolsOnCtrlShiftI } from '../lib/dx';
import useGoBackOnEscape from '../hooks/useGoBackOnEscape';
import globalEvents from '../lib/globalEvents';

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    globalEvents();
    openDevtoolsOnCtrlShiftI();
    useGoBackOnEscape();
    return <>{children}</>;
};
