// src/components/SensorCard.tsx
import React from 'react';
import type { EstadoUmbral } from '../types';

interface SensorCardProps {
  titulo: string;
  valor: string;
  unidad: string;
  estado: EstadoUmbral;
  theme: any;
}

export const SensorCard: React.FC<SensorCardProps> = ({ titulo, valor, unidad, estado, theme }) => {
  return (
    <div style={{ 
      padding: '25px', 
      borderRadius: '15px', 
      backgroundColor: estado.color, 
      flex: '1 1 250px', 
      textAlign: 'center', 
      color: 'white', 
      boxShadow: theme.shadow, 
      transition: '0.3s' 
    }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'normal' }}>{titulo}</h2>
      <p style={{ fontSize: '3em', margin: '0', fontWeight: 'bold' }}>
        {valor} <span style={{ fontSize: '0.4em', fontWeight: 'normal' }}>{unidad}</span>
      </p>
      <h3 style={{ marginTop: '10px', letterSpacing: '1px', fontSize: '1em' }}>{estado.texto}</h3>
    </div>
  );
};