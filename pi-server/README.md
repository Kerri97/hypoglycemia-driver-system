# Galvanic skin response analog sensor to digital data
Physical sensor to Digital Signal, reads GSR data and detects 'spikes'.

The gsr_reader script reads GSR data from an ADS1115 ADC with a Raspberry Pi and uses a moving average time-series window implemented via a deque to detect when a reading is significantly higher than the most recent baseline,
indicating a potential emotional spike. It then acts as a websocket server, to
package data into a python dictionary, serialise it into a JSON string using
json.dumps(), and sends it to any connected client.

# Overview
This script reads GSR data from an ADS1115 analog-to-digital converter (ADC) and uses a moving average algorithm to detect when readings significantly exceed the recent baseline, potentially indicating emotional or stress responses. The system acts as a WebSocket server, packaging sensor data into JSON format and broadcasting it to any connected clients.

# Features
Real-time GSR monitoring - Continuous reading from ADS1115 ADC via I2C
Spike detection - Identifies readings that exceed baseline by configurable threshold percentage
Moving average baseline - Uses recent readings to establish dynamic baseline
Auto-calibration - Initial calibration period to establish baseline
WebSocket streaming - Real-time data broadcast to connected clients
Test mode - Simulated data for testing without hardware
JSON serialization - Structured data output for easy client integration

# Hardware Requirements
Raspberry Pi (or similar single-board computer with I2C support)
ADS1115 16-bit ADC module
GSR sensor (connected to ADS1115 channel A0)
Appropriate wiring and power supply

# Software Dependencies
pip install adafruit-circuitpython-ads1x15
pip install websockets

# Additional system requirements:
Python 3.7+
board and busio libraries (included with CircuitPython/Blinka)

# Configuration
Key parameters can be adjusted at the top of the script:
TEST_MODE = False                    # Set to True for placeholder data simulating
RECENT_READINGS_SIZE = 50          # Number of readings for moving average
SPIKE_THRESHOLD_PERCENT = 5        # Percentage above baseline to trigger spike

# Installation
Clone or download the script
Install dependencies:

bash   pip install adafruit-circuitpython-ads1x15 websockets

Connect your ADS1115 and GSR sensor to your Raspberry Pi
Configure I2C on your system if not already enabled
Update configuration parameters as needed
Set TEST_MODE = False when ready to use real hardware

# Usage
# Starting the Server
bashpython gsr_sensor.py
The WebSocket server will start on 0.0.0.0:8765 and begin accepting connections.
# Test Mode
When TEST_MODE = True, the script generates simulated data that spikes every 10 seconds for 2 seconds, useful for testing client applications without hardware.
# Client Connection
Connect to the WebSocket server at ws://[HOST_IP]:8765. The server will immediately begin streaming JSON data at 10Hz (100ms intervals).
# Data Format
Each message sent to clients is a JSON object with the following structure:
json{
  "gsrValue": 25000,
  "baseline": 24500,
  "isSpike": false,
  "isCalibrated": true,
  "calibrationProgress": 1.0
}

# Fields
gsrValue (int) - Current raw GSR reading from sensor
baseline (int) - Moving average baseline value
isSpike (bool) - Whether current reading exceeds spike threshold
isCalibrated (bool) - Whether calibration is complete
calibrationProgress (float) - Calibration progress from 0.0 to 1.0

# Calibration
The system requires an initial calibration period where it collects RECENT_READINGS_SIZE readings (default: 50, or 5 seconds at 10Hz) to establish a baseline. During this period:

isCalibrated will be false
isSpike will always be false
calibrationProgress indicates how close to completion
After calibration, spike detection becomes active.

# Spike Detection Algorithm
Maintains a rolling window of the most recent readings
Calculates the moving average (baseline) from this window
Compares current reading to threshold: baseline × (1 + SPIKE_THRESHOLD_PERCENT/100)
Flags a spike when current value exceeds threshold

# Hardware Setup
Wiring
Connect the ADS1115 to your Raspberry Pi:

VDD/VCC → 3.3V
GND → Ground
SCL → GPIO 3 (SCL)
SDA → GPIO 2 (SDA)

Connect your GSR Grove Finger sensor to ADS1115 A0 (channel 0). (yellow wire)
Connect to the same horizontal row on the breadboard that your ADC's VDD pin is plugged into. (red wire)
Connect to the same horizontal row on the breadboard that your ADC's GND pin is plugged into. This shares the ground connection. (black wire)
white wire has no connection needed.

I2C Configuration
Enable I2C on Raspberry Pi:
bashsudo raspi-config
Navigate to Interface Options → I2C → Enable
Verify I2C device detection:
ic2cdetect -y 1
watch -n 0.5 i2cdetect -y 1
you should see num printed in the grid e.g 48 to verify ADS1115 connection to Pi

# Example Client (JavaScript/Typescript)
javascriptconst ws = new WebSocket('ws://192.168.1.100:8765');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`GSR: ${data.gsrValue}, Spike: ${data.isSpike}`);
  
  if (data.isSpike) {
    // Trigger your application logic
    console.log('Emotional spike detected!');
  }
};

# Troubleshooting
Hardware not detected:
Verify I2C is enabled and wiring is correct
Check I2C address with i2cdetect -y 1
Ensure ADS1115 has power

No client connection:

Check firewall settings
Verify correct IP address and port
Ensure no other service is using port 8765

Constant spikes or no spikes:

Adjust SPIKE_THRESHOLD_PERCENT
Increase RECENT_READINGS_SIZE for more stable baseline
Check sensor connection and placement

# License
This project is provided as-is for educational and research purposes.






