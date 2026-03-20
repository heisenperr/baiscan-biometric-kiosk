import time
import os
import threading
from fastapi import FastAPI
import uvicorn
from services.sensor_manager import SensorManager

app = FastAPI()
manager = SensorManager()
current_distance = None

@app.get("/distance")
async def get_distance():
    return {"distance": current_distance}

def sensor_loop():
    global current_distance
    tof = manager.get_sensor("ToF_Sensor")
    if not tof:
        print("[ERROR] ToF_Sensor not found in manager.")
        return

    print("[SUCCESS] Sensor loop started.")
    try:
        while True:
            dist = tof.distance
            current_distance = dist
            # Also keep console logging for debugging
            if dist is not None:
                # print(f"Distance: {dist} mm", flush=True)
                pass
            time.sleep(0.1) # Faster sampling for backend
    except Exception as e:
        print(f"[ERROR] sensor_loop error: {e}")
    finally:
        tof.stop()

def main():
    print("========================================")
    print("BAI Scan - Biometric Kiosk Sensor Service")
    print("========================================")
    
    report = manager.validate_sensors()
    print("\n[STARTUP] Validating sensors...")
    for sensor, status in report.items():
        print(f"  [{'+' if status == 'HEALTHY' else '-'}] {sensor}: {status}")

    # Start sensor loop in a background thread
    threading.Thread(target=sensor_loop, daemon=True).start()

    # Start FastAPI server
    print("\n[INFO] Starting API server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="error")

if __name__ == "__main__":
    main()