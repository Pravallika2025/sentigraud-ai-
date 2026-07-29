import React from 'react';
import { Clock, ShieldAlert, AlertTriangle } from 'lucide-react';

const AttackTimeline = ({ logs = [] }) => {
  const timelineItems = logs.slice(0, 5).map((log, index) => {
    const score = log.risk_score ?? log.priority_score ?? 50;
    const severity = score >= 75 ? 'critical' : score >= 60 ? 'high' : 'medium';
    const color = severity === 'critical' ? 'text-[#ff0055] border-[#ff0055]' : severity === 'high' ? 'text-[#ff7700] border-[#ff7700]' : 'text-amber-400 border-amber-400';
    const dotColor = severity === 'critical' ? 'bg-[#ff0055]' : severity === 'high' ? 'bg-[#ff7700]' : 'bg-amber-400';
    
    return {
      id: log.id || log.event_id || index,
      event_id: log.event_id || `EVT-${index}`,
      ip: log.ip,
      type: log.threat_type || log.description || 'Reconnaissance Probe',
      score,
      time: log.timestamp || log.ts || new Date().toLocaleTimeString(),
      color,
      dotColor
    };
  });

  return (
    <div className="relative border-l border-white/10 ml-3 pl-5 space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
      {timelineItems.length === 0 ? (
        <div className="text-xs text-gray-500 font-mono py-4 text-center">
          No operations recorded in timeline.
        </div>
      ) : (
        timelineItems.map((item, idx) => (
          <div key={item.id} className="relative group">
            {/* Timeline Dot */}
            <span className={`absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border border-[#05070f] ${item.dotColor} group-hover:scale-125 transition-transform`} />
            
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span>{item.event_id}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {item.time.includes('T') ? item.time.split('T')[1].slice(0, 8) : item.time}</span>
              </div>
              <span className="text-[11px] font-mono text-gray-200 font-bold group-hover:text-[#00f2ff] transition-colors leading-tight">
                {item.type}
              </span>
              <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                <span>IP: <span className="text-white font-bold">{item.ip}</span></span>
                <span>•</span>
                <span>Risk: <span className={`${item.color} font-black`}>{item.score}</span></span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AttackTimeline;
