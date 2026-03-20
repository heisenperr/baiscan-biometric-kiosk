import time
from services.sensor_manager import SensorManager

def main():
    print("="*40)
    print("BAI Scan Biometric Kiosk - Starting Up")
    print("="*40)
    
    manager = SensorManager()
    
    # Run startup validation
    print("\n[STARTUP] Validating sensors...")
    report = manager.validate_sensors()
    
    successful = True
    for sensor, status in report.items():
        color = ""
        if status == "HEALTHY":
            print(f"  [+] {sensor}: {status}")
        elif status == "MOCK":
            print(f"  [!] {sensor}: {status} (Non-production mode)")
        else:
            print(f"  [-] {sensor}: {status} !!!")
            successful = False
    
    if not successful and manager.production_mode:
        print("\n[CRITICAL] One or more sensors failed in PRODUCTION mode.")
        print("[CRITICAL] Please check hardware connections and restart.")
        # In a real kiosk, we might want to stay in a "Hardware Error" state 
        # or exit to let systemd restart it.
        # For now, we'll continue but the error is clear.
    
    print("\n[STARTUP] Initialization complete. Starting data collection...\n")
    
    while True:
        try:
            data = manager.collect()
            print(f"Temp: {data['temperature']} °C | Dist: {data['distance_mm']} mm | Weight: {data['weight_g']} g")
        except Exception as e:
            print(f"Error reading sensors: {e}")

        time.sleep(1)

if __name__ == "__main__":
    main()