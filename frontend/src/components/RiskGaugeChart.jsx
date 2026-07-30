import React from 'react';

/**
 * Semi-Circle Risk Gauge Meter matching the Cyber Sentinel screenshot layout
 */
const RiskGaugeChart = ({ score = 83, label = "CRITICAL" }) => {
  const normalizedScore = Math.min(100, Math.max(0, Number(score) || 0));
  // Angle for SVG arc (0 to 180 degrees)
  const angle = (normalizedScore / 100) * 180;
  
  // Color based on risk score
  const getColor = (val) => {
    if (val >= 75) return '#ff0055'; // Critical
    if (val >= 60) return '#ff7700'; // High
    if (val >= 40) return '#ffcc00'; // Medium
    return '#00ffaa'; // Low
  };

  const currentColor = getColor(normalizedScore);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <svg viewBox="0 0 200 110" className="w-full max-h-[160px] overflow-visible">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffaa" />
            <stop offset="40%" stopColor="#ffcc00" />
            <stop offset="70%" stopColor="#ff7700" />
            <stop offset="100%" stopColor="#ff0055" />
          </linearGradient>
        </defs>

        {/* Background Semi-circle Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#161c2e"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Foreground Colored Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="251.32"
          strokeDashoffset={251.32 - (251.32 * normalizedScore) / 100}
          className="transition-all duration-1000 ease-out"
        />

        {/* Needle Indicator */}
        <g transform={`rotate(${angle - 90}, 100, 100)`} className="transition-all duration-700 ease-out">
          <line x1="100" y1="100" x2="100" y2="35" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill="#00f2ff" />
        </g>
      </svg>

      {/* Center Score & Text */}
      <div className="text-center -mt-6">
        <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1">
          {normalizedScore}
        </div>
        <div 
          className="text-[10px] font-black uppercase tracking-[3px] mt-0.5"
          style={{ color: currentColor }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default RiskGaugeChart;
