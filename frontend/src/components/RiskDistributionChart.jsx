import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * PRODUCTION-STABLE RISK DISTRIBUTION
 */
const RiskDistributionChart = ({ distribution = {} }) => {
  const safeVal = Number(distribution?.Safe || distribution?.Low || 0);
  const medVal = Number(distribution?.Warn || distribution?.Medium || 0);
  const highVal = Number(distribution?.High || 0);
  const critVal = Number(distribution?.Crit || distribution?.Critical || 0);

  const data = [
    { name: 'SAFE', value: safeVal, color: '#00ffaa' },
    { name: 'MED', value: medVal, color: '#ffcc00' },
    { name: 'HIGH', value: highVal, color: '#ff6600' },
    { name: 'CRIT', value: critVal, color: '#ff0055' },
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
          <XAxis dataKey="name" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
          <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#050510', border: '1px solid #333', fontSize: '10px', borderRadius: '8px' }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`dist-cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistributionChart;
