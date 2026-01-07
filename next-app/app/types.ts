export enum SafetyStatus {
    NORMAL = 'NORMAL',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL',
    EMERGENCY_STOP = 'EMERGENCY_STOP'
}

export interface BiometricData {
    timestamp: number;
    heartRate: number; // bpm
    gsr: number; // Galvanic Skin Response
    tremor: number; // 0-10 scale
    bloodGlucose: number; // mg/dL (simulated)
    isLive?: boolean; // tells us if data is real
}

export interface SensorStatus {
    id: string;
    type: 'OPTICAL' | 'CAPACITIVE' | 'PRESSURE';
    location: string;
    active: boolean;
    reading: string;
}

export interface AnalysisResult {
    text: string;
    isLoading: boolean;
}

export interface PiSensorData {
    gsrValue: number;
    baseline: number;
    isSpike: boolean;
    isCalibrated: boolean;
    calibrationProgress: number;
}