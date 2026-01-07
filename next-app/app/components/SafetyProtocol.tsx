import React from 'react';
import { SafetyStatus } from '../types';
import { AlertTriangle, ShieldAlert, Car, PhoneCall, Activity } from 'lucide-react';

interface SafetyProtocolProps {
    status: SafetyStatus;
    geminiAnalysis: string;
    isAnalyzing: boolean;
}

export const SafetyProtocol: React.FC<SafetyProtocolProps> = ({ status, geminiAnalysis, isAnalyzing }) => {
    if (status === SafetyStatus.NORMAL) return null;

    const isCritical = status === SafetyStatus.CRITICAL || status === SafetyStatus.EMERGENCY_STOP;

    return (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ${isCritical ? 'bg-red-950/30 backdrop-blur-sm' : 'bg-transparent'}`}>

            {/* Main Alert Box */}
            <div className={`
        bg-black/90 border-2 rounded-xl p-8 max-w-2xl w-full shadow-2xl transform transition-all duration-300
        ${isCritical ? 'border-hud-danger shadow-[0_0_100px_rgba(255,0,60,0.3)] scale-100' : 'border-hud-warning scale-95'}
      `}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                        {isCritical ? <ShieldAlert size={48} className="text-hud-danger animate-pulse" /> : <AlertTriangle size={48} className="text-hud-warning" />}
                        <div>
                            <h2 className={`text-3xl font-bold font-mono tracking-tighter ${isCritical ? 'text-hud-danger' : 'text-hud-warning'}`}>
                                {isCritical ? 'HYPOGLYCEMIA CRITICAL' : 'GLUCOSE ALERT'}
                            </h2>
                            <p className="text-gray-400 text-sm font-mono">PROTOCOL: {isCritical ? 'EMERGENCY_STOP_V2' : 'DRIVER_WARNING_L1'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`px-4 py-1 rounded font-mono font-bold text-black ${isCritical ? 'bg-hud-danger' : 'bg-hud-warning'}`}>
                            {status}
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <ProtocolStep
                        icon={<Activity />}
                        label="BIOMETRIC LOCK"
                        active={true}
                        color={isCritical ? "text-red-500" : "text-yellow-500"}
                        desc="Continuous monitoring active."
                    />
                    <ProtocolStep
                        icon={<Car />}
                        label="AUTOPILOT"
                        active={isCritical}
                        color="text-cyan-400"
                        desc={isCritical ? "ENGAGED: Pulling over to shoulder." : "Standby for takeover."}
                    />
                    <ProtocolStep
                        icon={<PhoneCall />}
                        label="EMERGENCY CONTACT"
                        active={status === SafetyStatus.EMERGENCY_STOP}
                        color="text-green-400"
                        desc={status === SafetyStatus.EMERGENCY_STOP ? "Dialing Emergency Services..." : "Ready to dial."}
                    />
                </div>

                {/* AI Report Section */}
                <div className="bg-gray-900/50 rounded border border-white/10 p-4 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-purple-400 font-mono">INCIDENT REPORT</span>
                    </div>
                    <p className="font-mono text-sm text-gray-300 leading-relaxed">
                        {isAnalyzing ? (
                            <span className="animate-pulse">Analysing biometric data...</span>
                        ) : (
                            geminiAnalysis || "Waiting for data..."
                        )}
                    </p>
                    {/* Scan Line */}
                    {isAnalyzing && <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/10 to-transparent h-[20%] animate-scan pointer-events-none"></div>}
                </div>

            </div>
        </div>
    );
};

const ProtocolStep = ({ icon, label, active, color, desc }: any) => (
    <div className={`p-3 rounded border ${active ? 'border-white/20 bg-white/5' : 'border-transparent opacity-50'} flex items-center gap-3`}>
        <div className={active ? color : 'text-gray-500'}>{icon}</div>
        <div>
            <div className={`text-xs font-bold font-mono ${active ? 'text-white' : 'text-gray-500'}`}>{label}</div>
            <div className="text-[10px] text-gray-400">{desc}</div>
        </div>
    </div>
);