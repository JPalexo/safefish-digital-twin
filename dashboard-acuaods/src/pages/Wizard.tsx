import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface LotePeces {
  id: number;
  etapa: string;
  cantidad: number;
  pesoPromedio: number;
  edadSemanas: number;
}

export const Wizard: React.FC = () => {
  const navigate = useNavigate();
  
  const [lotes, setLotes] = useState<LotePeces[]>([]);
  const [volumen, setVolumen] = useState<number | ''>(10); // Por defecto 10 m3 (10,000 Litros)

  const [etapa, setEtapa] = useState('Alevín');
  const [cantidad, setCantidad] = useState<number | ''>('');
  const [peso, setPeso] = useState<number | ''>('');
  const [edad, setEdad] = useState<number | ''>('');

  const agregarLote = () => {
    if (cantidad && peso && edad) {
      const nuevoLote: LotePeces = {
        id: Date.now(),
        etapa,
        cantidad: Number(cantidad),
        pesoPromedio: Number(peso),
        edadSemanas: Number(edad)
      };
      setLotes([...lotes, nuevoLote]);
      setCantidad(''); setPeso(''); setEdad('');
    } else {
      alert("Por favor, llena todos los campos numéricos del lote.");
    }
  };

  const eliminarLote = (id: number) => {
    setLotes(lotes.filter(lote => lote.id !== id));
  };

  const biomasaTotalKg = lotes.reduce((total, lote) => {
    return total + (lote.cantidad * lote.pesoPromedio) / 1000;
  }, 0);

  const iniciarSimulacion = () => {
    if (lotes.length === 0) {
      alert("Debes agregar al menos un lote de peces para simular.");
      return;
    }
    if (!volumen || volumen <= 0) {
      alert("Por favor, ingresa un volumen válido para el estanque.");
      return;
    }
    // Pasamos lotes, biomasa y el volumen al dashboard
    navigate('/dashboard', { state: { lotesConfigurados: lotes, biomasaTotal: biomasaTotalKg, volumenEstanque: volumen } });
  };

  // ESTILOS REUTILIZABLES
  const inputStyle = {
    width: '100%', padding: '12px 15px', borderRadius: '8px', 
    border: '1px solid #cbd5e1', backgroundColor: '#ffffff', 
    color: '#1e293b', fontSize: '1em', outline: 'none', 
    boxSizing: 'border-box' as const, transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.85em', fontWeight: 'bold', 
    color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' as const, 
    letterSpacing: '0.5px'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '50px 20px', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* ENCABEZADO */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#0f172a', fontSize: '2.5em', margin: '0 0 10px 0', fontWeight: '800' }}>Configuración del Estanque</h1>
          <p style={{ color: '#64748b', fontSize: '1.1em', margin: 0 }}>Parametriza la biomasa y el volumen para el motor físico.</p>
        </div>

        {/* PARÁMETROS GENERALES DEL ESTANQUE */}
        <div style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.2em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🌊 Entorno Físico
          </h3>
          <div style={{ maxWidth: '300px' }}>
            <label style={labelStyle}>Volumen de Agua (m³)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                placeholder="Ej. 10"
                value={volumen}
                onChange={(e) => {
                  const val = e.target.value;
                  setVolumen(val === '' ? '' : Number(val));
                }}
                style={{ ...inputStyle, paddingRight: '45px' }}
              />
              <span style={{ position: 'absolute', right: '15px', top: '12px', color: '#94a3b8', fontWeight: 'bold' }}>m³</span>
            </div>
            <p style={{ fontSize: '0.8em', color: '#94a3b8', marginTop: '8px' }}>1 m³ = 1,000 Litros. Estándar: 10 a 50 m³.</p>
          </div>
        </div>
        
        {/* FORMULARIO DE INGRESO DE LOTES */}
        <div style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.2em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🐟 Agregar Lote de Peces
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Etapa</label>
              <select value={etapa} onChange={(e) => setEtapa(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
                <option value="Alevín">Alevín</option>
                <option value="Juvenil">Juvenil</option>
                <option value="Engorda">Engorda</option>
                <option value="Cosecha">Cosecha</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Cantidad</label>
              <input type="number" placeholder="Ej. 1000" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Peso c/u (g)</label>
              <input type="number" placeholder="Ej. 50" value={peso} onChange={(e) => setPeso(Number(e.target.value))} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Edad (Sem)</label>
              <input type="number" placeholder="Ej. 4" value={edad} onChange={(e) => setEdad(Number(e.target.value))} style={inputStyle} />
            </div>

            <button onClick={agregarLote} style={{ padding: '12px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(33, 150, 243, 0.3)' }}>
              + Agregar
            </button>
          </div>
        </div>

        {/* LISTA DE LOTES AGREGADOS */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.2em' }}>Inventario de Biomasa</h3>
          {lotes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', margin: 0, fontSize: '1.1em' }}>No hay biomasa registrada. Agrega un lote arriba.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {lotes.map((lote) => (
                <div key={lote.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#ffffff', borderLeft: '5px solid #4caf50', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ fontSize: '1.2em', color: '#0f172a', display: 'block', marginBottom: '5px' }}>Lote: {lote.etapa}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.95em' }}>
                      <b style={{color: '#334155'}}>{lote.cantidad}</b> individuos &nbsp;|&nbsp; 
                      <b style={{color: '#334155'}}>{lote.pesoPromedio}g</b> promedio &nbsp;|&nbsp; 
                      <b style={{color: '#334155'}}>{lote.edadSemanas}</b> semanas
                    </span>
                  </div>
                  <button onClick={() => eliminarLote(lote.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2em', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s' }} title="Eliminar lote">
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BARRA DE ACCIÓN FINAL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 30px', backgroundColor: '#1e293b', borderRadius: '16px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
          <div>
            <span style={{ fontSize: '0.85em', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Carga Biológica Total</span>
            <p style={{ fontSize: '2.2em', margin: '5px 0 0 0', fontWeight: '800', color: '#38bdf8' }}>{biomasaTotalKg.toFixed(2)} <span style={{fontSize: '0.5em', fontWeight: 'normal', color: '#e2e8f0'}}>kg</span></p>
          </div>
          
          <button 
            onClick={iniciarSimulacion}
            style={{ padding: '16px 35px', fontSize: '1.1em', backgroundColor: lotes.length > 0 ? '#4caf50' : '#475569', color: 'white', border: 'none', borderRadius: '10px', cursor: lotes.length > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold', transition: '0.3s', boxShadow: lotes.length > 0 ? '0 4px 15px rgba(76, 175, 80, 0.4)' : 'none' }}
          >
            ▶ Iniciar Simulación HMI
          </button>
        </div>

      </div>
    </div>
  );
};