import time
import os
import threading
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import uvicorn
from services.sensor_manager import SensorManager

app = FastAPI()
manager = SensorManager()
current_distance = None
current_weight = None

# ── Calibration models ──────────────────────────────────────────────────────
class CalibrationRequest(BaseModel):
    reference_unit: float
    offset: float

    @validator('reference_unit')
    def reference_unit_nonzero(cls, v):
        if v == 0:
            raise ValueError('reference_unit cannot be zero')
        return v


# ── Existing sensor endpoints ────────────────────────────────────────────────
@app.get("/distance")
async def get_distance():
    return {"distance": current_distance}

@app.get("/weight")
async def get_weight():
    return {"weight": current_weight}


# ── Calibration endpoints ────────────────────────────────────────────────────
@app.get("/calibration")
async def get_calibration():
    """Return the currently active calibration values from the live HX711 instance."""
    hx = manager.get_sensor("Weight_Sensor")
    if not hx or not hx.sensor:
        raise HTTPException(status_code=503, detail="Weight sensor not available")
    return {
        "sensor": "HX711",
        "reference_unit": hx.sensor.get_reference_unit_A(),
        "offset": hx.sensor.get_offset_A(),
    }


@app.post("/calibrate")
async def set_calibration(payload: CalibrationRequest):
    """Hot-patch the live HX711 instance. Effective on the very next sensor poll."""
    hx = manager.get_sensor("Weight_Sensor")
    if not hx or not hx.sensor:
        raise HTTPException(status_code=503, detail="Weight sensor not available")
    hx.sensor.set_reference_unit(payload.reference_unit)
    hx.sensor.set_offset(payload.offset)
    # Keep the wrapper's cached value in sync too
    hx.reference_unit = payload.reference_unit
    print(f"[CALIBRATION] reference_unit={payload.reference_unit}, offset={payload.offset}")
    return {
        "status": "ok",
        "reference_unit": payload.reference_unit,
        "offset": payload.offset,
    }


@app.post("/tare")
async def tare_sensor():
    """Re-tare the HX711 at the current zero-load reading and return the new offset."""
    hx = manager.get_sensor("Weight_Sensor")
    if not hx or not hx.sensor:
        raise HTTPException(status_code=503, detail="Weight sensor not available")
    new_offset = hx.sensor.tare(times=15)
    print(f"[TARE] New offset: {new_offset}")
    return {"status": "ok", "offset": new_offset}

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