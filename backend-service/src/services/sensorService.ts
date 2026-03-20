import axios from 'axios';
import { Server } from 'socket.io';

const SENSOR_SERVICE_URL = process.env.SENSOR_SERVICE_URL || 'http://sensor-service:8000';

interface SensorData {
  sensor: string;
  value: number | null;
  unit: string;
  timestamp: string;
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
    }, 100);
  }
}

export default new SensorService();
