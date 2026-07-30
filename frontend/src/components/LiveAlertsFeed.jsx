import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';

/**
 * Live Alerts Feed card stream matching the right column in screenshot
 */
const LiveAlertsFeed = ({ logs = [], onBlock = () => {} }) => {
  const [acknowledged, setAcknowledged] = useState(new Set());

  const handleAck = (id) => {
    setAcknowledged(prev => new Set([...prev, id]));
  };

  const alertItems = logs.slice(0, 10).map((log, index) => {
    const score = log.risk_score ?? log.priority_score ?? 70;
    const severity = score >= 75 ? 'CRITICAL' : score >= 60 ? 'HIGH' : 'MEDIUM';
    const color = severity === 'CRITICAL' ? '#ff0055' : severity === 'HIGH' ? '#ff7700' : '#ffcc00';
    const id = log.id || log.event_id || index;
    const isAck = acknowledged.has(id);
    const ip = log.ip || "185.57.108.334";
    const threatText = log.threat_type || log.description || "Malware Distribution URL";
    const payloadUrl = `http://${ip}:47981/bin.sh`;

    return {
      id,
      severity,
      color,
      ip,
      threatText,
      payloadUrl,
      time: log.timestamp || log.ts || new Date().toLocaleTimeString(),
      isAck
    };
  });

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
      {alertItems.map((alert) => (
        <div 
          key={alert.id}
          className={`p-3.5 rounded-xl border transition-all ${
            alert.isAck 
              ? 'bg-white/[0.01] border-white/5 opacity-50' 
              : 'bg-[#0b0f1d] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span 
              className="text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider"
              style={{ backgroundColor: `${alert.color}20`, color: alert.color, border: `1px solid ${alert.color}40` }}
            >
              {alert.severity}
            </span>
            <span className="text-[9px] font-mono text-gray-500">{alert.time}</span>
          </div>

          <div className="text-[11px] font-mono text-gray-200 font-bold mb-1 truncate flex items-center gap-1.5">
            {alert.severity === 'CRITICAL' ? (
              <ShieldAlert size={14} className="text-[#ff0055] shrink-0" />
            ) : (
              <AlertTriangle size={14} className="text-[#ff7700] shrink-0" />
            )}
            [LIVE FEED] UNKNOWN: {alert.threatText}
          </div>

          <div className="text-[10px] font-mono text-gray-400 bg-black/40 p-1.5 rounded mb-2.5 truncate border border-white/5">
            {alert.payloadUrl}
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => handleAck(alert.id)}
              disabled={alert.isAck}
              className={`text-[9px] font-mono font-bold px-3 py-1 rounded transition-all uppercase flex items-center gap-1 ${
                alert.isAck 
                  ? 'bg-white/5 text-gray-500 border border-white/5' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95'
              }`}
            >
              {alert.isAck ? <><CheckCircle size={10}/> ACKNOWLEDGED</> : "ACKNOWLEDGE"}
            </button>

            <button
              onClick={() => onBlock(alert.ip)}
              className="text-[9px] font-mono font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded border border-red-500/20 transition-all uppercase"
            >
              Quarantine IP
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveAlertsFeed;
