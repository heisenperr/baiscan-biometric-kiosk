from smbus2 import SMBus

class MLX90614Sensor:
    def __init__(self, bus_num=1, address=0x5A, name="TempSensor"):
        self.bus_num = bus_num
        self.address = address
        self.name = name
        self.bus = SMBus(bus_num)

        # Physical pin mapping for documentation/debugging
        self.pin_map = {
            "VIN": 17,
            "GND": 20,
            "SDA": 3,
            "SCL": 5
        }

    def read_temp(self):
        # Read raw 16-bit word (little-endian)
        raw = self.bus.read_word_data(self.address, 0x07)
        
        # Swap bytes (SMBus reads low byte first)
        raw_swapped = ((raw << 8) & 0xFF00) + (raw >> 8)
        
        # Convert to Celsius
        temp = (raw_swapped * 0.02) - 273.15
        return round(temp, 2)

    def __str__(self):
        return f"{self.name} on bus {self.bus_num}, address 0x{self.address:X}, pins={self.pin_map}"
