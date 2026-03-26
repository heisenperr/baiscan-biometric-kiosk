import axios from 'axios';
import { Server } from 'socket.io';

const SENSOR_SERVICE_URL = process.env.SENSOR_SERVICE_URL || 'http://sensor-service:8000';

interface SensorData {
  sensor: string;
  value: number | null;
  unit: string;
  timestamp: string;
}

interface VitalsData {
  bpm: number;
  spo2: number;
  finger_detected: boolean;
}

class SensorService {
  async getVl53l1xDistance(): Promise<number | null> {
    try {
      const response = await axios.get<{ distance: number | null }>(`${SENSOR_SERVICE_URL}/distance`);
      return response.data.distance;
    } catch (error: any) {
      console.error('[ERROR] Failed to fetch from sensor-service:', error.message);
      return null;
    }
  }

  async getHx711Weight(): Promise<number | null> {
    try {
      const response = await axios.get<{ weight: number | null }>(`${SENSOR_SERVICE_URL}/weight`);
      return response.data.weight;
    } catch (error: any) {
      console.error('[ERROR] Failed to fetch weight from sensor-service:', error.message);
      return null;
    }
  }

  async getVitals(): Promise<VitalsData | null> {
    try {
      const response = await axios.get<VitalsData>(`${SENSOR_SERVICE_URL}/vitals`);
      if (response.data.finger_detected) {
          console.log('[DEBUG] Backend - Vitals from sensor-service:', response.data);
      }
      return response.data;
    } catch (error: any) {
      console.error('[ERROR] Failed to fetch vitals from sensor-service:', error.message);
      return null;
    }
  }

  startPolling(io: Server): void {
    setInterval(async () => {
      const distance = await this.getVl53l1xDistance();
      if (distance !== null) {
        const data: SensorData = {
          sensor: 'VL53L1X',
          value: distance,
          unit: 'mm',
          timestamp: new Date().toISOString()
        };
        io.emit('sensor:height', data);
      }

      const weight = await this.getHx711Weight();
      if (weight !== null) {
        const data: SensorData = {
          sensor: 'HX711',
          value: weight,
          unit: 'kg',
          timestamp: new Date().toISOString()
        };
        io.emit('sensor:weight', data);
      }

      const vitals = await this.getVitals();
      if (vitals) {
        if (vitals.finger_detected) {
            console.log('[DEBUG] Backend - Emitting sensor:vitals');
        }
        io.emit('sensor:vitals', {
          ...vitals,
          timestamp: new Date().toISOString()
        });
      }
    }, 100);
  }
}

export default new SensorService();
