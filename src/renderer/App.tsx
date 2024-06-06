import { MemoryRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';

import 'assets/css/bootstrap.min.css';
import 'assets/css/bootstrap-rtl.min.css';
import 'assets/css/shabnam.css';
import 'assets/css/materialIcons.css';
import 'assets/css/style.css';

import SplashScreen from './pages/SplashScreen';
import { openDevtoolsOnCtrlShiftI } from './lib/dx';
import { loadTheme } from './lib/loaders';
import AppRoutes from './routes';
import { getDirection, getLanguageName } from '../localization';

export default function App() {
    useEffect(() => {
        openDevtoolsOnCtrlShiftI();
        loadTheme();
        document.documentElement.setAttribute('lang', getLanguageName());
        document.documentElement.setAttribute('dir', getDirection());
    }, []);

    return (
        <>
            <SplashScreen />
            <Router>
                <AppRoutes />
            </Router>
        </>
    );
}
