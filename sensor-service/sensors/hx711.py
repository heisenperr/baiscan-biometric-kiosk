import os
import time
import random
import json

try:
    import RPi.GPIO as GPIO
    HAS_GPIO = True
except ImportError:
    HAS_GPIO = False

class HX711Sensor:
    def __init__(self, dout_pin=27, pd_sck_pin=17, name="LoadCell", config_path="config/sensors.json"):
        self.dout_pin = dout_pin
        self.pd_sck_pin = pd_sck_pin
        self.name = name
        self.config_path = config_path
        self.offset = 0
        self.scale = 1.0
        self.mock_mode = os.environ.get("MOCK_SENSORS", "false").lower() == "true"
        
        # Load calibration from config
        self._load_config()

        # Physical pin mapping for documentation/debugging
        self.pin_map = {
            "VCC": 4,
            "GND": 9,
            "DT (Data)": 13,   # GPIO 27
            "SCK (Clock)": 11, # GPIO 17
        }

        if not self.mock_mode:
            if not HAS_GPIO:
                print(f"[ERROR] {self.name}: RPi.GPIO not installed. Switching to MOCK mode.")
                self.mock_mode = True
            else:
                try:
                    GPIO.setmode(GPIO.BCM)
                    GPIO.setup(self.pd_sck_pin, GPIO.OUT)
                    GPIO.setup(self.dout_pin, GPIO.IN)
                    print(f"[INIT] {self.name} initialized on GPIO {dout_pin}(DT), {pd_sck_pin}(SCK)")
                    # If offset is 0, perform initial tare
                    if self.offset == 0:
                        self.tare()
                except Exception as e:
                    print(f"[ERROR] Failed to init HX711: {e}.")
                    self.mock_mode = True
                    print("[INIT] Hardware failed. Switching to MOCK mode.")

    def _load_config(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    if self.name in config:
                        self.offset = config[self.name].get("offset", 0)
                        self.scale = config[self.name].get("scale", 1.0)
                        print(f"[CONFIG] {self.name} loaded metrics: offset={self.offset}, scale={self.scale}")
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
            "scale": self.scale
        }
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"[ERROR] Failed to save config for {self.name}: {e}")

    def is_ready(self):

        if self.mock_mode: return True
        return GPIO.input(self.dout_pin) == 0

    def read_raw(self):
        if self.mock_mode:
            # Simulate a raw value around a baseline
            return 8388607 + random.randint(-1000, 1000)

        # Wait for device to be ready
        timeout = 0.5
        start_time = time.time()
        while not self.is_ready():
            if time.time() - start_time > timeout:
                return None
            time.sleep(0.001)

        raw_data = 0
        for _ in range(24):
            GPIO.output(self.pd_sck_pin, True)
            raw_data = (raw_data << 1) | GPIO.input(self.dout_pin)
            GPIO.output(self.pd_sck_pin, False)

        # Set gain (1 pulse for 128 gain on channel A)
        GPIO.output(self.pd_sck_pin, True)
        GPIO.output(self.pd_sck_pin, False)

        # 2's complement
        if raw_data & 0x800000:
            raw_data -= 0x1000000

        return raw_data

    def tare(self, times=15):
        print(f"Taring {self.name}...")
        sum_val = 0
        count = 0
        for _ in range(times):
            val = self.read_raw()
            if val is not None:
                sum_val += val
                count += 1
            time.sleep(0.01)
        
        if count > 0:
            self.offset = sum_val / count
            print(f"Tare complete. Offset: {self.offset}")
            self._save_config()
        else:

            print("Tare failed: No data received.")

    def get_weight(self):
        val = self.read_raw()
        if val is None: return 0.0
        
        if self.mock_mode:
            # Simulate weight in grams (e.g. 0 to 5000g)
            return round(random.uniform(0, 5000), 2)
            
        return round((val - self.offset) / self.scale, 2)

    def __str__(self):
        mode = "MOCK" if self.mock_mode else "REAL"
        return f"{self.name} ({mode}) on DT={self.dout_pin}, SCK={self.pd_sck_pin}, pins={self.pin_map}"
