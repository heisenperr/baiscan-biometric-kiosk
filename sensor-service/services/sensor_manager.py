import os
import random
from sensors.mlx90614 import MLX90614Sensor

class MockSensor:
    def __init__(self, name="MockTempSensor"):
        self.name = name
        self.bus_num = 1
        self.address = 0x5A
        self.pin_map = {"MOCK": "N/A"}

    def read_temp(self):
        # Realistic body temperature simulation
        return round(36.5 + random.uniform(-0.3, 0.3), 2)

    def __str__(self):
        return f"{self.name} (MOCK) - Simulation Mode"

class SensorManager:
    def __init__(self):
        self.mock_mode = os.environ.get("MOCK_SENSORS", "false").lower() == "true"
        
        if self.mock_mode:
            self.temp_sensor = MockSensor(name="TempSensor")
            print("[INIT] Environment: PC/Mock mode enabled.")
        else:
            try:
                # Initialize real MLX90614 sensor
                self.temp_sensor = MLX90614Sensor(bus_num=1, address=0x5A, name="TempSensor")
                print(f"[INIT] Initialized REAL sensor: {self.temp_sensor}")
            except Exception as e:
                print(f"[ERROR] Could not initialize physical sensor: {e}")
                print("[INIT] Falling back to Mock mode for testing.")
                self.temp_sensor = MockSensor(name="TempSensor")
                self.mock_mode = True

    def collect(self):
        return {
            "sensor": str(self.temp_sensor),
            "temperature": self.temp_sensor.read_temp()
        }