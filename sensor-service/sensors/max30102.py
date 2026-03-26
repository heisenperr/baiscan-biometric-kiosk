import sys
import os
import time
import threading

# Ensure we can import from the lib folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from lib.max30102 import MAX30102
except ImportError as e:
    print(f"[WARNING] Could not import real MAX30102 driver: {e}")
    print("[WARNING] Falling back to Mock sensor for testing.")
    from unittest.mock import MagicMock
    MAX30102 = MagicMock()

class MAX30102Sensor:
    def __init__(self, channel=1, address=0x57):
        self.channel = channel
        self.address = address
        self.sensor = None
        self._last_bpm = 0
        self._last_spo2 = 0
        self._finger_detected = False

    def initialize(self):
        try:
            self.sensor = MAX30102(channel=self.channel, address=self.address)
            self.sensor.start()
            print(f"[INFO] MAX30102 initialized on channel {self.channel}, address {hex(self.address)}")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to initialize MAX30102: {e}")
            return False

    @property
    def vitals(self):
        """Returns a snapshot of the current vitals."""
        if self.sensor:
            try:
                self._last_bpm = self.sensor.bpm
                self._last_spo2 = self.sensor.spo2
                self._finger_detected = self.sensor.is_finger_detected
                return {
                    "bpm": self._last_bpm,
                    "spo2": self._last_spo2,
                    "finger_detected": self._finger_detected
                }
            except Exception as e:
                print(f"[ERROR] reading MAX30102: {e}")
        return {
            "bpm": self._last_bpm,
            "spo2": self._last_spo2,
            "finger_detected": self._finger_detected
        }

    def stop(self):
        if self.sensor:
            self.sensor.stop()
