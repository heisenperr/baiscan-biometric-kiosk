import axios from 'axios';
import { AppDataSource } from '../data-source';
import { Calibration } from '../entity/Calibration';

const SENSOR_SERVICE_URL = process.env.SENSOR_SERVICE_URL || 'http://sensor-service:8000';
const SENSOR_TIMEOUT = 10_000; // 10s for normal operations
const TARE_TIMEOUT = 30_000;   // 30s for tare (15 hardware reads)

class CalibrationService {
    private get repo() {
        return AppDataSource.getRepository(Calibration);
    }

    /** Get the most recent calibration record for a specific sensor. */
    async getCalibration(sensorName: string): Promise<Calibration | null> {
        return this.repo.findOne({
            where: { sensor_name: sensorName },
            order: { updated_at: 'DESC' },
        });
    }

    /** Get the full calibration history for a sensor, limited to the 50 most recent. */
    async getCalibrationHistory(sensorName: string): Promise<Calibration[]> {
        return this.repo.find({
            where: { sensor_name: sensorName },
            order: { updated_at: 'DESC' },
            take: 50,
        });
    }

    /** Get all calibration records across all sensors. */
    async getAllCalibrations(): Promise<Calibration[]> {
        return this.repo.find({ order: { updated_at: 'DESC' } });
    }

    /** Create a new calibration history record. */
    async saveCalibration(
        sensorName: string,
        referenceUnit: number,
        offset: number,
        notes?: string,
    ): Promise<Calibration> {
        const record = this.repo.create({
            sensor_name: sensorName,
            reference_unit: referenceUnit,
            offset,
            notes,
        });
        return this.repo.save(record);
    }

    /** Push calibration values to the live sensor-service hardware instance. */
    async pushToSensorService(referenceUnit: number, offset: number): Promise<void> {
        await axios.post(
            `${SENSOR_SERVICE_URL}/calibrate`,
            { reference_unit: referenceUnit, offset },
            { timeout: SENSOR_TIMEOUT },
        );
    }

    /** Trigger a hardware tare on the sensor-service and return the new offset. */
    async tareSensor(): Promise<number> {
        const res = await axios.post<{ offset: number }>(
            `${SENSOR_SERVICE_URL}/tare`,
            {},
            { timeout: TARE_TIMEOUT },
        );
        return res.data.offset;
    }

    /** Fetch current live calibration values directly from sensor hardware. */
    async getLiveCalibration(): Promise<{ reference_unit: number; offset: number }> {
        const res = await axios.get<{ reference_unit: number; offset: number }>(
            `${SENSOR_SERVICE_URL}/calibration`,
            { timeout: SENSOR_TIMEOUT },
        );
        return res.data;
    }

    /**
     * Restore the latest calibration from the database and push it to the sensor-service.
     * Non-fatal — logs a warning if the sensor-service is not yet available.
     */
    async restoreFromDatabase(): Promise<void> {
        const latest = await this.getCalibration('HX711');
        if (latest) {
            await this.pushToSensorService(latest.reference_unit, latest.offset);
            console.log(`[CALIBRATION] Restored from DB: reference_unit=${latest.reference_unit}, offset=${latest.offset}`);
        } else {
            console.log('[CALIBRATION] No saved calibration found, using sensor defaults.');
        }
    }
}

export default new CalibrationService();
