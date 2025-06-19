
export interface DataConfig {
  mode: 'real';
  apiBaseUrl: string;
}

export const getDataConfig = (): DataConfig => {
  // Production only configuration
  return {
    mode: 'real',
    apiBaseUrl: 'https://lcoxtanyckjzyxxcsjzz.supabase.co'
  };
};
