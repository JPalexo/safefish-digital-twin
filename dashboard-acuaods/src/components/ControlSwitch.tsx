// src/components/ControlSwitch.tsx
import React from 'react';

interface ControlSwitchProps {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  activeColor: string;
  theme: any;
}

export const ControlSwitch: React.FC<ControlSwitchProps> = ({ label, isOn, onToggle, activeColor, theme }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: theme.textTitle }}>{label}</span>
      <div 
        onClick={onToggle} 
        style={{ 
          width: '60px', 
          height: '30px', 
          backgroundColor: isOn ? activeColor : '#cbd5e0', 
          borderRadius: '30px', 
          position: 'relative', 
          cursor: 'pointer', 
          transition: '0.3s' 
        }}
      >
        <div style={{ 
          width: '24px', 
          height: '24px', 
          backgroundColor: 'white', 
          borderRadius: '50%', 
          position: 'absolute', 
          top: '3px', 
          left: isOn ? '33px' : '3px', 
          transition: 'left 0.3s', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
        }} />
      </div>
    </div>
  );
};