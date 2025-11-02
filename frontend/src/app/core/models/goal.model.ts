export interface Goal {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: 'reduce_waste' | 'save_energy' | 'sustainable_transport' | 'eco_friendly_diet' | 'water_conservation' | 'other';
    target: {
      value: number;
      unit: string;
    };
    progress: {
      value: number;
      percentage: number;
    };
    startDate: Date;
    endDate?: Date;
    status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
    checkIns: {
      date: Date;
      value: number;
      notes?: string;
    }[];
    milestones: {
      id: string;
      title: string;
      targetValue: number;
      completed: boolean;
      completedDate?: Date;
    }[];
  }
  