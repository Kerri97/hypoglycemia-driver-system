import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { BiometricData, SafetyStatus } from '../types';

interface BiometricChartsProps {
    dataHistory: BiometricData[];
    status: SafetyStatus;
}

export const BiometricCharts: React.FC<BiometricChartsProps> = ({ dataHistory, status }) => {

    const getStrokeColor = () => {
        switch (status) {
            case SafetyStatus.CRITICAL: return '#ff003c';
            case SafetyStatus.WARNING: return '#ffbd00';
            case SafetyStatus.EMERGENCY_STOP: return '#ff003c';
            default: return '#00f0ff';
        }
    };

    const color = getStrokeColor();

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            {/* Heart Rate & Glucose Correlation */}
            <div className="bg-hud-panel border border-white/10 rounded-lg p-4 flex-1 relative overflow-hidden">
                <h3 className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === SafetyStatus.NORMAL ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                    HR / Glucose Tracker
                </h3>
                <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                    <AreaChart data={dataHistory}>
                        <defs>
                            <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#050505', borderColor: '#333', color: '#fff' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="heartRate"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorHr)"
                            name="HR (bpm)"
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="bloodGlucose"
                            stroke="#fff"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Est. BG (mg/dL)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="absolute top-4 right-4 text-right">
                    <div className="text-2xl font-mono font-bold text-white">
                        {dataHistory[dataHistory.length - 1]?.heartRate ?? '--'} <span className="text-xs text-gray-500">BPM</span>
                    </div>
                </div>
            </div>

            {/* GSR / Stress Levels */}
            <div className="bg-hud-panel border border-white/10 rounded-lg p-4 flex-1 relative">
                <h3 className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">GSR / Sympathetic Response</h3>
                <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                    <LineChart data={dataHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis domain={[0, 20]} hide />
                        <Line
                            type="step"
                            dataKey="gsr"
                            stroke={status === SafetyStatus.NORMAL ? '#8884d8' : '#ffbd00'}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <div className="absolute bottom-2 right-4 text-right">
                    <div className={`text-xl font-mono font-bold ${dataHistory[dataHistory.length - 1]?.gsr > 10 ? 'text-hud-warning' : 'text-gray-400'}`}>
                        {dataHistory[dataHistory.length - 1]?.gsr.toFixed(1) ?? '--'} <span className="text-xs">µS</span>
                    </div>
                </div>
            </div>
        </div>
    );
};