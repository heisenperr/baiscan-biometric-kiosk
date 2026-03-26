import api from '@/lib/api';

export interface CalibrationRecord {
    id: number;
    sensor_name: string;
    reference_unit: number;
    offset: number;
    notes?: string;
    updated_at: string;
    created_at: string;
}

export interface SaveCalibrationPayload {
    sensor_name: string;
    reference_unit: number;
    offset: number;
    notes?: string;
}

export interface LiveCalibration {
    sensor: string;
    reference_unit: number;
    offset: number;
}

export const getAllCalibrations = (): Promise<{ data: CalibrationRecord[] }> =>
    api.get('/api/calibration/hx711');

export const getCalibration = (sensor: string): Promise<{ data: CalibrationRecord }> =>
    api.get(`/api/calibration/${sensor}`);

export const getLiveCalibration = (): Promise<{ data: LiveCalibration }> =>
    api.get('/api/calibration/live');

export const saveCalibration = (
    payload: SaveCalibrationPayload,
): Promise<{ data: CalibrationRecord }> => api.post('/api/calibration/hx711', payload);

export const tareSensor = (): Promise<{ data: { status: string; offset: number; reference_unit: number } }> =>
    api.post('/api/calibration/tare');
