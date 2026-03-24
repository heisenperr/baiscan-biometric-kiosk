import time
import os
import threading
from fastapi import FastAPI
import uvicorn
from services.sensor_manager import SensorManager

app = FastAPI()
manager = SensorManager()
current_distance = None
current_weight = None

@app.get("/distance")
async def get_distance():
    return {"distance": current_distance}

@app.get("/weight")
async def get_weight():
    return {"weight": current_weight}

def sensor_loop():
    global current_distance, current_weight
    tof = manager.get_sensor("ToF_Sensor")
    hx = manager.get_sensor("Weight_Sensor")
    
    if not tof and not hx:
        print("[ERROR] No sensors found in manager.")
        return

    print("[SUCCESS] Sensor loop started.")
    try:
        while True:
            if tof:
                current_distance = tof.distance
            if hx:
                current_weight = hx.weight
            
            time.sleep(0.1) # Faster sampling for backend
    except Exception as e:
        print(f"[ERROR] sensor_loop error: {e}")
    finally:
        if tof: tof.stop()
        if hx: hx.stop()

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