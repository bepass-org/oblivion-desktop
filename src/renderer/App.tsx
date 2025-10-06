import { MemoryRouter as Router } from 'react-router';
import { useEffect } from 'react';

import 'assets/css/bootstrap.min.css';
import 'assets/css/bootstrap-rtl.min.css';
import 'assets/css/shabnam.css';
import 'assets/css/materialIcons.css';
import 'assets/css/noto.css';
import 'assets/css/style.css';

import SplashScreen from './pages/SplashScreen';
import { loadLang, loadTheme, loadSettings } from './lib/loaders';
import { getIspName } from './lib/getIspName';
import AppRoutes from './routes';

export default function App() {
    useEffect(() => {
        loadTheme();
        loadLang();
        loadSettings();
        getIspName();
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
