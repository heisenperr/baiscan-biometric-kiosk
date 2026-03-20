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
        self.app_env = os.environ.get("APP_ENV", "development").lower()
        self.production_mode = self.app_env == "production"
        # MOCK_SENSORS is only allowed in development
        self.mock_mode = not self.production_mode and os.environ.get("MOCK_SENSORS", "false").lower() == "true"
        
        self.config_dir = "config"
        os.makedirs(self.config_dir, exist_ok=True)
        
        self.temp_sensor = None
        self.dist_sensor = None
        self.weight_sensor = None
        
        self._initialize_sensors()

    def _initialize_sensors(self):
        if self.mock_mode:
            print("[INIT] Environment: Development/Mock mode enabled.")
            self.temp_sensor = MockSensor(name="TempSensor")
            self.dist_sensor = VL53L1XSensor(bus_num=1, address=0x29, name="ToF_Sensor")
            self.weight_sensor = HX711Sensor(dout_pin=27, pd_sck_pin=17, name="LoadCell")
        else:
            print(f"[INIT] Environment: {self.app_env.upper()}. Initializing physical hardware...")
            
            # Temp Sensor
            try:
                self.temp_sensor = MLX90614Sensor(bus_num=1, address=0x5A, name="TempSensor")
            except Exception as e:
                print(f"[ERROR] TempSensor init failed: {e}")
                if not self.production_mode:
                    print("[INIT] Falling back to Mock TempSensor")
                    self.temp_sensor = MockSensor(name="TempSensor")
                    self.mock_mode = True
            
            # Distance Sensor
            try:
                self.dist_sensor = VL53L1XSensor(bus_num=1, address=0x29, name="ToF_Sensor")
            except Exception as e:
                print(f"[ERROR] ToF_Sensor init failed: {e}")
                if not self.production_mode:
                    self.dist_sensor = VL53L1XSensor(bus_num=1, address=0x29, name="ToF_Sensor") # This will set its own mock_mode
                    self.mock_mode = True

            # Weight Sensor
            try:
                self.weight_sensor = HX711Sensor(dout_pin=27, pd_sck_pin=17, name="LoadCell")
            except Exception as e:
                print(f"[ERROR] LoadCell init failed: {e}")
                if not self.production_mode:
                    self.weight_sensor = HX711Sensor(dout_pin=27, pd_sck_pin=17, name="LoadCell") # This will set its own mock_mode
                    self.mock_mode = True

    def validate_sensors(self):
        """
        Validates the status of all sensors and returns a status report.
        """
        report = {}
        
        # Validate Temp
        if self.temp_sensor:
            is_mock = isinstance(self.temp_sensor, MockSensor)
            report["TempSensor"] = "MOCK" if is_mock else "HEALTHY"
        else:
            report["TempSensor"] = "FAILED"

        # Validate Distance
        if self.dist_sensor:
            if self.dist_sensor.mock_mode:
                report["ToF_Sensor"] = "MOCK"
            else:
                # Basic check: try to read (though -1 might be valid distance, 
                # usually initialization success is enough for status)
                report["ToF_Sensor"] = "HEALTHY"
        else:
            report["ToF_Sensor"] = "FAILED"

        # Validate Weight
        if self.weight_sensor:
            if self.weight_sensor.mock_mode:
                report["LoadCell"] = "MOCK"
            else:
                report["LoadCell"] = "HEALTHY"
        else:
            report["LoadCell"] = "FAILED"

        return report

    def collect(self):
        return {
            "temp_sensor": str(self.temp_sensor) if self.temp_sensor else "None",
            "temperature": self.temp_sensor.read_temp() if self.temp_sensor else None,
            "dist_sensor": str(self.dist_sensor) if self.dist_sensor else "None",
            "distance_mm": self.dist_sensor.read_distance() if self.dist_sensor else None,
            "weight_sensor": str(self.weight_sensor) if self.weight_sensor else "None",
            "weight_g": self.weight_sensor.get_weight() if self.weight_sensor else None
        }

