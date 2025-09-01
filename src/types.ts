export interface ParameterHistory {
    value: string;
    isActive: boolean;
    lastSeen: number;
}

export interface Parameter {
    key: string;
    value: string;
    isActive: boolean;
}
