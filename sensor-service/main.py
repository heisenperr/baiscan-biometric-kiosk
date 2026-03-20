import time
import os
from services.sensor_manager import SensorManager

def main():
    print("========================================")
    print("BAI Scan - Biometric Kiosk Sensor Service")
    print("========================================")
    
    manager = SensorManager()
    report = manager.validate_sensors()
    
    print("\n[STARTUP] Validating sensors...")
    successful = True
    for sensor, status in report.items():
        if status == "HEALTHY":
            print(f"  [+] {sensor}: {status}")
        else:
            print(f"  [-] {sensor}: {status} !!!")
            successful = False

    if not successful:
        print("\n[CRITICAL] Hardware validation failed. Check connections.")
        # We might still continue if in development mode, but for now we stop
        if manager.production_mode:
            return

    print("\n[SUCCESS] Entering real-time monitoring loop...")
    tof = manager.get_sensor("ToF_Sensor")

    try:
        while True:
            dist = tof.distance
            if dist is not None:
                print(f"Distance: {dist} mm", flush=True)
            else:
                print("Distance: Out of range", flush=True)
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[INFO] Stopped by user.")
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
    finally:
        for sensor in manager.sensors.values():
            sensor.stop()
        print("[INFO] Cleanup complete. Service exited.")

if __name__ == "__main__":
    main()