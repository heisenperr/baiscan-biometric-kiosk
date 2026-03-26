import os
from sensors.vl53l1x import VL53L1XSensor
from sensors.hx711 import HX711Sensor
from sensors.max30102 import MAX30102Sensor

class SensorManager:
    def __init__(self):
        self.production_mode = os.environ.get("APP_ENV", "development").lower() == "production"
        self.mock_sensors = os.environ.get("MOCK_SENSORS", "false").lower() == "true"
        self.sensors = {}
        self._initialize_sensors()

    def _initialize_sensors(self):
        print(f"[DEBUG] APP_ENV: {os.environ.get('APP_ENV')}")
        print(f"[DEBUG] MOCK_SENSORS: {self.mock_sensors}")
        
        # Initialize available sensors
        self.sensors["ToF_Sensor"] = VL53L1XSensor()
        self.sensors["Weight_Sensor"] = HX711Sensor()
        self.sensors["Vitals_Sensor"] = MAX30102Sensor()
        
        print("[INIT] Initializing hardware...")
        for name, sensor in self.sensors.items():
            if not sensor.initialize():
                 print(f"[ERROR] Failed to init {name}")

    def validate_sensors(self):
        """Returns a report of sensor health"""
        report = {}
        for name, sensor in self.sensors.items():
            if sensor.sensor is not None:
                report[name] = "HEALTHY"
            else:
                report[name] = "FAILED"
        return report

    def get_sensor(self, name):
        return self.sensors.get(name)