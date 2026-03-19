import os
import json
from smbus2 import SMBus

class MLX90614Sensor:
    def __init__(self, bus_num=1, address=0x5A, name="TempSensor", config_path="config/sensors.json"):
        self.bus_num = bus_num
        self.address = address
        self.name = name
        self.config_path = config_path
        self.bus = SMBus(bus_num)
        self.offset = 0.0
        
        # Load calibration from config
        self._load_config()

        # Physical pin mapping for documentation/debugging
        self.pin_map = {
            "VIN": 17,
            "GND": 20,
            "SDA": 3,
            "SCL": 5
        }

    def _load_config(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    if self.name in config:
                        self.offset = config[self.name].get("offset", 0.0)
                        print(f"[CONFIG] {self.name} loaded offset: {self.offset}")
            except Exception as e:
                print(f"[ERROR] Failed to load config for {self.name}: {e}")

    def _save_config(self):
        config = {}
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
            except: pass

        config[self.name] = {"offset": self.offset}
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"[ERROR] Failed to save config for {self.name}: {e}")

    def read_temp(self):
        # Read raw 16-bit word (little-endian)
        raw = self.bus.read_word_data(self.address, 0x07)
        
        # Swap bytes (SMBus reads low byte first)
        raw_swapped = ((raw << 8) & 0xFF00) + (raw >> 8)
        
        # Convert to Celsius
        temp = (raw_swapped * 0.02) - 273.15
        return round(temp + self.offset, 2)


    def __str__(self):
        return f"{self.name} on bus {self.bus_num}, address 0x{self.address:X}, pins={self.pin_map}"
