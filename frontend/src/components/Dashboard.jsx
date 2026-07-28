import React, { useState, useEffect, useRef } from 'react';
import { Shield, Activity, Lock, Server, Zap, LogOut, Radio, RefreshCw, Flame, Trash2 } from 'lucide-react';
import MetricsCard from './MetricsCard';
import ThreatTable from './ThreatTable';
import BlockedIPs from './BlockedIPs';
import ThreatChart from './ThreatChart';
import RiskDistributionChart from './RiskDistributionChart';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://127.0.0.1:8000';
};

const API_BASE = getApiBase();

const Dashboard = ({ token, logout }) => {
  if (!token) {
    logout();
    return null;
  }

  const [socData, setSocData] = useState(null);
  const [streamHealth, setStreamHealth] = useState('RECOVERY');
  const [isActionBusy, setIsActionBusy] = useState(false);
  
  const pollTimer = useRef(null);
  const ws = useRef(null);
  const isFetching = useRef(false);
  const abortController = useRef(null);

  // STABILIZED SNAPSHOT POLL
  const syncSocNexus = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/snapshot` : `${API_BASE}/api/snapshot`;
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: abortController.current.signal
      });

      if (res.status === 401) { logout(); return; }

      if (res.ok) {
        const fresh = await res.json();
        setSocState(fresh);
        if (ws.current?.readyState !== WebSocket.OPEN) {
          setStreamHealth('POLLING');
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn("NEXUS_LINK_DEGRADED - Retrying via HTTP Polling");
        setStreamHealth('RECOVERY');
      }
    } finally {
      isFetching.current = false;
      pollTimer.current = setTimeout(syncSocNexus, 3500);
    }
  };

  const setSocState = (fresh) => {
    setSocData(prev => {
      if (!prev) return fresh;
      const seen = new Set(fresh.logs.map(l => l.id || l.event_id));
      const pending = (prev.logs || []).filter(l => !seen.has(l.id || l.event_id)).slice(0, 5);

      return {
        ...fresh,
        logs: [...pending, ...(fresh.logs || [])].slice(0, 30)
      };
    });
  };

  // WEBSOCKET (LIVE DISPATCH IF SUPPORTED)
  const connectNexusV1 = () => {
    try {
      const wsProtocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
      const host = API_BASE.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${host}/ws`;

      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => setStreamHealth('ACTIVE');
      ws.current.onclose = () => {
        setStreamHealth('POLLING');
        // Will seamlessly poll via syncSocNexus
      };
      ws.current.onerror = () => {
        setStreamHealth('POLLING');
      };

      ws.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "EVENT_ALERT") {
            setSocData(prev => {
              if (!prev) return prev;
              if (prev.logs.some(l => (l.id || l.event_id) === msg.data.id)) return prev;
              return {
                ...prev,
                metrics: { ...prev.metrics, incidents: (prev.metrics?.incidents || 0) + 1 },
                logs: [{...msg.data, ts: msg.data.ts || new Date().toISOString()}, ...prev.logs].slice(0, 30)
              };
            });
          }
        } catch (err) { console.error("STREAM_PARSE_FAULT"); }
      };
    } catch (e) {
      setStreamHealth('POLLING');
    }
  };

  // ACTIONS: BLOCK IP
  const handleBlockIP = async (ip) => {
    if (!ip || isActionBusy) return;
    setIsActionBusy(true);
    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/block_ip` : `${API_BASE}/api/block_ip`;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip, reason: 'Manual Security Quarantine' })
      });
      syncSocNexus();
    } catch (e) {
      console.error("BLOCK_IP_FAULT", e);
    } finally {
      setIsActionBusy(false);
    }
  };

  // ACTIONS: UNBLOCK IP
  const handleUnblockIP = async (ip) => {
    if (!ip || isActionBusy) return;
    setIsActionBusy(true);
    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/unblock_ip` : `${API_BASE}/api/unblock_ip`;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip })
      });
      syncSocNexus();
    } catch (e) {
      console.error("UNBLOCK_IP_FAULT", e);
    } finally {
      setIsActionBusy(false);
    }
  };

  // ACTIONS: TRIGGER SYNTHETIC THREAT
  const handleSimulateThreat = async () => {
    setIsActionBusy(true);
    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/sim_threat` : `${API_BASE}/api/sim_threat`;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      syncSocNexus();
    } catch (e) {
      console.error("SIM_THREAT_FAULT", e);
    } finally {
      setIsActionBusy(false);
    }
  };

  // ACTIONS: CLEAR LOGS
  const handleClearLogs = async () => {
    if (!window.confirm("Clear all perimeter security logs?")) return;
    setIsActionBusy(true);
    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/clear_logs` : `${API_BASE}/api/clear_logs`;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      syncSocNexus();
    } catch (e) {
      console.error("CLEAR_LOGS_FAULT", e);
    } finally {
      setIsActionBusy(false);
    }
  };

  useEffect(() => {
    syncSocNexus();
    connectNexusV1();
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      if (abortController.current) abortController.current.abort();
      if (ws.current) ws.current.close();
    };
  }, [token]);

  if (!socData) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center font-mono text-[#00f2ff]">
        <Activity className="animate-spin mb-4" size={32} />
        <div className="text-[10px] tracking-[5px] uppercase">Nexus_Awaiting_Snapshot...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#050510] text-[#e0e0e0] font-sans selection:bg-[#00f2ff] selection:text-black">
      
      {/* FINAL PRODUCTION HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 glass-card border border-white/5 bg-white/[0.01] rounded-2xl">
        <div className="flex items-center gap-4">
          <Shield size={36} className="text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)]" />
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Sentinel<span className="text-[#7000ff]">GPT</span></h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md flex items-center gap-2 border ${
                streamHealth === 'ACTIVE' 
                  ? 'border-[#00f2ff]/30 text-[#00f2ff] bg-[#00f2ff]/5' 
                  : streamHealth === 'POLLING'
                  ? 'border-green-500/30 text-green-400 bg-green-500/5'
                  : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
              }`}>
                <Radio size={10} className={streamHealth === 'ACTIVE' ? 'animate-pulse' : ''} /> 
                {streamHealth === 'ACTIVE' ? 'NEXUS_WEBSOCKET_ACTIVE' : 'SERVERLESS_REALTIME_POLLING'}
              </span>
              <span className="text-[9px] text-gray-400 font-mono tracking-wider uppercase flex items-center gap-1 border border-white/10 px-2.5 py-1 rounded-md bg-white/5">
                VERCEL_PROD_READY
              </span>
            </div>
          </div>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleSimulateThreat}
            disabled={isActionBusy}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-all uppercase px-3 py-2 border border-amber-500/20 bg-amber-500/10 rounded-lg active:scale-95 flex items-center gap-1.5"
            title="Inject test threat event into telemetry pipeline"
          >
            <Flame size={14} /> Inject Threat
          </button>
          <button 
            onClick={syncSocNexus}
            disabled={isActionBusy}
            className="text-[10px] font-bold text-gray-300 hover:text-white transition-all uppercase px-3 py-2 border border-white/10 bg-white/5 rounded-lg active:scale-95 flex items-center gap-1.5"
            title="Manual sync with defense core"
          >
            <RefreshCw size={14} className={isFetching.current ? "animate-spin" : ""} /> Sync
          </button>
          <button 
            onClick={handleClearLogs}
            disabled={isActionBusy}
            className="text-[10px] font-bold text-gray-400 hover:text-red-400 transition-all uppercase px-3 py-2 border border-white/10 bg-white/5 rounded-lg active:scale-95 flex items-center gap-1.5"
            title="Clear all logs"
          >
            <Trash2 size={14} /> Clear
          </button>
          <button 
            onClick={logout} 
            className="text-[10px] font-bold text-gray-500 hover:text-red-500 transition-all uppercase px-3.5 py-2 border border-white/10 rounded-lg active:scale-95 flex items-center gap-1.5 bg-red-500/5 hover:bg-red-500/10"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* METRICS HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricsCard title="PERIMETER_INCIDENTS" value={socData.metrics?.incidents || 0} icon={<Zap size={20}/>} />
        <MetricsCard title="LEVEL_CRITICAL" value={socData.metrics?.critical || 0} icon={<Shield size={20}/>} colorClass="text-red-500" />
        <MetricsCard title="TOTAL_TRAFFIC_LOGS" value={socData.metrics?.traffic || 0} icon={<Server size={20}/>} colorClass="text-[#00f2ff]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[340px]">
            <div className="glass-card p-6 border border-white/5 bg-[#08080c] rounded-2xl">
              <h3 className="text-xs font-black text-gray-500 mb-6 uppercase tracking-[3px]">Threat Flow Velocity</h3>
              <div className="h-[230px]">
                <ThreatChart logs={socData.logs || []} />
              </div>
            </div>
            <div className="glass-card p-6 border border-white/5 bg-[#08080c] rounded-2xl">
              <h3 className="text-xs font-black text-gray-500 mb-6 uppercase tracking-[3px]">Sector Risk Map</h3>
              <div className="h-[230px]">
                <RiskDistributionChart distribution={socData.dist || {Safe:1, Warn:0, Crit:0}} />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 border border-white/5 min-h-[440px] rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[3px]">Real-time Nexus Telemetry Stream</h3>
              <span className="text-[9px] font-mono text-gray-600">{socData.logs?.length || 0} Active Events</span>
            </div>
            <ThreatTable logs={socData.logs || []} onBlock={handleBlockIP} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card p-6 h-full border border-white/5 bg-gradient-to-b from-white/[0.015] to-transparent flex flex-col rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[3px]">Security Quarantine</h3>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                {socData.blocked_ips?.length || 0} Blocked
              </span>
            </div>
            <div className="flex-1">
              <BlockedIPs blocked={socData.blocked_ips || []} onUnblock={handleUnblockIP} />
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500 uppercase">Integrity Check</span>
                <span className="text-green-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span> NOMINAL
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500 uppercase">Detection Engine</span>
                <span className="text-white font-mono">AUTONOMOUS HEURISTICS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
