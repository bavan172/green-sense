export interface EnvironmentalMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    change: number; 
    trend: 'up' | 'down' | 'stable';
    icon: string;
  }