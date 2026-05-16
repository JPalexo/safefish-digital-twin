import React from 'react';
import logoSafeFish from '../assets/logo.png'; // Asegúrate que la ruta coincida con tu logo

interface NavbarProps {
  conectado: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: any;
}

export const Navbar: React.FC<NavbarProps> = ({ conectado, isDarkMode, toggleTheme, theme }) => {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: theme.bgNavbar, boxShadow: theme.shadow, position: 'sticky', top: 0, zIndex: 100 }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src={logoSafeFish} alt="Logo" style={{ width: '65px', height: '65px', objectFit: 'contain' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: conectado ? '#4caf50' : '#f44336', boxShadow: conectado ? '0 0 10px #4caf50' : '0 0 10px #f44336' }}></div>
          <span style={{ fontSize: '0.9em', color: theme.textMain, fontWeight: 'bold' }}>
            {conectado ? 'SISTEMA EN LÍNEA' : 'DESCONECTADO'}
          </span>
        </div>
        
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', color: theme.textTitle }}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};