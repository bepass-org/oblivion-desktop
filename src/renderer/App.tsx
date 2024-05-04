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
import { settings } from './lib/settings';
import { defaultSettings } from '../defaultSettings';
import { ipcRenderer } from './lib/utils';

export default function App() {
    useEffect(() => {
        // open devtools on dev enviroment by ctrl+shift+i
        let keysDown: any = {};
        window.addEventListener('keydown', function (event) {
            keysDown[event.keyCode] = true;
            // Check if Ctrl, Shift, and I keys are down at the same time
            if (keysDown[17] && keysDown[16] && keysDown[73]) {
                ipcRenderer.sendMessage('open-devtools');
                setTimeout(() => {
                    keysDown = {};
                }, 0);
            }
        });

        window.addEventListener('keyup', function (event) {
            delete keysDown[event.keyCode];
        });

        (async () => {
            document.documentElement.setAttribute(
                'data-bs-theme',
                (await settings.get('theme')) || defaultSettings.theme
            );
        })();
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
                </Routes>
            </Router>
        </>
    );
}
