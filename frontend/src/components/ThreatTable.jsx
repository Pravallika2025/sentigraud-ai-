import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const ThreatTable = ({ logs = [], onBlock = () => {} }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500 italic text-xs font-mono border-2 border-dashed border-white/5 rounded-xl">
        SYSTEM_SCANNING_MATRIX... NO RECENT THREAT INCIDENTS LOGGED.
      </div>
    );
  }

  const getRiskColor = (score) => {
    const val = Number(score) || 0;
    if (val >= 75) return '#ff0055'; // Critical
    if (val >= 60) return '#ff6600'; // High
    if (val >= 40) return '#ffcc00'; // Med
    return '#00ffaa'; // Low/Safe
  };

  const formatTimestamp = (tsRaw) => {
    if (!tsRaw) return new Date().toLocaleTimeString();
    try {
      return new Date(tsRaw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
<<<<<<< HEAD
    } catch (e) {
=======
    } catch {
>>>>>>> b14c3a6d116677458df651f45a076b68ee997c05
      return String(tsRaw);
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
            <th className="pb-3 font-bold">Source IP</th>
            <th className="pb-3 font-bold">Threat Vector</th>
            <th className="pb-3 font-bold">Risk Level</th>
            <th className="pb-3 font-bold text-right">Quarantine</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {logs.map((log, index) => {
            const score = log.risk_score ?? log.priority_score ?? 0;
            const threatType = log.threat_type || log.description || log.type || "Anomalous Traffic";
            const timeStr = formatTimestamp(log.timestamp || log.ts);
            const ipStr = log.ip || "127.0.0.1";
            const color = getRiskColor(score);

            return (
              <tr key={log.id || log.event_id || index} className="group hover:bg-white/[0.03] transition-colors">
                <td className="py-3.5">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-gray-200">{ipStr}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{timeStr}</span>
                  </div>
                </td>
                <td className="py-3.5">
                  <span 
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md inline-block max-w-[220px] truncate"
                    style={{ 
                      backgroundColor: `${color}15`, 
                      color: color,
                      border: `1px solid ${color}30`
                    }}
                  >
                    {threatType}
                  </span>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className="h-full transition-all duration-700"
                        style={{ 
                          width: `${Math.min(100, Math.max(5, score))}%`, 
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}`
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: color }}>
                      {score}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 text-right">
                  <button 
                    onClick={() => onBlock(ipStr)}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-80 group-hover:opacity-100 border border-white/5"
                    title={`Block IP ${ipStr}`}
                  >
                    <ShieldAlert size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ThreatTable;
