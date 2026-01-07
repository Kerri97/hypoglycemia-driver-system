'use client'
import React, { useState, useEffect, useRef } from 'react';
import { BiometricData, SafetyStatus, PiSensorData } from '../types';
import { SteeringWheel } from '../components/SteeringWheel';
import { BiometricCharts } from '../components/BiometricCharts';
import { SafetyProtocol } from '../components/SafetyProtocol';
import { Settings, Battery, Wifi, Cpu, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
    // Connection state: BFF (Raspberry Pi gsr-data) or simulated backup
    const [connectionMode, setConnectionMode] = useState<'SIM' | 'BFF'>('BFF');
    const [targetGlucose, setTargetGlucose] = useState(110);

    // Dashboard state
    const [status, setStatus] = useState<SafetyStatus>(SafetyStatus.NORMAL);
    const [dataHistory, setDataHistory] = useState<BiometricData[]>([]);
    const [geminiAnalysis, setGeminiAnalysis] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Hardware data
    const [piMeta, setPiMeta] = useState({ isCalibrated: false, progress: 0, isSpike: false });
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const dataRef = useRef<BiometricData>({
        timestamp: Date.now(),
        heartRate: 72,
        bloodGlucose: 110,
        gsr: 2.5,
        tremor: 0
    });

    // 1. Fetch data from the Raspberry Pi via the gsr-data endpoint
    const fetchFromBFF = async () => {
        try {
            const response = await fetch('/api/gsr-data');
            if (!response.ok) throw new Error("Hardware Link Offline");

            const piData: PiSensorData = await response.json();

            setPiMeta({
                isCalibrated: piData.isCalibrated,
                progress: piData.calibrationProgress || 0,
                isSpike: piData.isSpike
            });

            // Normalise GSR for visualisation (mapping ADC 0-32768 to 0-20uS)
            const normalisedGSR = piData.gsrValue ? (piData.gsrValue / 1600) : 2.5;
            let currentBG = dataRef.current.bloodGlucose;

            // Simulate physiological drop if hardware detects a sweat/stress spike
            if (piData.isSpike) {
                currentBG = Math.max(45, currentBG - 2.5);
            } else if (currentBG < targetGlucose) {
                currentBG += 0.2; // Slow recovery
            }

            dataRef.current = {
                timestamp: Date.now(),
                heartRate: 70 + (piData.isSpike ? 15 : 0) + (Math.random() * 5),
                bloodGlucose: currentBG,
                gsr: normalisedGSR,
                tremor: piData.isSpike ? 5.5 : (currentBG < 70 ? 2.0 : 0),
                isLive: true
            };
            setConnectionError(null);
        } catch (err) {
            setConnectionError("Pi Unreachable: Check BFF Route");
        }
    };

    // 2. Request AI Analysis from the gemini-analysis endpoint
    const requestAIAnalysis = async (currentStatus: SafetyStatus, currentData: BiometricData) => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/gemini-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: currentStatus, biometricData: currentData })
            });
            const result = await response.json();
            setGeminiAnalysis(result.text || result.error || "Analysis response empty");
        } catch (e) {
            setGeminiAnalysis("Gemini A.I unreachable");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Dashboard Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (connectionMode === 'BFF') {
                fetchFromBFF();
            } else {
                // Simulation logic
                const bg = dataRef.current.bloodGlucose + (targetGlucose - dataRef.current.bloodGlucose) * 0.05;
                dataRef.current = {
                    ...dataRef.current,
                    timestamp: Date.now(),
                    bloodGlucose: bg,
                    gsr: 2 + (bg < 80 ? (80 - bg) * 0.2 : 0),
                    tremor: bg < 70 ? (70 - bg) / 5 : 0,
                    isLive: false
                };
            }

            setDataHistory(prev => {
                const newHist = [...prev, dataRef.current];
                return newHist.length > 50 ? newHist.slice(1) : newHist;
            });

            // Calculate Safety State
            const bg = dataRef.current.bloodGlucose;
            if (bg < 55) setStatus(SafetyStatus.EMERGENCY_STOP);
            else if (bg < 70) setStatus(SafetyStatus.CRITICAL);
            else if (bg < 90) setStatus(SafetyStatus.WARNING);
            else setStatus(SafetyStatus.NORMAL);
        }, 500);

        return () => clearInterval(interval);
    }, [connectionMode, targetGlucose]);

    // AI Trigger Logic
    useEffect(() => {
        if (status !== SafetyStatus.NORMAL && !geminiAnalysis && !isAnalyzing) {
            requestAIAnalysis(status, dataRef.current);
        } else if (status === SafetyStatus.NORMAL) {
            setGeminiAnalysis("");
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-hud-black text-gray-100 font-sans flex flex-col overflow-hidden select-none">
            <header className="h-16 border-b border-white/10 bg-hud-dark/90 flex items-center justify-between px-8 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${connectionMode === 'BFF' ? 'bg-purple-500' : 'bg-hud-primary'}`}></div>
                    <h1 className="text-xl font-bold font-mono tracking-widest text-white uppercase italic">
                        <span>Diabetic Safety Dashboard</span>
                    </h1>
                </div>
                <div className="flex items-center gap-6 text-gray-400 font-mono text-xs">
                    <div className="flex items-center gap-2">
                        <Wifi size={14} className={connectionError ? 'text-red-500' : 'text-green-500'} />
                        {connectionMode === 'BFF' ? (connectionError ? 'BFF ERROR' : 'PI LINKED') : 'SIMULATION'}
                    </div>
                    <div className="flex items-center gap-2"><Battery size={14} /> 98%</div>
                    <Settings size={16} className="cursor-pointer hover:text-white transition-colors" />
                </div>
            </header >

            <main className="flex-1 flex p-6 gap-6 relative">
                {/* Left Control Column */}
                <div className="w-1/4 flex flex-col gap-6 z-10">
                    <div className="bg-hud-panel border border-white/10 p-6 rounded-xl shadow-lg">
                        <h2 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4">Control Panel</h2>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <button onClick={() => setConnectionMode('SIM')} className={`px-2 py-2 rounded text-[10px] font-mono border transition-all ${connectionMode === 'SIM' ? 'border-hud-primary bg-hud-primary/10 text-hud-primary' : 'border-white/5 text-gray-600 hover:text-gray-300'}`}>SIMULATE DATA</button>
                            <button onClick={() => setConnectionMode('BFF')} className={`px-2 py-2 rounded text-[10px] font-mono border transition-all ${connectionMode === 'BFF' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 text-gray-600 hover:text-gray-300'}`}>LIVE BIOMETRIC DATA</button>
                        </div>

                        {connectionMode === 'BFF' ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                                <div className="bg-black/40 border border-white/5 p-3 rounded">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-mono text-gray-500 uppercase">Hardware Ready</span>
                                        <span className="text-[9px] font-mono text-white">{piMeta.isCalibrated ? 'CALIBRATED' : 'INIT...'}</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-500 ${piMeta.isCalibrated ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-purple-500'}`} style={{ width: `${piMeta.progress * 100}%` }}></div>
                                    </div>
                                </div>
                                {connectionError && <div className="p-2 bg-red-950/40 border border-red-900 rounded flex items-center gap-2 text-[9px] text-red-300 font-mono uppercase animate-pulse"><AlertCircle size={12} /> {connectionError}</div>}
                            </div>
                        ) : (
                            <div className="animate-in fade-in">
                                <label className="flex justify-between text-sm mb-2 font-bold text-[10px] font-mono uppercase text-gray-500">Blood-sugar Level</label>
                                <input type="range" min="40" max="180" value={targetGlucose} onChange={(e) => setTargetGlucose(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-hud-primary" />
                                <div className="mt-2 text-right font-mono text-xs text-hud-primary">{targetGlucose} mg/dL</div>
                            </div>
                        )}
                    </div>

                    <div className="bg-hud-panel border border-white/5 p-4 rounded-xl flex-1">
                        <h3 className="text-[10px] text-gray-500 font-mono mb-3 uppercase tracking-widest flex items-center gap-2"><Cpu size={14} /> System Health</h3>
                        <div className="space-y-2 text-[9px] font-mono">
                            <StatusRow label="sensor system" active={connectionMode === 'BFF'} />
                            <StatusRow label="biometric analyser" active={true} />
                            <StatusRow label="vehicle safety response" active={status !== SafetyStatus.NORMAL} warning={status === SafetyStatus.CRITICAL} />
                            <StatusRow label="incident report" active={!!geminiAnalysis || isAnalyzing} />
                        </div>
                    </div>
                </div>

                {/* Center Visuals */}
                <div className="flex-1 relative flex flex-col items-center justify-center min-h-[500px] bg-linear-to-b from-gray-900/40 to-transparent rounded-3xl border border-white/5 shadow-inner">
                    <SafetyProtocol status={status} geminiAnalysis={geminiAnalysis} isAnalyzing={isAnalyzing} />
                    <SteeringWheel status={status} tremorLevel={dataRef.current.tremor} />

                    {/* Dashboard Footer */}
                    <div className="absolute bottom-8 w-80 h-20 bg-black/80 border-t border-l border-r border-hud-primary/30 rounded-t-3xl flex items-end justify-center pb-3 backdrop-blur-xl shadow-2xl">
                        <div className="text-center">
                            <div className="text-5xl font-bold font-mono text-white leading-none tracking-tighter">
                                {status === SafetyStatus.EMERGENCY_STOP ? '0' : Math.floor(65 - (70 - dataRef.current.bloodGlucose) * 0.5)}
                                <span className="text-lg text-gray-600 ml-1">KM/H</span>
                            </div>
                            <div className="text-[8px] text-hud-primary tracking-[0.5em] mt-2 uppercase font-bold opacity-60">
                                {status === SafetyStatus.NORMAL ? 'Cruising: L3 Autonomous' : 'Safety Override Active'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-1/4 z-10 flex flex-col">
                    <BiometricCharts dataHistory={dataHistory} status={status} />
                </div>
            </main>
        </div >
    );
};

const StatusRow = ({ label, active, warning }: { label: string, active: boolean, warning?: boolean }) => (
    <div className="flex justify-between p-2 bg-black/20 rounded border border-white/5">
        <span className="text-gray-500 italic lowercase">{label}</span>
        <span className={warning ? 'text-red-500 animate-pulse' : active ? 'text-green-500' : 'text-gray-800'}>
            {warning ? 'ALERT' : active ? 'ONLINE' : 'STANDBY'}
        </span>
    </div>
);

export default App;

