import { Route, Routes } from 'react-router-dom';

import Landing from '../pages/Landing';
import Settings from '../pages/Settings';
import Options from '../pages/Options';
import About from '../pages/About';
import Debug from '../pages/Debug';
import Scanner from '../pages/Scanner';
import Network from '../pages/Network';
import Speed from '../pages/SpeedTest';
import SingBox from '../pages/SingBox';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/options' element={<Options />} />
            <Route path='/about' element={<About />} />
            <Route path='/debug' element={<Debug />} />
            <Route path='/scanner' element={<Scanner />} />
            <Route path='/network' element={<Network />} />
            <Route path='/speed' element={<Speed />} />
            <Route path='/singBox' element={<SingBox />} />
        </Routes>
    );
};

export default AppRoutes;
