import sys
import os
import time

try:
    import RPi.GPIO as GPIO
except (ImportError, RuntimeError):
    from unittest.mock import MagicMock
    GPIO = MagicMock()
    sys.modules["RPi.GPIO"] = GPIO
    sys.modules["RPi"] = MagicMock()

# Ensure we can import from the lib folder regardless of where this script is run from
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib.hx711 import HX711

class HX711Sensor:
    def __init__(self, dout=5, pd_sck=6):
        self.dout = dout
        self.pd_sck = pd_sck
        self.sensor = None
        self._last_weight = None
        # Default calibration factor (reference unit)
        # Use environment variable if available, otherwise default to 1.0 (raw)
        self.reference_unit = float(os.environ.get("WEIGHT_CALIBRATION_FACTOR", 1.0))

    def initialize(self):
        try:
            self.sensor = HX711(self.dout, self.pd_sck)
            self.sensor.set_reading_format("MSB", "MSB")
            self.sensor.set_reference_unit(self.reference_unit)
            self.sensor.reset()
            self.sensor.tare()
            print(f"[INFO] HX711 initialized with reference unit: {self.reference_unit}")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to initialize HX711: {e}")
            return False

    @property
    def weight(self):
        """Returns weight in kg (scaled using reference_unit)"""
        if self.sensor:
            try:
                # get_weight(1) applies the reference_unit and offset
                val = self.sensor.get_weight(1)
                # Ensure it doesn't show negative zero or tiny negative values when empty
                if val is not None and val < 0 and val > -0.05:
                    val = 0.0
                self._last_weight = val
                return val
            except Exception as e:
                print(f"[ERROR] reading HX711: {e}")
        return self._last_weight

    def stop(self):
        if self.sensor:
            try:
                GPIO.cleanup()
            except Exception:
                pass