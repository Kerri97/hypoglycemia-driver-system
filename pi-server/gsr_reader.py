"""
Physical sensor to Digital Signal, reads GSR data and detects 'spikes'.
"""
import time
from collections import deque
import threading
from flask import Flask, jsonify
import board
import busio
from adafruit_ads1x15.ads1115 import ADS1115
from adafruit_ads1x15.analog_in import AnalogIn
from flask_ngrok import run_with_ngrok
import random

RECENT_READINGS_SIZE = 50
SPIKE_THRESHOLD_PERCENT = 2

gsr_channel = None
use_fake_data = False

try:
    i2c = busio.I2C(board.SCL, board.SDA)
    ads = ADS1115(i2c)
    gsr_channel = AnalogIn(ads, 0)
    print("Hardware initialised successfully")
    use_fake_data = False
except Exception as error:
    print(f"Hardware setup error: {error}")
    print("Falling back to FAKE data mode.")
    use_fake_data = True

latest_data = {}

def sensor_reading_loop():
    """This function runs in the background, keeping 
    the latest_data variable fresh"""
    global latest_data
    recent_readings = deque(maxlen=RECENT_READINGS_SIZE)
    is_calibrated = False
    print('Starting background sensor reading thread...')
    
    while True:
        try:
            current_gsr_value = gsr_channel.value
            recent_readings.append(current_gsr_value)
            
            is_calibrated = len(recent_readings) == RECENT_READINGS_SIZE
            
            average_value = 0
            is_spike = False
            if is_calibrated:
                average_value = sum(recent_readings) / len(recent_readings)

                threshold = average_value * (1 + SPIKE_THRESHOLD_PERCENT / 100.0)
                if current_gsr_value > threshold:
                    is_spike = True 
        
            latest_data = {
            "gsrValue": current_gsr_value,
            "baseline": int(average_value),
            "isSpike": is_spike,
            "isCalibrated": is_calibrated,
            "calibrationProgress": len(recent_readings) / RECENT_READINGS_SIZE
            }
        except Exception as e:
            print(f"Error during live sensor read: {e}")
            latest_data = {
                "gsrValue": None,
                "baseline": 0,
                "isSpike": False,
                "isCalibrated": False,
                "calibrationProgress": 0,
                "error": "Read failed"
            }
            
        time.sleep(0.1)
        
def fake_sensor_reading_loop():
    global latest_data
    
    baseline = 25000
    while True: 
        gsr_value = baseline + random.randint(-500, 500)
        is_spike = random.random() > 0.50 
        
        latest_data = {
            "gsrValue": gsr_value,
            "baseline": baseline,
            "isSpike": is_spike,
            "isCalibrated": True,
            "calibrationProgress": 1.0
        }
        
        time.sleep(0.1)
        
        
app = Flask(__name__)
run_with_ngrok(app)

@app.route('/gsr-data')
def get_gsr_data():
    """Endpoint is optimised to return the latest data from the background thread"""
    return jsonify(latest_data)

if __name__ == "__main__":
    if use_fake_data:
        sensor_thread = threading.Thread(target=fake_sensor_reading_loop, daemon=True)
    else:
        print("Starting thread.")
        sensor_thread = threading.Thread(target=sensor_reading_loop, daemon=True)
        
    sensor_thread.start()
    print("Starting Flask server on http://0.0.0.0:5000")
    app.run(port=5000)