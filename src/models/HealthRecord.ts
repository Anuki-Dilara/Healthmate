export interface HealthRecord{
    id: number;
    date: string;
    steps: number;
    calories: number;
    water: number;
}

export type NewHealthRecord = Omit<HealthRecord, 'id'>;