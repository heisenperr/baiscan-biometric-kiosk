import axios from 'axios';
import { AppDataSource } from '../data-source';
import { Calibration } from '../entity/Calibration';

const SENSOR_SERVICE_URL = process.env.SENSOR_SERVICE_URL || 'http://sensor-service:8000';

class CalibrationService {
    private get repo() {
        return AppDataSource.getRepository(Calibration);
    }

    /** Get the latest calibration for a specific sensor. */
    async getCalibration(sensorName: string): Promise<Calibration | null> {
        return this.repo.findOne({ 
            where: { sensor_name: sensorName },
            order: { updated_at: 'DESC' }
        });
    }

    /** Get the full history for a specific sensor. */
    async getCalibrationHistory(sensorName: string): Promise<Calibration[]> {
        return this.repo.find({
            where: { sensor_name: sensorName },
            order: { updated_at: 'DESC' },
            take: 50
        });
    }

    async getAllCalibrations(): Promise<Calibration[]> {
        return this.repo.find({ order: { updated_at: 'DESC' } });
    }

    async saveCalibration(
        sensorName: string,
        referenceUnit: number,
        offset: number,
        notes?: string,
    ): Promise<Calibration> {
        // We always create a NEW record to maintain history
        const record = this.repo.create({
            sensor_name: sensorName,
            reference_unit: referenceUnit,
            offset,
            notes,
        });

        return this.repo.save(record);
    }

    /** Push updated calibration values to the live sensor-service instance. */
    async pushToSensorService(referenceUnit: number, offset: number): Promise<void> {
        await axios.post(`${SENSOR_SERVICE_URL}/calibrate`, {
            reference_unit: referenceUnit,
            offset,
        });
    }

    /** Trigger a hardware tare on the sensor-service and return the new offset. */
    async tareSensor(): Promise<number> {
        const res = await axios.post<{ offset: number }>(
            `${SENSOR_SERVICE_URL}/tare`, 
            {}, 
            { timeout: 30000 }
        );
        return res.data.offset;
    }

    /** Fetch current live calibration values from the sensor-service. */
    async getLiveCalibration(): Promise<{ reference_unit: number; offset: number }> {
        const res = await axios.get<{ reference_unit: number; offset: number }>(
            `${SENSOR_SERVICE_URL}/calibration`,
        );
        return res.data;
    }
}

export default new CalibrationService();
