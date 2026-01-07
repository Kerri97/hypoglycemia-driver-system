import React, { useEffect, useRef } from 'react';
import { SafetyStatus } from '../types';
import { Activity, Fingerprint, Radio, Zap } from 'lucide-react';

interface SteeringWheelProps {
    status: SafetyStatus;
    tremorLevel: number;
}

export const SteeringWheel: React.FC<SteeringWheelProps> = ({ status, tremorLevel }) => {
    const wheelRef = useRef<HTMLDivElement>(null);

    // 3D Parallax Effect on mouse move
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!wheelRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX - innerWidth / 2) / 30;
            const y = (clientY - innerHeight / 2) / 30;
            wheelRef.current.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const getGlowColor = () => {
        switch (status) {
            case SafetyStatus.CRITICAL:
            case SafetyStatus.EMERGENCY_STOP:
                return 'shadow-[0_0_50px_rgba(255,0,60,0.6)] border-hud-danger';
            case SafetyStatus.WARNING:
                return 'shadow-[0_0_30px_rgba(255,189,0,0.4)] border-hud-warning';
            default:
                return 'shadow-[0_0_20px_rgba(0,240,255,0.2)] border-hud-primary';
        }
    };

    const sensorColor = status === SafetyStatus.NORMAL ? 'text-hud-primary' : status === SafetyStatus.WARNING ? 'text-hud-warning' : 'text-hud-danger';
    const bgSensorColor = status === SafetyStatus.NORMAL ? 'bg-hud-primary' : status === SafetyStatus.WARNING ? 'bg-hud-warning' : 'bg-hud-danger';

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Background Grid for Depth */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}>
            </div>

            {/* Wheel Container */}
            <div
                ref={wheelRef}
                className={`relative w-[400px] h-[400px] transition-transform duration-100 ease-out`}
            >
                {/* The Wheel Ring */}
                <div className={`absolute inset-0 rounded-full border-16px bg-linear-to-b from-gray-800 to-gray-950 ${getGlowColor()} transition-all duration-500`}>

                    {/* Leather Texture Overlay */}
                    <div className="absolute inset-0 rounded-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>

                    {/* Top Center Marker */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-8 ${bgSensorColor} rounded-b-md shadow-lg transition-colors duration-300`}></div>
                </div>

                {/* Spokes */}
                <div className="absolute top-1/2 left-0 w-full h-12 -translate-y-1/2 bg-gray-900 flex items-center justify-between px-1 z-10" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}>
                    {/* Left Spoke Controls */}
                    <div className="flex gap-2 pl-8">
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <Activity size={16} className={sensorColor} />
                        </div>
                    </div>
                    {/* Center Hub (Airbag) */}
                    <div className="w-32 h-32 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full border-4 border-gray-700 shadow-inner flex items-center justify-center z-20">
                        <div className="text-gray-500 text-xs font-mono tracking-widest">SENSORWHEEL</div>
                    </div>
                    {/* Right Spoke Controls */}
                    <div className="flex gap-2 pr-8">
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <Fingerprint size={16} className={sensorColor} />
                        </div>
                    </div>
                </div>

                {/* Vertical Spoke */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1/2 bg-gray-900 z-0" style={{ clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' }}></div>


                {/* SENSORS VISUALIZATION */}

                {/* 10 & 2 O'Clock Position Sensors (Grip/Sweat) */}
                <div className="absolute top-[15%] left-[15%] w-12 h-24 rounded-[50%] border-l-2 border-white/20 opacity-80">
                    <div className={`absolute top-1/2 left-0 w-3 h-3 ${bgSensorColor} rounded-full animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                    <div className="absolute left-4 top-1/2 text-[10px] text-white font-mono whitespace-nowrap -translate-y-1/2 bg-black/80 px-1 rounded border border-white/10">
                        GSR: L
                    </div>
                </div>
                <div className="absolute top-[15%] right-[15%] w-12 h-24 rounded-[50%] border-r-2 border-white/20 opacity-80">
                    <div className={`absolute top-1/2 right-0 w-3 h-3 ${bgSensorColor} rounded-full animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                    <div className="absolute right-4 top-1/2 text-[10px] text-white font-mono whitespace-nowrap -translate-y-1/2 bg-black/80 px-1 rounded border border-white/10">
                        GSR: R
                    </div>
                </div>

                {/* Sensors (Heart Rate) */}
                <div className="absolute bottom-[25%] left-[18%]">
                    <div className={`w-2 h-2 ${bgSensorColor} rounded-full animate-ping absolute`}></div>
                    <div className={`w-2 h-2 ${bgSensorColor} rounded-full relative`}></div>
                </div>
                <div className="absolute bottom-[25%] right-[18%]">
                    <div className={`w-2 h-2 ${bgSensorColor} rounded-full animate-ping absolute`}></div>
                    <div className={`w-2 h-2 ${bgSensorColor} rounded-full relative`}></div>
                </div>

                {/* Vibration/Tremor Visualisation */}
                {tremorLevel > 0 && (
                    <div className={`absolute inset-0 rounded-full border-4 border-transparent animate-pulse ${status === SafetyStatus.CRITICAL ? 'border-red-500' : 'border-yellow-500'}`}
                        style={{ animationDuration: `${1 / tremorLevel}s` }}>
                    </div>
                )}

            </div>

            {/* Active Sensor List Overlay */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <SensorReadout label="CAPACITIVE GRIP" active={true} status={status} />
                <SensorReadout label="OPTICAL PPG (HR)" active={true} status={status} />
                <SensorReadout label="MICRO-TREMOR IMU" active={tremorLevel > 0} status={status} />
            </div>
        </div>
    );
};

const SensorReadout: React.FC<{ label: string, active: boolean, status: SafetyStatus }> = ({ label, active, status }) => (
    <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/5">
        <div className={`w-2 h-2 rounded-full ${active ? (status === SafetyStatus.NORMAL ? 'bg-hud-primary' : 'bg-hud-danger') : 'bg-gray-700'}`}></div>
        <span className={`text-[10px] font-mono tracking-wider ${active ? 'text-gray-200' : 'text-gray-600'}`}>{label}</span>
    </div>
)