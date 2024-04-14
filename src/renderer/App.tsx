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
import About from './pages/About';
import Debug from './pages/Debug';

export default function App() {
    useEffect(() => {
        let keysDown: any = {};
        window.addEventListener('keydown', function (event) {
            console.log('🚀 - event:', event);
            keysDown[event.keyCode] = true;

            // Check if Ctrl, Shift, and I keys are down at the same time
            if (keysDown[17] && keysDown[16] && keysDown[73]) {
                window.electron.ipcRenderer.sendMessage('open-devtools');
                // Clear the keysDown object after handling the desired keypress
                setTimeout(() => {
                    keysDown = {};
                }, 0);
            }
        });

        window.addEventListener('keyup', function (event) {
            delete keysDown[event.keyCode];
        });
    });
    return (
        <>
            <SplashScreen />
            <Router>
                <Routes>
                    <Route path='/' element={<Index />} />
                    <Route path='/settings' element={<Settings />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/debug' element={<Debug />} />
                </Routes>
            </Router>
        </>
    );
}
