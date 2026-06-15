import { useEffect, useRef, useState } from "react";
import { Cpu, Wifi, Radio, Zap, CircuitBoard, Bluetooth } from "lucide-react";

const orbitIcons = [
  { Icon: Cpu, delay: 0, duration: 12 },
  { Icon: Wifi, delay: 2, duration: 14 },
  { Icon: Radio, delay: 4, duration: 16 },
  { Icon: Zap, delay: 6, duration: 13 },
  { Icon: CircuitBoard, delay: 8, duration: 15 },
  { Icon: Bluetooth, delay: 10, duration: 11 },
];

export default function ArduinoVisualization() {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setTilt({ x: dy * 12, y: -dx * 12 });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: "100%", height: "100%", minHeight: 360 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px] animate-pulse-glow" />
      </div>

      {/* Board container with tilt */}
      <div
        className="relative z-10 transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Arduino board SVG */}
        <div className="animate-spin-slow" style={{ animationDuration: "25s" }}>
          <svg
            width="260"
            height="200"
            viewBox="0 0 260 200"
            fill="none"
            className="drop-shadow-[0_0_40px_rgba(99,102,241,0.3)]"
          >
            {/* PCB Board */}
            <rect
              x="10"
              y="10"
              width="240"
              height="180"
              rx="12"
              fill="#1a3a2a"
              stroke="#2d5a3f"
              strokeWidth="2"
            />
            {/* Circuit traces */}
            <path
              d="M30 50 H100 V80 H150 V50 H220"
              stroke="#3d7a5f"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M30 100 H80 V130 H180 V100 H220"
              stroke="#3d7a5f"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M30 150 H120 V120 H200 V150 H220"
              stroke="#3d7a5f"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />

            {/* Microcontroller chip */}
            <rect x="95" y="65" width="70" height="50" rx="4" fill="#1a1a2e" stroke="#4a4a6a" strokeWidth="1" />
            <text x="130" y="95" textAnchor="middle" fill="#6366f1" fontSize="9" fontFamily="monospace" fontWeight="bold">
              ATmega328
            </text>

            {/* Pin headers - top */}
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={`top-${i}`} x={25 + i * 15} y="14" width="8" height="12" rx="1" fill="#c0c0c0" opacity="0.7" />
            ))}

            {/* Pin headers - bottom */}
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={`bot-${i}`} x={25 + i * 15} y="174" width="8" height="12" rx="1" fill="#c0c0c0" opacity="0.7" />
            ))}

            {/* USB connector */}
            <rect x="10" y="75" width="30" height="30" rx="3" fill="#888" stroke="#666" strokeWidth="1" />
            <rect x="14" y="82" width="18" height="16" rx="2" fill="#333" />

            {/* LEDs */}
            <circle cx="200" cy="35" r="4" fill="#22c55e" opacity="0.9">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="215" cy="35" r="4" fill="#6366f1" opacity="0.7">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Crystal oscillator */}
            <rect x="170" y="68" width="14" height="8" rx="2" fill="#c0c0c0" opacity="0.5" />

            {/* Capacitors */}
            <rect x="55" y="70" width="6" height="10" rx="1" fill="#b8860b" opacity="0.6" />
            <rect x="70" y="105" width="6" height="10" rx="1" fill="#b8860b" opacity="0.6" />

            {/* Reset button */}
            <circle cx="55" cy="40" r="6" fill="#444" stroke="#666" strokeWidth="1" />
            <circle cx="55" cy="40" r="3" fill="#888" />

            {/* Power section */}
            <rect x="10" y="130" width="20" height="20" rx="3" fill="#222" stroke="#444" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Orbiting icons */}
      {orbitIcons.map(({ Icon, delay, duration }, idx) => (
        <div
          key={idx}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: `orbit ${duration}s linear infinite`,
            animationDelay: `${-delay}s`,
          }}
        >
          <div className="glass-card rounded-xl p-2.5 text-indigo-400/60">
            <Icon size={18} />
          </div>
        </div>
      ))}
    </div>
  );
}
