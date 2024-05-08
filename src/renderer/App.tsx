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
import Routing from './pages/Routing';
import About from './pages/About';
import Debug from './pages/Debug';
import SpeedTest from './pages/SpeedTest';
import { openDevtoolsOnCtrlShiftI } from './lib/dx';
import { loadTheme } from './lib/loaders';
import { quitOnCtrlW } from './lib/utils';

export default function App() {
    useEffect(() => {
        openDevtoolsOnCtrlShiftI();
        loadTheme();
        quitOnCtrlW();
    }, []);

    return (
        <>
            <SplashScreen />
            <Router>
                <Routes>
                    <Route path='/' element={<Index />} />
                    <Route path='/settings' element={<Settings />} />
                    <Route path='/options' element={<Options />} />
                    <Route path='/routing' element={<Routing />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/debug' element={<Debug />} />
                    <Route path='/speed' element={<SpeedTest />} />
                </Routes>
            </Router>
        </>
    );
}
