import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Donut chart showing Severity Distribution (Critical, High, Medium, Low)
 */
const SeverityDonutChart = ({ distribution = { Safe: 1, Low: 1, Warn: 2, Medium: 1, High: 10, Crit: 18, Critical: 18 } }) => {
  const critCount = Number(distribution.Critical ?? distribution.Crit ?? 18);
  const highCount = Number(distribution.High ?? 10);
  const medCount = Number(distribution.Medium ?? distribution.Warn ?? 1);
  const lowCount = Number(distribution.Safe ?? distribution.Low ?? 0);

  const data = [
    { name: 'Critical', value: critCount, color: '#ff0055' },
    { name: 'High', value: highCount, color: '#ff7700' },
    { name: 'Medium', value: medCount, color: '#ffcc00' },
    ...(lowCount > 0 ? [{ name: 'Low', value: lowCount, color: '#00ffaa' }] : [])
  ];

  const total = critCount + highCount + medCount + lowCount;

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-2">
      <div className="w-full md:w-1/2 h-[180px] relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#070a13', border: '1px solid #333', borderRadius: '8px', fontSize: '11px' }}
              itemStyle={{ color: '#00f2ff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Column matching screenshot */}
      <div className="w-full md:w-1/2 space-y-2 text-[11px] font-mono pr-2">
        <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.02]">
          <span className="flex items-center gap-2 text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff0055]"></span> Critical
          </span>
          <span className="font-bold text-white">{critCount}</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.02]">
          <span className="flex items-center gap-2 text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff7700]"></span> High
          </span>
          <span className="font-bold text-white">{highCount}</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.02]">
          <span className="flex items-center gap-2 text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffcc00]"></span> Medium
          </span>
          <span className="font-bold text-white">{medCount}</span>
        </div>
        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-gray-400">
          <span>Total</span>
          <span className="font-bold text-[#00f2ff]">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default SeverityDonutChart;
