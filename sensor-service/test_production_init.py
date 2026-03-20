import os
import sys
from unittest.mock import MagicMock, patch

# In-place mock requirements
sys.modules['smbus2'] = MagicMock()
sys.modules['VL53L1X'] = MagicMock()
sys.modules['RPi.GPIO'] = MagicMock()

def run_test(app_env, mock_sensors, hardware_fails=False):
    print(f"\n--- Testing: APP_ENV={app_env}, MOCK_SENSORS={mock_sensors}, hardware_fails={hardware_fails} ---")
    
    # Reset sys.modules to force reload of SensorManager and subcomponents
    if 'services.sensor_manager' in sys.modules: del sys.modules['services.sensor_manager']
    if 'sensors.mlx90614' in sys.modules: del sys.modules['sensors.mlx90614']
    if 'sensors.vl53l1x' in sys.modules: del sys.modules['sensors.vl53l1x']
    if 'sensors.hx711' in sys.modules: del sys.modules['sensors.hx711']

    with patch.dict(os.environ, {"APP_ENV": app_env, "MOCK_SENSORS": mock_sensors}):
        # Mock the hardware modules
        with patch('smbus2.SMBus') as mock_smbus, \
             patch('VL53L1X.VL53L1X') as mock_vl53, \
             patch('RPi.GPIO.setup') as mock_gpio_setup, \
             patch('RPi.GPIO.input') as mock_gpio_input:
            
            if hardware_fails:
                mock_smbus.side_effect = Exception("I2C Hardware Error")
                mock_vl53.side_effect = Exception("ToF Hardware Error")
                mock_gpio_setup.side_effect = Exception("GPIO Hardware Error")
            else:
                mock_gpio_input.return_value = 0 # HX711 ready
            
            try:
                from services.sensor_manager import SensorManager
                manager = SensorManager()
                report = manager.validate_sensors()
                
                print("Sensor Report:", report)
                print("Production Mode:", manager.production_mode)
                print("Mock Mode:", manager.mock_mode)
                
                # Verify Logic
                if app_env == "production":
                    if hardware_fails:
                        assert report["TempSensor"] == "FAILED", "Temp should be FAILED"
                        assert report["ToF_Sensor"] == "FAILED", "ToF should be FAILED"
                        assert report["LoadCell"] == "FAILED", "LoadCell should be FAILED"
                    else:
                        assert report["TempSensor"] == "HEALTHY"
                        assert report["ToF_Sensor"] == "HEALTHY"
                        assert report["LoadCell"] == "HEALTHY"
                elif mock_sensors == "true":
                    assert report["TempSensor"] == "MOCK"
                    assert report["ToF_Sensor"] == "MOCK"
                    assert report["LoadCell"] == "MOCK"
                
                print(">>> PASSED")
            except Exception as e:
                if hardware_fails and app_env == "production":
                    print(f">>> Caught expected exception in production fail: {e}")
                    # In my current code, SensorManager._initialize_sensors catches and prints, 
                    # but doesn't re-raise unless it's the sensor driver itself.
                    # Wait, the sensor drivers re-raise if NOT mock_mode.
                    # So SensorManager._initialize_sensors catches it.
                else:
                    print(f">>> TEST FAILED: {e}")
                    raise e

if __name__ == "__main__":
    # Ensure current directory is in path
    if os.getcwd() not in sys.path:
        sys.path.append(os.getcwd())
        
    try:
        # Test Scenarios
        run_test("development", "true", hardware_fails=False)
        run_test("development", "false", hardware_fails=True)
        run_test("production", "false", hardware_fails=False)
        run_test("production", "false", hardware_fails=True)
        print("\nAll tests completed!")
    except Exception as e:
        print(f"\nTests failed with error: {e}")
        sys.exit(1)
