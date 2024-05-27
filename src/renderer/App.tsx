import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import 'assets/css/bootstrap.min.css';
import 'assets/css/bootstrap-rtl.min.css';
import 'assets/css/shabnam.css';
import 'assets/css/materialIcons.css';
import 'assets/css/style.css';

import Index from './pages/Index';
import SplashScreen from './pages/SplashScreen';
import Settings from './pages/Settings';
import Options from './pages/Options';
import About from './pages/About';
import Debug from './pages/Debug';
import Scanner from './pages/Scanner';
import Network from './pages/Network';
import { openDevtoolsOnCtrlShiftI } from './lib/dx';
import { loadLang, loadTheme } from './lib/loaders';

export default function App() {
    useEffect(() => {
        openDevtoolsOnCtrlShiftI();
        loadTheme();
        loadLang();
    }, []);

    return (
        <>
            <SplashScreen />
            <Router>
                <Routes>
                    <Route path='/' element={<Index />} />
                    <Route path='/settings' element={<Settings />} />
                    <Route path='/options' element={<Options />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/debug' element={<Debug />} />
                    <Route path='/scanner' element={<Scanner />} />
                    <Route path='/network' element={<Network />} />
                </Routes>
            </Router>
        </>
    );
}
