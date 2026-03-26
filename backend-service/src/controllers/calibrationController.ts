import { Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import calibrationService from '../services/calibrationService';

export const getCalibration = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sensor } = req.params;
        const record = await calibrationService.getCalibration(sensor);
        if (!record) {
            res.status(404).json({ message: `No calibration found for sensor: ${sensor}` });
            return;
        }
        res.json(record);
    } catch (err: any) {
        console.error('[CALIBRATION] GET error:', err.message);
        res.status(500).json({ message: 'Failed to fetch calibration' });
    }
};

export const getAllCalibrations = async (_req: Request, res: Response): Promise<void> => {
    try {
        const records = await calibrationService.getAllCalibrations();
        res.json(records);
    } catch (err: any) {
        console.error('[CALIBRATION] GET ALL error:', err.message);
        res.status(500).json({ message: 'Failed to fetch calibrations' });
    }
};

export const saveCalibration = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sensor_name, reference_unit, offset, notes } = req.body;

        if (!sensor_name || reference_unit === undefined || offset === undefined) {
            res.status(400).json({ message: 'sensor_name, reference_unit, and offset are required' });
            return;
        }
        if (reference_unit === 0) {
            res.status(400).json({ message: 'reference_unit cannot be zero' });
            return;
        }

        // 1. Persist to DB
        const saved = await calibrationService.saveCalibration(sensor_name, reference_unit, offset, notes);

        // 2. Push to live sensor-service (only HX711 for now)
        if (sensor_name === 'HX711') {
            try {
                await calibrationService.pushToSensorService(reference_unit, offset);
            } catch (pushErr: any) {
                console.warn('[CALIBRATION] sensor-service push failed (non-fatal):', pushErr.message);
            }
        }

        // 3. Broadcast via Socket.IO so connected clients know immediately
        const io: SocketIOServer = req.app.get('io');
        io.emit('calibration:updated', {
            sensor_name,
            reference_unit,
            offset,
            updated_at: saved.updated_at,
        });

        res.json(saved);
    } catch (err: any) {
        console.error('[CALIBRATION] POST error:', err.message);
        res.status(500).json({ message: 'Failed to save calibration' });
    }
};

export const tareSensor = async (req: Request, res: Response): Promise<void> => {
    try {
        const newOffset = await calibrationService.tareSensor();

        // Persist the new offset into DB (reference_unit stays the same)
        const existing = await calibrationService.getCalibration('HX711');
        const referenceUnit = existing?.reference_unit ?? 1.0;
        const saved = await calibrationService.saveCalibration('HX711', referenceUnit, newOffset, existing?.notes);

        const io: SocketIOServer = req.app.get('io');
        io.emit('calibration:updated', {
            sensor_name: 'HX711',
            reference_unit: referenceUnit,
            offset: newOffset,
            updated_at: saved.updated_at,
        });

        res.json({ status: 'ok', offset: newOffset, reference_unit: referenceUnit });
    } catch (err: any) {
        console.error('[CALIBRATION] TARE error:', err.message);
        res.status(500).json({ message: 'Tare failed — sensor may be unavailable' });
    }
};

export const getLiveCalibration = async (_req: Request, res: Response): Promise<void> => {
    try {
        const live = await calibrationService.getLiveCalibration();
        res.json(live);
    } catch (err: any) {
        console.error('[CALIBRATION] live GET error:', err.message);
        res.status(503).json({ message: 'Could not reach sensor-service' });
    }
};
