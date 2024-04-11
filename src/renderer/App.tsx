import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './global.css';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';

import Index from './pages/Index';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </Router>
  );
}
