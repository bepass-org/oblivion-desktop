import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

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
