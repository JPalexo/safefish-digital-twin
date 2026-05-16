import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMqttClient } from '../hooks/useMqttClient';
import { Navbar } from '../components/Navbar';
import { SensorCard } from '../components/SensorCard';
import { ControlSwitch } from '../components/ControlSwitch';
import { getEstadoO2, getEstadoTemp, getEstadoPPM } from '../utils/umbrales';
import { EstanqueVirtual } from './EstanqueVirtual'; // <--- Importamos nuestro Gemelo Visual

export const Dashboard = () => {
  // --- 1. HERRAMIENTAS DE NAVEGACIÓN Y CONEXIÓN ---
  const location = useLocation();
  const navigate = useNavigate();
  const { telemetria, conectado, enviarComando } = useMqttClient();
  
  // --- 2. RECUPERAR DATOS DEL WIZARD ---
  const biomasaTotal = location.state?.biomasaTotal || 0;
  const lotesConfigurados = location.state?.lotesConfigurados || [];
  const volumenEstanque = location.state?.volumenEstanque || 10;

  // Estado para desplegar el inventario de lotes
  const [showInventario, setShowInventario] = useState<boolean>(false);

  // Handshake inicial con el backend (Python)
  useEffect(() => {
    if (biomasaTotal === 0) {
      navigate('/configuracion');
    } else {
      enviarComando('Sistema', `iniciar:${biomasaTotal}:${volumenEstanque}`);
    }
  }, [biomasaTotal, volumenEstanque, navigate, enviarComando]);

  // --- 3. ESTADOS DE LA INTERFAZ ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [aireadorON, setAireadorON] = useState<boolean>(false);
  const [calentadorON, setCalentadorON] = useState<boolean>(false);
  const [filtroON, setFiltroON] = useState<boolean>(false);

  // --- 4. MANEJADORES DE ACTUADORES ---
  const toggleAireador = () => { 
    setAireadorON(!aireadorON); 
    enviarComando('Aireador', !aireadorON ? 'Encender' : 'Apagar'); 
  };
  const toggleCalentador = () => { 
    setCalentadorON(!calentadorON); 
    enviarComando('Calentador', !calentadorON ? 'Encender' : 'Apagar'); 
  };
  const toggleFiltro = () => { 
    setFiltroON(!filtroON); 
    enviarComando('Filtro', !filtroON ? 'Encender' : 'Apagar'); 
  };

  // --- 5. TEMA VISUAL INDUSTRIAL ---
  const theme = {
    bgApp: isDarkMode ? '#0b1120' : '#f8fafc',
    textTitle: isDarkMode ? '#f1f5f9' : '#0f172a',
    textMain: isDarkMode ? '#94a3b8' : '#475569',
    bgNavbar: isDarkMode ? '#1e293b' : '#ffffff',
    bgPanel: isDarkMode ? '#1e293b' : '#ffffff',
    border: isDarkMode ? '#334155' : '#e2e8f0',
  };

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: theme.bgApp, minHeight: '100vh', transition: 'background-color 0.3s' }}>
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <Navbar conectado={conectado} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} theme={theme} />

      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {telemetria ? (
          <>
            {/* ROW 1: TARJETAS DE TELEMETRÍA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <SensorCard titulo="OXÍGENO DISUELTO" valor={telemetria.oxigeno_mg_L.toFixed(1)} unidad="mg/L" estado={getEstadoO2(telemetria.oxigeno_mg_L)} theme={theme} />
              <SensorCard titulo="TEMPERATURA" valor={telemetria.temperatura_C.toFixed(1)} unidad="°C" estado={getEstadoTemp(telemetria.temperatura_C)} theme={theme} />
              <SensorCard titulo="TURBIDEZ" valor={telemetria.ppm.toFixed(1)} unidad="ppm" estado={getEstadoPPM(telemetria.ppm)} theme={theme} />
            </div>

            {/* ROW 2: CONTROLES (IZQUIERDA) VS ESTANQUE VIRTUAL (DERECHA) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              
              {/* COLUMNA IZQUIERDA: Contexto y Actuadores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Panel Acordeón de Biomasa */}
                <div style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div 
                    onClick={() => setShowInventario(!showInventario)}
                    style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'rgba(33, 150, 243, 0.05)', borderBottom: showInventario ? `1px solid ${theme.border}` : 'none' }}
                  >
                    <div>
                      <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Biomasa Activa</h3>
                      <p style={{ margin: '5px 0 0 0', color: theme.textTitle, fontSize: '1.4em', fontWeight: 'bold' }}>{biomasaTotal.toFixed(2)} kg</p>
                    </div>
                    <div style={{ color: theme.textMain, transform: showInventario ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                      ▼
                    </div>
                  </div>

                  {showInventario && (
                    <div style={{ padding: '15px', backgroundColor: theme.bgPanel }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.85em', color: theme.textMain }}>Volumen: {volumenEstanque} m³ ({volumenEstanque * 1000} L)</p>
                      {lotesConfigurados.map((lote: any, index: number) => (
                        <div key={index} style={{ padding: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #38bdf8' }}>
                          <strong style={{ display: 'block', color: theme.textTitle, fontSize: '0.95em' }}>Lote {index + 1}: {lote.etapa}</strong>
                          <span style={{ color: theme.textMain, fontSize: '0.85em' }}>{lote.cantidad} peces | {lote.pesoPromedio}g c/u</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel de Interruptores (Actuadores) */}
                <div style={{ padding: '25px', backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 25px 0', color: theme.textTitle, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Panel de Actuadores</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <ControlSwitch label="AIREADOR PRAL." isOn={aireadorON} onToggle={toggleAireador} activeColor="#2196F3" theme={theme} />
                    <ControlSwitch label="RESISTENCIA TÉRMICA" isOn={calentadorON} onToggle={toggleCalentador} activeColor="#ef4444" theme={theme} />
                    <ControlSwitch label="BOMBA DE FILTRADO" isOn={filtroON} onToggle={toggleFiltro} activeColor="#10b981" theme={theme} />
                  </div>
                </div>

              </div>

              {/* COLUMNA DERECHA: Animación del Gemelo Visual */}
              <div style={{ 
                backgroundColor: isDarkMode ? '#080c14' : '#e2e8f0', 
                border: `1px solid ${theme.border}`, 
                borderRadius: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px', 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <EstanqueVirtual 
                  biomasaKg={biomasaTotal}
                  oxigenoMgL={telemetria.oxigeno_mg_L}
                  temperaturaC={telemetria.temperatura_C}
                  isDarkMode={isDarkMode}
                />
              </div>

            </div>
          </>
        ) : (
          <div style={{ marginTop: '40px', padding: '40px', backgroundColor: theme.bgPanel, borderRadius: '12px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
            <p style={{ fontSize: '1.2em', color: theme.textMain, fontWeight: 'bold', letterSpacing: '1px' }}>INICIALIZANDO MOTOR FÍSICO...</p>
          </div>
        )}
      </div>
    </div>
  );
};