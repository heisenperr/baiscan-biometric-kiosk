import time
from services.sensor_manager import SensorManager

def main():
    manager = SensorManager()
    
    while True:
        try:
            data = manager.collect()
            print(f"{data['sensor']} → Temperature: {data['temperature']} °C")
        except Exception as e:
            print(f"Error reading sensor: {e}")

        time.sleep(1)

if __name__ == "__main__":
    main()