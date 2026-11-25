import React from "react";

export default function PinVisual({ pin, className = "" }) {
    const tags = pin.tags || [];
    const isMotorsport =
        tags.includes("motorsport") || tags.includes("porsche") || tags.includes("f1");
    const isArchitecture =
        tags.includes("architecture") || tags.includes("minimalist") || tags.includes("interior");
    const isCyberOrSetup =
        tags.includes("cyberpunk") || tags.includes("coding") || tags.includes("hardware") || tags.includes("setup");

    return (
        <div
            className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${pin.gradient} select-none ${className}`}
        >
            {/* Subtle Blueprint Grid Overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id={`grid-${pin.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.7" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${pin.id})`} />
            </svg>

            {/* Theme 1: Motorsport / F1 / Porsche Telemetry & Aero Illustration */}
            {isMotorsport && (
                <svg viewBox="0 0 400 320" className="w-full h-full object-cover">
                    {/* Wind-tunnel aerodynamic streamlines */}
                    <path d="M-20 95 Q 140 55, 420 85" fill="none" stroke="#f87171" strokeWidth="2" opacity="0.6" />
                    <path d="M-20 120 Q 160 80, 420 110" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
                    <path d="M-20 145 Q 180 115, 420 135" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
                    {/* Speed circles & telemetry crosshair */}
                    <circle cx="290" cy="95" r="54" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
                    <circle cx="290" cy="95" r="34" fill="#ef4444" opacity="0.15" />
                    {/* GT Racecar Silhouette + Rear Wing */}
                    <path
                        d="M 45 215 L 65 170 L 95 170 L 105 188 L 165 162 L 255 162 L 325 185 L 355 202 L 355 222 L 45 222 Z"
                        fill="#18181b"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                    />
                    {/* Glowing LED Taillight Bar */}
                    <rect x="62" y="196" width="58" height="5" rx="2.5" fill="#ff1e42" />
                    {/* Wheels */}
                    <circle cx="115" cy="222" r="24" fill="#09090b" stroke="#e4e4e7" strokeWidth="3" />
                    <circle cx="115" cy="222" r="10" fill="#ef4444" />
                    <circle cx="295" cy="222" r="24" fill="#09090b" stroke="#e4e4e7" strokeWidth="3" />
                    <circle cx="295" cy="222" r="10" fill="#ef4444" />
                    {/* Track kerb stripes */}
                    <rect x="0" y="248" width="400" height="8" fill="#ef4444" opacity="0.8" />
                    <rect x="30" y="248" width="40" height="8" fill="#ffffff" />
                    <rect x="130" y="248" width="40" height="8" fill="#ffffff" />
                    <rect x="230" y="248" width="40" height="8" fill="#ffffff" />
                    <rect x="330" y="248" width="40" height="8" fill="#ffffff" />
                </svg>
            )}

            {/* Theme 2: Minimalist Architecture & Japandi Interiors */}
            {!isMotorsport && isArchitecture && (
                <svg viewBox="0 0 400 320" className="w-full h-full object-cover">
                    {/* Warm ambient sun / pendant glow */}
                    <circle cx="275" cy="95" r="48" fill="#fde68a" opacity="0.25" />
                    <line x1="275" y1="0" x2="275" y2="75" stroke="#fef3c7" strokeWidth="2" />
                    <path d="M 245 85 Q 275 65, 305 85 Z" fill="#fef3c7" />
                    {/* Brutalist Concrete Archway */}
                    <path
                        d="M 65 260 L 65 130 A 75 75 0 0 1 215 130 L 215 260 Z"
                        fill="none"
                        stroke="#e7e5e4"
                        strokeWidth="3"
                        opacity="0.75"
                    />
                    {/* Shoji / Minimalist Wooden Slats */}
                    <rect x="85" y="135" width="110" height="125" fill="#d6d3d1" opacity="0.15" />
                    <line x1="120" y1="135" x2="120" y2="260" stroke="#e7e5e4" strokeWidth="1.5" opacity="0.5" />
                    <line x1="155" y1="135" x2="155" y2="260" stroke="#e7e5e4" strokeWidth="1.5" opacity="0.5" />
                    <line x1="85" y1="185" x2="195" y2="185" stroke="#e7e5e4" strokeWidth="1.5" opacity="0.5" />
                    {/* Minimalist Low-Profile Lounge Chair / Table */}
                    <rect x="230" y="210" width="110" height="10" rx="3" fill="#d97706" />
                    <line x1="245" y1="220" x2="245" y2="260" stroke="#f5f5f4" strokeWidth="3" />
                    <line x1="325" y1="220" x2="325" y2="260" stroke="#f5f5f4" strokeWidth="3" />
                    <line x1="25" y1="260" x2="375" y2="260" stroke="#a8a29e" strokeWidth="2" />
                </svg>
            )}

            {/* Theme 3: Cyberpunk Neon & Developer Hardware Setup */}
            {!isMotorsport && !isArchitecture && isCyberOrSetup && (
                <svg viewBox="0 0 400 320" className="w-full h-full object-cover">
                    {/* Neon Horizon Glow */}
                    <circle cx="200" cy="145" r="70" fill="#ec4899" opacity="0.22" />
                    {/* Cyberpunk City Towers / Dual Monitor Frames */}
                    <rect x="55" y="75" width="135" height="95" rx="8" fill="#09090b" stroke="#22d3ee" strokeWidth="2.5" />
                    <rect x="210" y="90" width="135" height="80" rx="8" fill="#09090b" stroke="#e879f9" strokeWidth="2.5" />
                    {/* Simulated IDE Code Lines */}
                    <rect x="70" y="92" width="55" height="5" rx="2" fill="#22d3ee" />
                    <rect x="70" y="105" width="95" height="5" rx="2" fill="#a855f7" />
                    <rect x="82" y="118" width="75" height="5" rx="2" fill="#34d399" />
                    <rect x="70" y="131" width="60" height="5" rx="2" fill="#f472b6" />
                    {/* Terminal Bars on Right Screen */}
                    <rect x="226" y="108" width="40" height="45" rx="3" fill="#22d3ee" opacity="0.3" />
                    <rect x="275" y="122" width="52" height="31" rx="3" fill="#e879f9" opacity="0.4" />
                    {/* Mechanical Keyboard Keycap Grid */}
                    <rect x="85" y="195" width="230" height="48" rx="8" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
                        <rect
                            key={col}
                            x={98 + col * 26}
                            y="206"
                            width="20"
                            height="11"
                            rx="2"
                            fill={col % 2 === 0 ? "#22d3ee" : "#e879f9"}
                            opacity="0.8"
                        />
                    ))}
                    <rect x="135" y="223" width="130" height="10" rx="3" fill="#f43f5e" opacity="0.85" />
                </svg>
            )}

            {/* Theme 4: Streetwear, Sneakers & Urban Fashion */}
            {!isMotorsport && !isArchitecture && !isCyberOrSetup && (
                <svg viewBox="0 0 400 320" className="w-full h-full object-cover">
                    {/* Editorial Halftone / Concentric Street Badge */}
                    <circle cx="200" cy="145" r="88" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.25" />
                    <circle cx="200" cy="145" r="64" fill="#ef4444" opacity="0.25" />
                    {/* High-Top Sneaker Side Profile */}
                    <path
                        d="M 85 215 L 85 185 Q 135 182, 165 130 L 205 130 L 212 162 Q 265 170, 315 192 L 320 215 Z"
                        fill="#f4f4f5"
                        stroke="#18181b"
                        strokeWidth="3"
                    />
                    {/* Sneaker Midsole & Red Accent Swoosh */}
                    <rect x="82" y="213" width="240" height="14" rx="5" fill="#ffffff" stroke="#18181b" strokeWidth="2.5" />
                    <path d="M 145 196 Q 205 202, 275 176 Q 220 212, 145 196 Z" fill="#ef4444" />
                    {/* Laces */}
                    <line x1="175" y1="145" x2="195" y2="145" stroke="#18181b" strokeWidth="3" />
                    <line x1="182" y1="157" x2="202" y2="157" stroke="#18181b" strokeWidth="3" />
                    <line x1="190" y1="169" x2="210" y2="169" stroke="#18181b" strokeWidth="3" />
                </svg>
            )}

            {/* Top Category Pill */}
            <div className="absolute bottom-3 left-3 pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest font-bold bg-black/55 backdrop-blur-xs text-white/95 px-2.5 py-1 rounded-full border border-white/15">
                    #{pin.tags[0]} • #{pin.tags[1]}
                </span>
            </div>
        </div>
    );
}