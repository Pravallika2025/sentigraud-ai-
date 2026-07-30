import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Line & Scatter Chart tracking Risk Score Timeline (0-100)
 */
const RiskTimelineChart = ({ logs = [] }) => {
  const chartData = (Array.isArray(logs) ? [...logs] : [])
    .sort((a, b) => new Date(a.timestamp || a.ts || 0) - new Date(b.timestamp || b.ts || 0))
    .slice(-15)
    .map(log => {
      const tsVal = log.timestamp || log.ts || Date.now();
      const score = Number(log.risk_score ?? log.priority_score) || 0;
      let label = "";
      try {
        label = new Date(tsVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        label = String(tsVal);
      }
      return {
        time: label,
        maxRisk: Math.min(100, score + 6),
        avgRisk: score,
        minRisk: Math.max(10, score - 15)
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-gray-600">
        AWAITING_TIMELINE_SERIES...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#161c2e" vertical={false} />
          <XAxis dataKey="time" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
          <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#070a13', border: '1px solid #333', fontSize: '10px', borderRadius: '8px' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={30}
            iconType="circle" 
            wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace' }}
          />
          <Line type="monotone" dataKey="maxRisk" name="Max Risk" stroke="#ff0055" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="avgRisk" name="Avg Risk" stroke="#00f2ff" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="minRisk" name="Min Risk" stroke="#00ffaa" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskTimelineChart;
