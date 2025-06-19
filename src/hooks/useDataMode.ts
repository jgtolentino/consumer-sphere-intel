
import { useCallback } from 'react';

export type DataMode = 'real';

export function useDataMode() {
  // Always return 'real' mode - production only
  const mode: DataMode = 'real';

  // No-op functions to maintain API compatibility
  const toggleMode = useCallback(() => {
    console.warn('Data mode toggle disabled - production mode only');
  }, []);

  const setDataMode = useCallback((newMode: DataMode) => {
    console.warn('Data mode switching disabled - production mode only');
  }, []);

  return { 
    mode, 
    toggleMode, 
    setDataMode,
    isReal: true,
    isMock: false
  };
}
