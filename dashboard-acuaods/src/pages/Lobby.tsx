import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoSafeFish from '../assets/logo.png';

export const Lobby: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>{}
      <img src={logoSafeFish} alt="Logo SafeFish" style={{ width: '360px', marginBottom: '30px' }} />
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <button 
          onClick={() => navigate('/configuracion')}
          style={{ padding: '15px 30px', fontSize: '1.2em', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}
        >
          ▶ Nueva Simulación
        </button>
        <button 
          disabled
          style={{ padding: '15px 30px', fontSize: '1.2em', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold' }}
        >
          🔒 Cargar Simulación
        </button>
      </div>
    </div>
  );
};