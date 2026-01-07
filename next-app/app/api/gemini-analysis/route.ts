import { GoogleGenAI } from "@google/genai";
import { SafetyStatus, BiometricData } from "../../types";

let genAI: GoogleGenAI | null = null;

try {
    if (process.env.API_KEY) {
        genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
} catch (error) {
    console.error("Failed to initialize GoogleGenAI", error);
}

export const analyzeDriverState = async (
    status: SafetyStatus,
    data: BiometricData
): Promise<string> => {
    if (!genAI) {
        return "System Analysis Unavailable: API Key not configured.";
    }

    if (status === SafetyStatus.NORMAL) {
        return "Driver state optimal. Physiological parameters within normal baseline. Continuing passive monitoring.";
    }

    const model = "gemini-2.5-flash";
    const prompt = `
    Act as the "Diabetic's Dashboard" AI automotive safety system.
    
    Context: A diabetic driver is operating a vehicle.
    Current System Status: ${status}
    
    Real-time Biometric Telemetry from Steering Wheel Sensors:
    - Estimated Blood Glucose: ${data.bloodGlucose} mg/dL
    - Heart Rate: ${data.heartRate} bpm
    - Galvanic Skin Response (Stress/Sweat): ${data.gsr} µS
    - Micro-tremors Detected: ${data.tremor > 2 ? 'Yes' : 'No'} (Intensity: ${data.tremor}/10)
    
    Task:
    1. Briefly analyse the physiological data (correlate HR, GSR, and Glucose).
    2. Determine the immediate risk to driving ability (cognitive decline, loss of motor control).
    3. Issue a concise, authoritative safety protocol command to the vehicle's autopilot system.
    
    Keep response under 50 words. Use technical, medical-automotive phrasing.
  `;

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Emergency protocol active. Connection to central analysis server unstable.";
    }
};