
import { getDataConfig } from '../config/dataConfig';

export const useDataMode = () => {
  const config = getDataConfig();
  
  return {
    mode: config.mode,
    isMockMode: config.mode === 'mock',
    isRealMode: config.mode === 'real'
  };
};
