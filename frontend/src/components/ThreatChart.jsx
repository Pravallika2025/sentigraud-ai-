import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * PRODUCTION-STABLE THREAT PULSE CHART
 */
const ThreatChart = ({ logs = [] }) => {
  const chartData = (Array.isArray(logs) ? [...logs] : [])
    .sort((a, b) => new Date(a.timestamp || a.ts || 0) - new Date(b.timestamp || b.ts || 0))
    .slice(-15)
    .map(log => {
      const tsVal = log.timestamp || log.ts || Date.now();
      const score = Number(log.risk_score ?? log.priority_score) || 0;
      let label = "";
      try {
        label = new Date(tsVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch {
        label = String(tsVal);
      }
      return {
        name: label,
        risk: score
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-gray-600">
        AWAITING_TELEMETRY_DATA...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
          <XAxis dataKey="name" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
          <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#050510', border: '1px solid #333', fontSize: '10px', borderRadius: '8px' }}
            itemStyle={{ color: '#00f2ff' }}
          />
          <Area 
            type="monotone" 
            dataKey="risk" 
            stroke="#00f2ff" 
            strokeWidth={2} 
            fill="url(#riskGrad)" 
            isAnimationActive={true} 
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThreatChart;
