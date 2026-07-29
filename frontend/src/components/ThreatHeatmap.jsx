import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw } from 'lucide-react';

const ThreatHeatmap = ({ logs = [] }) => {
  const [grid, setGrid] = useState([]);

  useEffect(() => {
    // Generate an 8x8 grid representing threat nodes
    const size = 64; // 8x8
    const tempGrid = [];
    for (let i = 0; i < size; i++) {
      // Pick random initial states
      const rand = Math.random();
      let status = 'nominal'; // nominal, low, medium, high, critical
      let val = 0;
      if (rand > 0.92) {
        status = 'critical';
        val = Math.floor(Math.random() * 25) + 75;
      } else if (rand > 0.85) {
        status = 'high';
        val = Math.floor(Math.random() * 15) + 60;
      } else if (rand > 0.70) {
        status = 'medium';
        val = Math.floor(Math.random() * 20) + 40;
      } else if (rand > 0.50) {
        status = 'low';
        val = Math.floor(Math.random() * 20) + 10;
      }
      tempGrid.push({ id: i, status, val });
    }

    // Overwrite some nodes using actual live threat log risks
    logs.slice(0, 8).forEach((log, idx) => {
      const score = log.risk_score ?? log.priority_score ?? 50;
      let status = 'nominal';
      if (score >= 75) status = 'critical';
      else if (score >= 60) status = 'high';
      else if (score >= 40) status = 'medium';
      else if (score > 0) status = 'low';

      // Pick fixed spots or spread them out
      const spot = (idx * 7 + 3) % size;
      tempGrid[spot] = { id: spot, status, val: score, ip: log.ip };
    });

    setGrid(tempGrid);
  }, [logs]);

  const getColorClass = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500 shadow-[0_0_10px_#ff0055] border-red-400';
      case 'high': return 'bg-orange-500 shadow-[0_0_8px_#ff7700] border-orange-400';
      case 'medium': return 'bg-amber-500 shadow-[0_0_6px_#ffaa00] border-amber-400';
      case 'low': return 'bg-blue-500/40 border-blue-400/30';
      default: return 'bg-white/[0.02] border-white/5';
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Heatmap Nodes Matrix</span>
        <div className="flex gap-2 text-[8px] font-mono text-gray-500">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Crit</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]"></span> Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1.5 p-2 bg-black/40 rounded-xl border border-white/5 flex-1 items-center justify-center">
        {grid.map((node) => (
          <div
            key={node.id}
            title={node.ip ? `${node.ip} (Risk: ${node.val})` : `Perimeter Node ${node.id} (Nominal)`}
            className={`w-full aspect-square rounded transition-all duration-500 border ${getColorClass(node.status)} cursor-crosshair hover:scale-110`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreatHeatmap;
