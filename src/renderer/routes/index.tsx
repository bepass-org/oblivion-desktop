import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Index from '../pages/Index';
import Settings from '../pages/Settings';
import Options from '../pages/Options';
import About from '../pages/About';
import Debug from '../pages/Debug';
import Scanner from '../pages/Scanner';
import Network from '../pages/Network';

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode='wait'>
            <Routes location={location} key={location.pathname}>
                <Route path='/' element={<Index />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/options' element={<Options />} />
                <Route path='/about' element={<About />} />
                <Route path='/debug' element={<Debug />} />
                <Route path='/scanner' element={<Scanner />} />
                <Route path='/network' element={<Network />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
