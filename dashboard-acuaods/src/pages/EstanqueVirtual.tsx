// src/pages/EstanqueVirtual.tsx
import React, { useMemo } from 'react';

interface EstanqueVirtualProps {
  biomasaKg: number;
  oxigenoMgL: number;
  temperaturaC: number;
  isDarkMode: boolean;
}

export const EstanqueVirtual: React.FC<EstanqueVirtualProps> = ({ 
  biomasaKg, oxigenoMgL, temperaturaC, isDarkMode 
}) => {
  
  // 1. LÓGICA DE DENSIDAD
  const numPeces = useMemo(() => {
    if (biomasaKg === 0) return 0;
    const calculado = Math.min(12, Math.max(3, Math.round(biomasaKg / 20))); 
    return calculado;
  }, [biomasaKg]);

  // 2. LÓGICA DE ESTRÉS
  const estadoPeces = useMemo(() => {
    const criticoO2 = oxigenoMgL < 3.0; 
    const criticoTemp = temperaturaC > 30.0; 

    return {
      posicionVertical: criticoO2 ? '15%' : '50%',
      duracionNado: criticoTemp ? '15s' : criticoO2 ? '4s' : '9s',
      tipoNado: criticoO2 ? 'linear' : 'ease-in-out',
      color: criticoTemp ? '#ff9800' : isDarkMode ? '#94a3b8' : '#4a5568',
      claseStress: criticoO2 ? 'panic' : 'calm'
    };
  }, [oxigenoMgL, temperaturaC, isDarkMode]);

  if (numPeces === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '0.9em' }}>Esperando biomasa...</p>;
  }

  const FishSVG = ({ color }: { color: string }) => (
    <svg width="30" height="20" viewBox="0 0 100 60" fill={color} style={{ transition: 'fill 0.5s', display: 'block' }}>
      <path d="M10,30 C10,10 50,10 70,20 L95,5 L95,55 L70,40 C50,50 10,50 10,30 Z"/>
    </svg>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* Siluetas generadas */}
      {[...Array(numPeces)].map((_, i) => (
        <div 
          key={i} 
          className={`fish-container ${estadoPeces.claseStress}`}
          style={{
            position: 'absolute',
            top: `calc(${estadoPeces.posicionVertical} + ${Math.random() * 10}%)`, 
            left: `${Math.random() * 70}%`,
            animationDuration: estadoPeces.duracionNado,
            animationTimingFunction: estadoPeces.tipoNado,
            animationDelay: `${Math.random() * -10}s`,
            opacity: isDarkMode ? 0.8 : 0.6,
          } as React.CSSProperties}
        >
          <FishSVG color={estadoPeces.color} />
        </div>
      ))}

      {/* Etiquetas de estado visual (CORREGIDAS: Sin depender de "theme") */}
      <div style={{ position: 'absolute', bottom: '15px', left: '20px', fontSize: '0.75em', color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Densidad Poblacional: <b style={{color: isDarkMode ? '#f1f5f9' : '#0f172a', marginLeft: '5px'}}>{numPeces} Siluetas</b>
      </div>
    </div>
  );
};