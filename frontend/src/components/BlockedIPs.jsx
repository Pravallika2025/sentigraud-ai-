import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, XCircle } from 'lucide-react';

const BlockedIPs = ({ blocked = [], onUnblock = () => {} }) => {
  if (!blocked || blocked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 text-xs text-center border-2 border-dashed border-white/5 rounded-2xl h-full min-h-[200px]">
        <ShieldCheck size={36} className="mb-3 text-green-400/40" />
        <p className="font-mono">No active quarantines.<br/>Perimeter is secure.</p>
      </div>
    );
  }

  const formatTime = (tsRaw) => {
    if (!tsRaw) return new Date().toLocaleTimeString();
    try {
      return new Date(tsRaw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(tsRaw);
    }
  };

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
      {blocked.map((item, idx) => (
        <div key={item.id || item.ip || idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3 group hover:border-red-500/30 transition-all">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mt-0.5 shadow-[0_0_10px_rgba(239,68,68,0.15)] flex-shrink-0">
            <ShieldAlert size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-mono text-xs font-bold text-gray-100 truncate">{item.ip}</h4>
              <button 
                onClick={() => onUnblock(item.ip)}
                className="p-1 rounded bg-white/5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all flex items-center gap-1 text-[10px] px-2 py-0.5 border border-white/10"
                title="Revoke Block"
              >
                <XCircle size={12} /> Revoke
              </button>
            </div>
            <p className="text-[10px] text-gray-400 truncate">{item.reason || "Autonomous Quarantine"}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] text-gray-500 flex items-center gap-1 font-mono">
                <Clock size={9} />
                {formatTime(item.timestamp || item.ts)}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase tracking-wider border border-red-500/20">
                Quarantined
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlockedIPs;
