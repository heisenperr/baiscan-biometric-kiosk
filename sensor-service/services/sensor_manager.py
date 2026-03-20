import os
from sensors.mlx90614 import MLX90614Sensor
from sensors.vl53l1x import VL53L1XSensor
from sensors.hx711 import HX711Sensor

class SensorManager:
    # Hardcoded Sensor Parameters
    TEMP_BUS = 1
    TEMP_ADDR = 0x5A
    
    TOF_BUS = 1
    TOF_ADDR = 0x29
    
    HX711_DOUT = 27
    HX711_SCK = 17

    def __init__(self):
        self.app_env = os.environ.get("APP_ENV", "development").lower()
        self.production_mode = self.app_env == "production"
        
        # Debugging: show what environment we are seeing
        print(f"[DEBUG] APP_ENV: {self.app_env}")
        print(f"[DEBUG] MOCK_SENSORS: {os.environ.get('MOCK_SENSORS')}")
        
        self.config_dir = "config"
        os.makedirs(self.config_dir, exist_ok=True)
        
        self.temp_sensor = None
        self.dist_sensor = None
        self.weight_sensor = None
        
        self._initialize_sensors()

    def _initialize_sensors(self):
        print(f"[INIT] Environment: {self.app_env.upper()}. Initializing sensors...")
        
        # Temp Sensor
        try:
            self.temp_sensor = MLX90614Sensor(bus_num=self.TEMP_BUS, address=self.TEMP_ADDR, name="TempSensor")
        except Exception as e:
            print(f"[ERROR] TempSensor initialization failed: {e}")

        # Distance Sensor
        try:
            self.dist_sensor = VL53L1XSensor(bus_num=self.TOF_BUS, address=self.TOF_ADDR, name="ToF_Sensor")
        except Exception as e:
            print(f"[ERROR] ToF_Sensor initialization failed: {e}")

        # Weight Sensor
        try:
            self.weight_sensor = HX711Sensor(dout_pin=self.HX711_DOUT, pd_sck_pin=self.HX711_SCK, name="LoadCell")
        except Exception as e:
            print(f"[ERROR] LoadCell initialization failed: {e}")

    def validate_sensors(self):
        """
        Validates the status of all sensors and returns a status report.
        """
        report = {}
        
        # Validate Temp
        if self.temp_sensor:
            report["TempSensor"] = "MOCK" if self.temp_sensor.mock_mode else "HEALTHY"
        else:
            report["TempSensor"] = "FAILED"

        # Validate Distance
        if self.dist_sensor:
            report["ToF_Sensor"] = "MOCK" if self.dist_sensor.mock_mode else "HEALTHY"
        else:
            report["ToF_Sensor"] = "FAILED"

        # Validate Weight
        if self.weight_sensor:
            report["LoadCell"] = "MOCK" if self.weight_sensor.mock_mode else "HEALTHY"
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

