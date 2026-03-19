import os
import random
from sensors.mlx90614 import MLX90614Sensor
from sensors.vl53l1x import VL53L1XSensor
from sensors.hx711 import HX711Sensor

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
        self.config_dir = "config"
        
        # Ensure config directory exists
        os.makedirs(self.config_dir, exist_ok=True)
        
        if self.mock_mode:

            self.temp_sensor = MockSensor(name="TempSensor")
            self.dist_sensor = VL53L1XSensor(bus_num=1, address=0x29, name="ToF_Sensor")
            self.weight_sensor = HX711Sensor(dout_pin=27, pd_sck_pin=17, name="LoadCell")
            print("[INIT] Environment: PC/Mock mode enabled.")
        else:
            try:
                # Initialize real MLX90614 sensor
                self.temp_sensor = MLX90614Sensor(bus_num=1, address=0x5A, name="TempSensor")
                # Initialize real VL53L1X sensor
                self.dist_sensor = VL53L1XSensor(bus_num=1, address=0x29, name="ToF_Sensor")
                # Initialize real HX711 sensor
                self.weight_sensor = HX711Sensor(dout_pin=27, pd_sck_pin=17, name="LoadCell")
                print(f"[INIT] Initialized REAL sensors: {self.temp_sensor}, {self.dist_sensor}, {self.weight_sensor}")
            except Exception as e:
                print(f"[ERROR] Could not initialize physical sensors: {e}")
                print("[INIT] Falling back to Mock mode for testing.")
                self.temp_sensor = MockSensor(name="TempSensor")
                self.dist_sensor = VL53L1XSensor(bus_num=1, address=0x29, name="ToF_Sensor")
                self.weight_sensor = HX711Sensor(dout_pin=27, pd_sck_pin=17, name="LoadCell")
                self.mock_mode = True

    def collect(self):
        return {
            "temp_sensor": str(self.temp_sensor),
            "temperature": self.temp_sensor.read_temp(),
            "dist_sensor": str(self.dist_sensor),
            "distance_mm": self.dist_sensor.read_distance(),
            "weight_sensor": str(self.weight_sensor),
            "weight_g": self.weight_sensor.get_weight()
        }

