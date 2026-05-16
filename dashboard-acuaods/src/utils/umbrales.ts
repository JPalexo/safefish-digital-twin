// src/utils/umbrales.ts
import type { EstadoUmbral } from '../types';

export const getEstadoO2 = (o2: number): EstadoUmbral => {
  if (o2 >= 5.0) return { texto: 'ÓPTIMO', color: '#4caf50' };
  if (o2 >= 3.0) return { texto: 'ESTRÉS', color: '#ff9800' };
  return { texto: 'CRÍTICO', color: '#f44336' };
};

export const getEstadoTemp = (temp: number): EstadoUmbral => {
  if (temp >= 26.0 && temp <= 30.0) return { texto: 'ÓPTIMO', color: '#4caf50' };
  if (temp >= 22.0 && temp < 26.0) return { texto: 'ESTRÉS FRÍO', color: '#ff9800' };
  return { texto: 'CRÍTICO', color: '#f44336' };
};

export const getEstadoPPM = (ppm: number): EstadoUmbral => {
  if (ppm <= 15.0) return { texto: 'ÓPTIMO', color: '#4caf50' };
  if (ppm <= 30.0) return { texto: 'SUCIO', color: '#ff9800' };
  return { texto: 'CRÍTICO', color: '#8d6e63' };
};