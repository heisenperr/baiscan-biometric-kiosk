import board
import busio
import adafruit_vl53l1x
import time
import sys

# Mock lgpio if it fails to load (safety for some containers)
try:
    import lgpio
except ImportError:
    from unittest.mock import MagicMock
    sys.modules["lgpio"] = MagicMock()

class VL53L1XSensor:
    def __init__(self, address=0x29):
        self.address = address
        self.i2c = None
        self.sensor = None

    def initialize(self):
        try:
            self.i2c = busio.I2C(board.SCL, board.SDA)
            self.sensor = adafruit_vl53l1x.VL53L1X(self.i2c, address=self.address)
            
            # Default to Long range (2)
            self.sensor.distance_mode = 2
            self.sensor.timing_budget = 50
            
            self.sensor.start_ranging()
            return True
        except Exception as e:
            print(f"[ERROR] Failed to initialize VL53L1X: {e}")
            return False

    @property
    def distance(self):
        """Returns distance in mm"""
        if self.sensor:
            dist = self.sensor.distance
            if dist is not None:
                return dist * 10 # Convert cm to mm
        return None

    def stop(self):
        if self.sensor:
            self.sensor.stop_ranging()
