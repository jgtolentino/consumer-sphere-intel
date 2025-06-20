import React, { useState, useCallback } from 'react';
import { useState, useCallback } from 'react';

export type DataMode = 'mock' | 'real';

export function useDataMode() {
  // Get initial mode from localStorage, fallback to env variable, then to mock
  const getInitialMode = (): DataMode => {
    const stored = localStorage.getItem('dataMode') as DataMode;
    if (stored === 'mock' || stored === 'real') {
      return stored;
    }
    
    // Fallback to environment variable
    const envMode = import.meta.env.VITE_DATA_MODE;
    return envMode === 'real' ? 'real' : 'mock';
  };

  const [mode, setMode] = useState<DataMode>(getInitialMode);

  const toggleMode = useCallback(() => {
    const newMode: DataMode = mode === 'mock' ? 'real' : 'mock';
    setMode(newMode);
    localStorage.setItem('dataMode', newMode);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('dataModeChanged', { detail: newMode }));
    
    // Optional: Force reload to ensure clean state
    // You can remove this if you prefer seamless switching
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [mode]);

  const setDataMode = useCallback((newMode: DataMode) => {
    setMode(newMode);
    localStorage.setItem('dataMode', newMode);
    window.dispatchEvent(new CustomEvent('dataModeChanged', { detail: newMode }));
  }, []);

  return { 
    mode, 
    toggleMode, 
    setDataMode,
    isReal: mode === 'real',
    isMock: mode === 'mock'
  };
}
