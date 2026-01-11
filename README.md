# Hypoglycemia Driver Safety System

Real-time biometric monitoring system for drivers with diabetes. Detects early signs of hypoglycemia through galvanic skin response (GSR) sensors integrated into a steering wheel, triggering safety responses.

---

## Overview

This project uses a **decoupled software-to-hardware architecture** where a Raspberry Pi acts as a dedicated sensor server, streaming biometric data to a Next.js dashboard via a Backend-for-Frontend (BFF) pattern.

When physiological stress indicators are detected, the system triggers graduated safety responses – from warnings through to simulated vehicle intervention – while Gemini AI provides contextual guidance for the driver.

---

## Architecture
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Raspberry Pi   │      │   Next.js App   │      │    Dashboard    │
│  (Sensor Server)│ ───► │   (BFF Layer)   │ ───► │   (React UI)    │
│                 │ HTTP │                 │      │                 │
│  - GSR Sensor   │      │  - /api/gsr-data│      │  - Biometrics   │
│  - ADS1115 ADC  │      │  - /api/gemini  │      │  - Safety UI    │
│  - Flask API    │      │                 │      │  - AI Analysis  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Why decoupled?**
- Hardware can run independently on low-power Pi
- Dashboard can be deployed anywhere (local, cloud, vehicle head unit)
- Easy to swap or upgrade either component
- Supports simulation mode for development without hardware

---

## Features

- **GSR Spike Detection** – Moving average algorithm detects stress/sweat responses indicative of blood sugar changes
- **Real-time Visualisation** – Live biometric charts (heart rate, blood glucose, GSR, tremor)
- **Graduated Safety Responses** – Normal → Warning → Critical → Emergency Stop
- **AI Incident Analysis** – Gemini contextual guidance during safety events
- **Simulation Mode** – Full functionality without hardware for development/demo
- **Auto-calibration** – 50-sample baseline calibration on startup

---

## Project Structure
```
hypoglycemia-driver-system/
├── pi-server/              # Raspberry Pi sensor server
│   ├── gsr_reader.py       # GSR sensor reading + Flask API
│   └── requirements.txt
│
└── next-app/               # Dashboard application
    ├── app/
    │   ├── api/
    │   │   ├── gsr-data/   # BFF route to Pi
    │   │   └── gemini-analysis/
    │   └── components/
    │       ├── BiometricCharts.tsx
    │       ├── SafetyProtocol.tsx
    │       ├── SteeringWheel.tsx
    │       └── Scene.tsx
    └── package.json
```

---

## Hardware Requirements

- Raspberry Pi (3/4/Zero W)
- ADS1115 16-bit ADC
- GSR sensor (connected to A0)
- I2C enabled on Pi

---

## Getting Started

### Pi Server Setup
```bash
cd pi-server

# Install dependencies
pip install -r requirements.txt

# Enable I2C on your Pi if not already
sudo raspi-config  # Interface Options → I2C → Enable

# Run the sensor server
python gsr_reader.py
```

The server exposes GSR data at `http://<pi-ip>:5000/gsr-data`

### Dashboard Setup
```bash
cd next-app

# Install dependencies
npm install

# Configure environment
echo "PI_API_URL=http://<pi-ip>:5000/gsr-data" > .env.local

# Run development server
npm run dev
```

---

## API Reference

### `GET /gsr-data` (Pi Server)

Returns current sensor state:
```json
{
  "gsrValue": 24850,
  "baseline": 25000,
  "isSpike": false,
  "isCalibrated": true,
  "calibrationProgress": 1.0
}
```

### `GET /api/gsr-data` (Next.js BFF)

Proxies Pi data to the frontend, handling connection errors.

### `POST /api/gemini-analysis`

Requests AI analysis during safety events.

---

## Safety States

| State | Blood Glucose | Response |
|-------|---------------|----------|
| NORMAL | > 90 mg/dL | Standard driving |
| WARNING | 70-90 mg/dL | Alert displayed |
| CRITICAL | 55-70 mg/dL | Speed reduction, AI guidance |
| EMERGENCY_STOP | < 55 mg/dL | Vehicle safety intervention |

---

## Development

Toggle between live hardware and simulation mode using the Control Panel in the dashboard UI. Simulation mode generates synthetic biometric data for testing safety responses without hardware.

---

## Background

This project originated from the Kingston University Bright Ideas competition (2020), where it won first place in the Science, Health and Well-being category.

---

## Tech Stack

- **Hardware:** Raspberry Pi, ADS1115 ADC, GSR Sensor
- **Pi Server:** Python, Flask, Adafruit CircuitPython
- **Dashboard:** Next.js, React, TypeScript, Tailwind CSS
- **AI:** Google Gemini API

---

## License

MIT
