from sensors.mlx90614 import MLX90614Sensor

class SensorManager:
    def __init__(self):
        # Initialize MLX90614 sensor
        self.temp_sensor = MLX90614Sensor(bus_num=1, address=0x5A, name="TempSensor")
        
        # Log sensor initialization to console
        print(f"[INIT] Initialized sensor: {self.temp_sensor}")

    def collect(self):
        # Read temperature and return along with sensor info
        return {
            "sensor": str(self.temp_sensor),  # includes pins
            "temperature": self.temp_sensor.read_temp()
        }