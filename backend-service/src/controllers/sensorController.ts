import { Request, Response } from 'express';
import sensorService from '../services/sensorService';

export const getVl53l1x = async (req: Request, res: Response): Promise<any> => {
  try {
    const distance = await sensorService.getVl53l1xDistance();
    if (distance === null) {
      return res.status(503).json({ 
        error: 'Sensor service unavailable',
        sensor: 'VL53L1X' 
      });
    }

    res.json({
      sensor: 'VL53L1X',
      value: distance,
      unit: 'mm',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
