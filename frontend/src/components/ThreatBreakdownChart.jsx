import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Horizontal Bar Chart showing Threat Type Breakdown
 */
const ThreatBreakdownChart = ({ logs = [] }) => {
  const categories = {};
  logs.forEach(l => {
    const type = l.threat_type || l.description || l.type || "Anomalous Traffic";
    categories[type] = (categories[type] || 0) + 1;
  });

  // Default seed dataset if sparse
  const defaultData = [
    { name: 'Phishing', count: 8 },
    { name: 'Malware', count: 6 },
    { name: 'DDoS Pivot', count: 5 },
    { name: 'Brute Force', count: 4 },
    { name: 'SQL Injection', count: 3 }
  ];

  const data = Object.keys(categories).length > 0
    ? Object.entries(categories).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5)
    : defaultData;

  const barColors = ['#00f2ff', '#00b8ff', '#0077ff', '#7000ff', '#a000ff'];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
        >
          <XAxis type="number" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#aaa" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
            width={85}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#070a13', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
            itemStyle={{ color: '#00f2ff' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((_, index) => (
              <Cell key={`bar-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThreatBreakdownChart;
