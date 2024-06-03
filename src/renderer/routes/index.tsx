import { Route, Routes } from 'react-router-dom';

import Index from '../pages/Index';
import Settings from '../pages/Settings';
import Options from '../pages/Options';
import About from '../pages/About';
import Debug from '../pages/Debug';
import Scanner from '../pages/Scanner';
import Network from '../pages/Network/Network';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/options' element={<Options />} />
            <Route path='/about' element={<About />} />
            <Route path='/debug' element={<Debug />} />
            <Route path='/scanner' element={<Scanner />} />
            <Route path='/network' element={<Network />} />
        </Routes>
    );
};

export default AppRoutes;
