// src/types/index.ts

export interface Sensores {
  oxigeno_mg_L: number;
  temperatura_C: number;
  ppm: number;
}

export interface EstadoUmbral {
  texto: 'ÓPTIMO' | 'ESTRÉS' | 'ESTRÉS FRÍO' | 'SUCIO' | 'CRÍTICO';
  color: string;
}