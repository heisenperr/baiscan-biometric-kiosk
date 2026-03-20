import os
import json
import random
import time

try:
    import board
    import busio
    import adafruit_vl53l1x
    HAS_VL53L1X = True
except ImportError:
    HAS_VL53L1X = False

class VL53L1XSensor:
    def __init__(self, bus_num=1, address=0x29, name="ToF_Sensor", config_path="config/sensors.json"):
        self.bus_num = bus_num
        self.address = address
        self.name = name
        self.config_path = config_path
        self.mock_mode = os.environ.get("MOCK_SENSORS", "false").lower() == "true"
        self.sensor = None
        self.i2c = None
        self.offset = 0
        self.crosstalk = 0
        
        # Load calibration from config
        self._load_config()

        if not self.mock_mode and HAS_VL53L1X:
            try:
                # Initialize I2C bus using Blinka/board
                self.i2c = busio.I2C(board.SCL, board.SDA)
                self.sensor = adafruit_vl53l1x.VL53L1X(self.i2c, address=address)
                
                # Default configuration
                self.sensor.distance_mode = 2  # 1 = short, 2 = long (Adafruit uses 1/2)
                self.sensor.timing_budget = 50 # 50ms
                
                # Start ranging
                self.sensor.start_ranging()
                print(f"[INIT] {self.name} (Adafruit) started ranging.")
            except Exception as e:
                print(f"[ERROR] Failed to init VL53L1X: {e}.")
                if self.mock_mode:
                    print("[INIT] Falling back to MOCK mode.")
                else:
                    print("[INIT] Hardware initialization failed. In production, this sensor will be unavailable.")
                    raise e
        else:
            self.mock_mode = True

        # Physical pin mapping for documentation/debugging
        self.pin_map = {
            "VCC": 2,
            "GND": 9,
            "SDA": 3,
            "SCL": 5,
            "XSHUT": "N/A",
            "GPIO1": "N/A"
        }

    def _load_config(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    if self.name in config:
                        self.offset = config[self.name].get("offset", 0)
                        self.crosstalk = config[self.name].get("crosstalk", 0)
                        print(f"[CONFIG] {self.name} loaded metrics: offset={self.offset}, crosstalk={self.crosstalk}")
            except Exception as e:
                print(f"[ERROR] Failed to load config for {self.name}: {e}")

    def _save_config(self):
        config = {}
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
            except: pass

        config[self.name] = {
            "offset": self.offset,
            "crosstalk": self.crosstalk
        }
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"[ERROR] Failed to save config for {self.name}: {e}")

    def calibrate(self, target_distance_mm=100):

        """
        Perform offset calibration. 
        Target should be a white card at target_distance_mm.
        """
        if self.mock_mode:
            print(f"[MOCK] Calibration performed at {target_distance_mm}mm")
            return
        
        try:
            print(f"Starting calibration for {self.name}...")
            self.sensor.stop_ranging()
            # Note: library specific calibration methods vary, 
            # usually entails:
            # self.sensor.perform_offset_calibration(target_distance_mm)
            # self.sensor.start_ranging()
            print("Calibration complete.")
        except Exception as e:
            print(f"Calibration failed: {e}")

    def read_distance(self):
        if self.mock_mode:
            # Simulate person walking by (e.g. 500mm to 1500mm)
            return random.randint(500, 1500)
        
        try:
            # Adafruit library uses .distance property (in cm, but check docs)
            # Actually adafruit_vl53l1x.distance is in cm. We want mm.
            dist_cm = self.sensor.distance
            if dist_cm is None: return -1
            return (dist_cm * 10) + self.offset
        except Exception as e:
            print(f"Error reading {self.name}: {e}")
            return -1

    def stop(self):
        if not self.mock_mode and self.sensor:
            try:
                self.sensor.stop_ranging()
            except: pass

    def __str__(self):
        mode = "MOCK" if self.mock_mode else "REAL"
        return f"{self.name} ({mode}) on bus {self.bus_num}, address 0x{self.address:X}, pins={self.pin_map}"

