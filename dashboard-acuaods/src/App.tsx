import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Lobby } from './pages/Lobby';
import { Wizard } from './pages/Wizard';
import { Dashboard } from './pages/Dashboard'; // Tu interfaz SCADA

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/configuracion" element={<Wizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;