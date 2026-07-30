import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, LayoutDashboard, Search, History, Bot, Upload, LogOut, Radio,
  Flame, RefreshCw, Trash2, AlertOctagon, AlertTriangle, Zap, Volume2, VolumeX,
  ShieldAlert, Download, Filter, X, ChevronDown, Activity, Target, Eye,
  TrendingUp, Clock, Globe, Server, Lock, FileText, User, HelpCircle, HardDrive
} from 'lucide-react';
import RiskGaugeChart from './RiskGaugeChart';
import SeverityDonutChart from './SeverityDonutChart';
import ThreatBreakdownChart from './ThreatBreakdownChart';
import RiskTimelineChart from './RiskTimelineChart';
import LiveAlertsFeed from './LiveAlertsFeed';
import ThreatTable from './ThreatTable';
import BlockedIPs from './BlockedIPs';
import ThreatHeatmap from './ThreatHeatmap';
import AttackTimeline from './AttackTimeline';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://127.0.0.1:8000';
};

const API_BASE = getApiBase();

// MITRE ATT&CK Mappings
const MITRE_MAP = {
  'Credential Stuffing': { tactic: 'Initial Access', technique: 'T1078', name: 'Valid Accounts' },
  'DDoS Attempt': { tactic: 'Impact', technique: 'T1498', name: 'Network DoS' },
  'SQL Injection': { tactic: 'Initial Access', technique: 'T1190', name: 'Exploit Public App' },
  'Port Scan': { tactic: 'Discovery', technique: 'T1046', name: 'Network Service Discovery' },
  'Brute Force': { tactic: 'Credential Access', technique: 'T1110', name: 'Brute Force' },
  'Malware Payload': { tactic: 'Execution', technique: 'T1204', name: 'User Execution' },
  'Unauthorized Access': { tactic: 'Lateral Movement', technique: 'T1021', name: 'Remote Services' },
  'Phishing Attack Vector': { tactic: 'Initial Access', technique: 'T1566', name: 'Phishing' },
};

const AI_REMEDIATIONS = {
  'Credential Stuffing': 'Enable MFA immediately. Reset compromised credentials. Implement CAPTCHA. Add IP-based rate limiting on auth endpoints.',
  'DDoS Attempt': 'Activate CDN-level DDoS protection. Implement traffic shaping. Contact upstream provider for null-routing.',
  'SQL Injection': 'Apply parameterized queries. Deploy WAF rule. Audit DB access logs. Patch vulnerable endpoints immediately.',
  'Port Scan': 'Block source IP at firewall. Review exposed services. Close unnecessary ports. Enable port-knock authentication.',
  'Brute Force': 'Lock account after 5 failures. Implement exponential backoff. Alert account owners. Block source IP range.',
  'Malware Payload': 'Isolate affected system. Run AV scan. Preserve memory dump. Notify IR team. Check lateral movement.',
  'Unauthorized Access': 'Revoke active sessions. Audit IAM permissions. Enable privileged access logging. Implement least-privilege.',
  'Phishing Attack Vector': 'Block sender domain. Alert users. Enable link-scanning. Update email security gateway rules.',
};

const INITIAL_FALLBACK_LOGS = [
  { id: 1, event_id: 'ANOM-101', ip: '185.220.101.5', description: 'Credential Stuffing Pattern', priority_score: 88, risk_score: 88, threat_type: 'Credential Stuffing', ts: new Date(Date.now() - 60000).toISOString() },
  { id: 2, event_id: 'ANOM-102', ip: '103.44.20.12', description: 'Rapid Velocity Pivot (DDoS Vector)', priority_score: 94, risk_score: 94, threat_type: 'DDoS Attempt', ts: new Date(Date.now() - 180000).toISOString() },
  { id: 3, event_id: 'ANOM-103', ip: '194.26.29.114', description: 'SQL Injection Payload Pattern', priority_score: 82, risk_score: 82, threat_type: 'SQL Injection', ts: new Date(Date.now() - 300000).toISOString() },
  { id: 4, event_id: 'ANOM-104', ip: '45.12.33.109', description: 'Tor Exit Node High-Frequency Scan', priority_score: 72, risk_score: 72, threat_type: 'Port Scan', ts: new Date(Date.now() - 420000).toISOString() },
  { id: 5, event_id: 'ANOM-105', ip: '87.249.134.19', description: 'Brute Force Authentication Spike', priority_score: 68, risk_score: 68, threat_type: 'Brute Force', ts: new Date(Date.now() - 540000).toISOString() },
  { id: 6, event_id: 'ANOM-106', ip: '91.240.118.172', description: 'Malicious User-Agent Probe', priority_score: 55, risk_score: 55, threat_type: 'Malware Payload', ts: new Date(Date.now() - 660000).toISOString() },
  { id: 7, event_id: 'ANOM-107', ip: '192.168.1.105', description: 'Internal Reconnaissance Probe', priority_score: 45, risk_score: 45, threat_type: 'Unauthorized Access', ts: new Date(Date.now() - 780000).toISOString() },
  { id: 8, event_id: 'ANOM-108', ip: '185.156.177.3', description: 'Unauthorized Port Scan Sweep', priority_score: 35, risk_score: 35, threat_type: 'Port Scan', ts: new Date(Date.now() - 900000).toISOString() },
];

const INITIAL_FALLBACK_BLOCKED = [
  { id: 1, ip: '103.44.20.12', reason: 'High Risk Velocity Pivot', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 2, ip: '185.220.101.5', reason: 'Credential Stuffing Vector', timestamp: new Date(Date.now() - 1500000).toISOString() },
];

const getStoredLogs = () => {
  try { const raw = localStorage.getItem('sentinel_soc_logs'); if (raw) return JSON.parse(raw); } catch { /* */ }
  return INITIAL_FALLBACK_LOGS;
};
const getStoredBlockedIPs = () => {
  try { const raw = localStorage.getItem('sentinel_blocked_ips'); if (raw) return JSON.parse(raw); } catch { /* */ }
  return INITIAL_FALLBACK_BLOCKED;
};
const saveSnapshotLocally = (logs, blocked_ips) => {
  try {
    localStorage.setItem('sentinel_soc_logs', JSON.stringify(logs));
    localStorage.setItem('sentinel_blocked_ips', JSON.stringify(blocked_ips));
  } catch { /* */ }
};

const computeSnapshot = (logs, blocked_ips) => {
  const incidents = Math.max(logs.length, 8);
  const critical = logs.filter(l => (l.risk_score ?? l.priority_score ?? 0) >= 75).length;
  const high = logs.filter(l => { const s = l.risk_score ?? l.priority_score ?? 0; return s >= 60 && s < 75; }).length;
  const medium = logs.filter(l => { const s = l.risk_score ?? l.priority_score ?? 0; return s >= 40 && s < 60; }).length;
  const low = logs.filter(l => (l.risk_score ?? l.priority_score ?? 0) < 40).length;
  const avgScore = logs.length ? Math.round(logs.reduce((a, l) => a + (l.risk_score ?? l.priority_score ?? 0), 0) / logs.length) : 83;
  return {
    metrics: { incidents, critical, high, medium, low, avgRiskScore: avgScore, blocked: blocked_ips.length },
    logs, blocked_ips,
    dist: { Critical: critical, High: high, Medium: medium, Low: low },
  };
};

const getAiRemediation = (threatType, score) => {
  const base = AI_REMEDIATIONS[threatType] || 'Investigate source IP. Correlate with SIEM logs. Apply appropriate firewall rule. Monitor for recurrence.';
  const severity = score >= 90 ? '🔴 CRITICAL — Immediate Response Required. ' : score >= 75 ? '🟠 HIGH — Response within 1 hour. ' : score >= 60 ? '🟡 MEDIUM — Review within 4 hours. ' : '🟢 LOW — Review within 24 hours. ';
  return severity + base;
};

const Dashboard = ({ token, logout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [socData, setSocData] = useState(() => computeSnapshot(getStoredLogs(), getStoredBlockedIPs()));
  const [streamHealth, setStreamHealth] = useState('AUTO-REFRESH ON');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [activeDefectionAlert, setActiveDefectionAlert] = useState(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toLocaleTimeString());
  
  // AI assistant chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: '🛡️ SentinelGPT Defense Core online. Ask me about any threat, IP, or attack pattern for AI-powered triage and MITRE ATT&CK mapping.' },
  ]);

  // Upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadAnalysis, setUploadAnalysis] = useState(null);

  // Layout states
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // User Profile
  const operatorName = localStorage.getItem('sentinel_operator') || 'admin';
  const userFullName = localStorage.getItem('sentinel_user_fullname') || 'Admin User';
  const userRole = localStorage.getItem('sentinel_user_role') || 'Administrator';
  const userOrg = localStorage.getItem('sentinel_user_org') || 'Sentinel Security Core';
  const userEmail = localStorage.getItem('sentinel_user_email') || 'admin@sentinel.ai';

  const pollTimer = useRef(null);
  const ws = useRef(null);
  const isFetching = useRef(false);
  const abortController = useRef(null);
  const audioCtxRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => { if (!token) logout(); }, [token, logout]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // Web Audio Alarm
  const playAlarmSound = useCallback(() => {
    if (!alarmEnabled) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch { /* blocked */ }
  }, [alarmEnabled]);

  const setSocState = useCallback((fresh) => {
    setSocData(prev => {
      if (!prev) return fresh;
      const seen = new Set(fresh.logs.map(l => l.id || l.event_id));
      const pending = (prev.logs || []).filter(l => !seen.has(l.id || l.event_id)).slice(0, 5);
      const mergedLogs = [...pending, ...(fresh.logs || [])].slice(0, 30);
      const updatedBlocked = fresh.blocked_ips || prev.blocked_ips || [];
      saveSnapshotLocally(mergedLogs, updatedBlocked);
      return computeSnapshot(mergedLogs, updatedBlocked);
    });
    setLastUpdatedTime(new Date().toLocaleTimeString());
  }, []);

  const syncSocNexus = useCallback(async () => {
    if (isFetching.current || !token) return;
    isFetching.current = true;
    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();
    try {
      const endpoint = `${API_BASE.replace(/\/$/, '')}/api/snapshot`;
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` }, signal: abortController.current.signal });
      if (res.status === 401) { logout(); return; }
      if (res.ok) {
        const fresh = await res.json();
        setSocState(fresh);
        if (ws.current?.readyState !== WebSocket.OPEN) setStreamHealth('LIVE - AUTO-REFRESH ON');
      }
    } catch { setStreamHealth('LIVE - AUTO-REFRESH ON'); }
    finally { isFetching.current = false; pollTimer.current = setTimeout(syncSocNexus, 60000); }
  }, [token, logout, setSocState]);

  const connectNexusV1 = useCallback(() => {
    try {
      const wsProtocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
      const host = API_BASE.replace(/^https?:\/\//, '');
      ws.current = new WebSocket(`${wsProtocol}://${host}/ws`);
      ws.current.onopen = () => setStreamHealth('WEBSOCKET LIVE');
      ws.current.onclose = () => setStreamHealth('LIVE - AUTO-REFRESH ON');
      ws.current.onerror = () => setStreamHealth('LIVE - AUTO-REFRESH ON');
      ws.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'EVENT_ALERT') {
            playAlarmSound();
            setSocData(prev => {
              if (!prev) return prev;
              if (prev.logs.some(l => (l.id || l.event_id) === msg.data.id)) return prev;
              const updatedLogs = [{ ...msg.data, ts: msg.data.ts || new Date().toISOString() }, ...prev.logs].slice(0, 30);
              saveSnapshotLocally(updatedLogs, prev.blocked_ips);
              return computeSnapshot(updatedLogs, prev.blocked_ips);
            });
            setLastUpdatedTime(new Date().toLocaleTimeString());
          }
        } catch { /* */ }
      };
    } catch { setStreamHealth('LIVE - AUTO-REFRESH ON'); }
  }, [playAlarmSound]);

  const handleBlockIP = async (ip) => {
    if (!ip || isActionBusy) return;
    setIsActionBusy(true);
    try {
      const endpoint = `${API_BASE.replace(/\/$/, '')}/api/block_ip`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip, reason: 'Manual SOC Operator Quarantine' }),
      });
      if (res.status === 401) { logout(); return; }
      if (res.ok) await syncSocNexus();
    } catch {
      // Offline fallback
      setSocData(prev => {
        if (prev.blocked_ips.some(b => b.ip === ip)) return prev;
        const newBlocked = [{ id: Date.now(), ip, reason: 'Local Sandbox Quarantine', timestamp: new Date().toISOString() }, ...prev.blocked_ips];
        saveSnapshotLocally(prev.logs, newBlocked);
        return computeSnapshot(prev.logs, newBlocked);
      });
    } finally { setIsActionBusy(false); }
  };

  const handleUnblockIP = async (ip) => {
    if (!ip || isActionBusy) return;
    setIsActionBusy(true);
    try {
      const endpoint = `${API_BASE.replace(/\/$/, '')}/api/unblock_ip`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip }),
      });
      if (res.status === 401) { logout(); return; }
      if (res.ok) await syncSocNexus();
    } catch {
      // Offline fallback
      setSocData(prev => {
        const newBlocked = prev.blocked_ips.filter(b => b.ip !== ip);
        saveSnapshotLocally(prev.logs, newBlocked);
        return computeSnapshot(prev.logs, newBlocked);
      });
    } finally { setIsActionBusy(false); }
  };

  const handleSimulateThreat = async () => {
    if (isActionBusy) return;
    setIsActionBusy(true);
    setDashboardLoading(true);
    
    // Pick random threat types
    const threats = [
      { type: 'Credential Stuffing', score: 88, desc: 'Brute force credential stuffing pivot detected' },
      { type: 'DDoS Attempt', score: 94, desc: 'TCP Syn flood pivot sweep from high-risk subnet' },
      { type: 'SQL Injection', score: 82, desc: 'Exploit signature parsed in URL payload parameter' },
      { type: 'Port Scan', score: 72, desc: 'High-frequency Tor Exit Node perimeter sweep' },
      { type: 'Brute Force', score: 68, desc: 'Repetitive administrator authentication spike' },
      { type: 'Malware Payload', score: 55, desc: 'Anomalous user-agent binary script payload' },
      { type: 'Unauthorized Access', score: 45, desc: 'Internal privilege pivots anomalous endpoint' },
    ];
    const picked = threats[Math.floor(Math.random() * threats.length)];
    const simIp = `103.44.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;

    setTimeout(async () => {
      try {
        const endpoint = `${API_BASE.replace(/\/$/, '')}/api/sim_threat`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ip: simIp, type: picked.type, score: picked.score }),
        });
        if (res.status === 401) { logout(); return; }
        if (res.ok) await syncSocNexus();
      } catch {
        // Offline simulation
        const fakeId = `SIM-${Date.now()}`;
        const newLog = {
          id: fakeId,
          event_id: fakeId,
          ip: simIp,
          description: picked.desc,
          risk_score: picked.score,
          priority_score: picked.score,
          threat_type: picked.type,
          ts: new Date().toISOString()
        };
        setSocData(prev => {
          const updatedLogs = [newLog, ...prev.logs].slice(0, 30);
          saveSnapshotLocally(updatedLogs, prev.blocked_ips);
          return computeSnapshot(updatedLogs, prev.blocked_ips);
        });
      } finally {
        playAlarmSound();
        setActiveDefectionAlert({
          type: picked.type,
          ip: simIp,
          score: picked.score,
          time: new Date().toLocaleTimeString(),
          mitre: MITRE_MAP[picked.type],
          remediation: getAiRemediation(picked.type, picked.score)
        });
        setIsActionBusy(false);
        setDashboardLoading(false);
      }
    }, 800);
  };

  const handleClearLogs = async () => {
    if (isActionBusy) return;
    setIsActionBusy(true);
    try {
      const endpoint = `${API_BASE.replace(/\/$/, '')}/api/clear_logs`;
      const res = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { logout(); return; }
      if (res.ok) await syncSocNexus();
    } catch {
      setSocData(prev => {
        saveSnapshotLocally([], []);
        return computeSnapshot([], []);
      });
    } finally { setIsActionBusy(false); }
  };

  const handleDownloadReport = () => {
    try {
      const report = {
        title: 'SentinelGPT Executive Incident Report',
        generatedAt: new Date().toISOString(),
        metrics: socData.metrics,
        blockedIPs: socData.blocked_ips,
        recentIncidents: socData.logs.slice(0, 10)
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentinel_incident_report_${Date.now()}.json`;
      a.click();
    } catch { /* */ }
  };

  // AI Assistant Chat Submit
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Generate AI intelligence response
    setTimeout(() => {
      let aiText = "Analyzing threat parameters. Core query processed. Resolving CVE identifiers...";
      const query = userText.toLowerCase();

      if (query.includes('ddos') || query.includes('velocity')) {
        aiText = `🚨 DDoS / SYN Flood mitigations:\n- Apply rate limiting on iptables.\n- Forward traffic through Cloudflare CDN/WAF.\n- Enable syncookies: sysctl -w net.ipv4.tcp_syncookies=1.`;
      } else if (query.includes('sql') || query.includes('injection')) {
        aiText = `💉 SQL Injection remediations:\n- Mandate parameterized queries / Prepared statements.\n- Filter inputs against payloads: SELECT, UNION, '--'.\n- Implement WAF ModSecurity Rule 942100.`;
      } else if (query.includes('credential') || query.includes('login')) {
        aiText = `🔑 Auth Protection recommendations:\n- Lock accounts for 15 minutes after 5 failed login attempts.\n- Implement Multi-Factor Authentication (MFA).\n- Check user-agent request velocity pivots.`;
      } else if (query.includes('scan') || query.includes('port')) {
        aiText = `🔎 Discovery sweeps mitigation:\n- Close all non-essential ports.\n- Configure blockrules for high-velocity scans.\n- Mask internal structures using port-knocking.`;
      } else {
        aiText = `🛡️ threat intelligence parsed:\n- Incident threat mapped to Tactic: Discovery, Technique: T1046.\n- Recommended Action: Quarantine origin IP immediately and audit system firewall settings.`;
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 700);
  };

  // File analysis handler
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target?.files[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadAnalysis({ status: 'analyzing', name: file.name });

    setTimeout(() => {
      const isMalicious = file.name.includes('virus') || file.name.includes('malware') || file.name.includes('.sh') || file.name.includes('.exe') || Math.random() > 0.6;
      setUploadAnalysis({
        status: 'complete',
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        verdict: isMalicious ? 'MALICIOUS_PAYLOAD' : 'CLEAN',
        score: isMalicious ? Math.floor(Math.random() * 25) + 75 : 0,
        type: isMalicious ? 'Trojan.ShellScript' : 'Normal Text/Logs',
        details: isMalicious 
          ? 'Exploit signature parsed in payload segment. Mapped to MITRE T1204 (User Execution). Quarantine recommended.' 
          : 'Heuristics validation completed. Normal ASCII/UTF-8 log file format.'
      });
    }, 1500);
  };

  useEffect(() => {
    syncSocNexus();
    connectNexusV1();
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      if (abortController.current) abortController.current.abort();
      if (ws.current) ws.current.close();
    };
  }, [token, syncSocNexus, connectNexusV1]);

  if (!token) return null;

  const NAV_ITEMS = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Global Dashboard' },
    { id: 'Threat History', icon: History, label: 'Threat Log History' },
    { id: 'Analyze Threat', icon: Target, label: 'Threat IP Lookup' },
    { id: 'Security Assistant', icon: Bot, label: 'AI Cyber Assistant' },
    { id: 'File Upload', icon: Upload, label: 'Malicious File Scanner' },
  ];

  return (
    <div className="flex h-screen bg-[#05070f] text-[#d1d5db] font-sans selection:bg-[#00f2ff] selection:text-black overflow-hidden relative">
      
      {/* GLOBAL GLASS STYLING */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 242, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 242, 255, 0.4);
        }
        .glass-box {
          background: rgba(13, 20, 38, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .glow-cyan-hover:hover {
          box-shadow: 0 0 15px rgba(0, 242, 255, 0.25);
          border-color: rgba(0, 242, 255, 0.4);
        }
        @keyframes pulse-skeleton {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        .skeleton-glowing {
          animation: pulse-skeleton 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#080d19]/90 border-r border-white/10 flex flex-col justify-between p-4 shrink-0 z-10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/5">
            <div className="p-2 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
              <Shield size={22} className="text-[#00f2ff] animate-pulse" />
            </div>
            <span className="font-black text-lg tracking-wider text-white">
              SENTINEL<span className="text-[#7000ff]">GPT</span>
            </span>
          </div>

          <div className="text-[9px] font-black uppercase text-gray-500 tracking-[3px] px-3 mb-2 font-mono">OPERATIONS</div>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === id ? 'bg-[#00f2ff]/15 text-white border border-[#00f2ff]/40 shadow-[0_0_12px_rgba(0,242,255,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <Icon size={16} className={activeTab === id ? 'text-[#00f2ff]' : 'text-gray-500'} /> {label}
              </button>
            ))}
          </nav>

          {/* Live Status Widget */}
          <div className="mt-6 p-3.5 bg-black/45 rounded-xl border border-white/5 space-y-2">
            <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Core System Status
            </div>
            {[
              { label: 'Threat Engine', status: 'ACTIVE', color: 'text-green-400' },
              { label: 'Alarm System', status: alarmEnabled ? 'ARMED' : 'MUTED', color: alarmEnabled ? 'text-amber-400' : 'text-gray-500' },
              { label: 'Stream Link', status: streamHealth.includes('WEBSOCKET') ? 'WS LIVE' : 'POLLING', color: 'text-[#00f2ff]' },
              { label: 'Perimeter Block', status: String(socData.blocked_ips?.length || 0), color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-mono">{s.label}</span>
                <span className={`font-black font-mono ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="pt-4 border-t border-white/5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-[#00f2ff]/20 border border-[#00f2ff]/40 flex items-center justify-center font-mono font-bold text-white text-xs">
              {operatorName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">{userFullName}</span>
              <span className="text-[9px] text-[#00f2ff] font-mono uppercase tracking-wider truncate">{userRole}</span>
              <span className="text-[8px] text-gray-500 font-mono truncate">{userOrg}</span>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 transition-all text-xs font-mono font-bold">
            <LogOut size={13} /> TERMINATE ACCESS
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-4 z-10">
          <div>
            <h1 className="text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
              <Zap size={22} className="text-[#00f2ff]" /> 
              {activeTab === 'Dashboard' ? 'Autonomous SOC Matrix' : activeTab.toUpperCase()}
            </h1>
            <p className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mt-0.5">
              AUTONOMOUS CYBER THREAT INGESTION & THREAT TRIAgE PLATFORM
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[9px] font-mono text-gray-400 flex items-center gap-2 bg-black/45 border border-white/10 px-3 py-2 rounded-xl">
              <Radio size={11} className="text-[#00f2ff] animate-pulse" />
              <span>{streamHealth} · {lastUpdatedTime}</span>
            </div>
            
            <button onClick={() => setAlarmEnabled(p => !p)}
              className={`text-[10px] font-mono font-bold px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${alarmEnabled ? 'bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]' : 'bg-white/5 text-gray-500 border-white/10'}`}>
              {alarmEnabled ? <><Volume2 size={13} /> ALARM: ACTIVE</> : <><VolumeX size={13} /> ALARM: MUTED</>}
            </button>
            
            <button onClick={handleSimulateThreat} disabled={isActionBusy}
              className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-2 rounded-xl hover:bg-amber-500/25 transition-all flex items-center gap-1.5 uppercase shadow-[0_0_8px_rgba(245,158,11,0.1)]">
              <Flame size={13} /> Inject Threat
            </button>
            
            <button onClick={syncSocNexus} disabled={isActionBusy}
              className="text-[10px] font-mono font-bold text-gray-300 bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-all flex items-center gap-1.5">
              <RefreshCw size={13} className={isActionBusy ? 'animate-spin' : ''} /> Sync Core
            </button>
            
            <button onClick={handleDownloadReport}
              className="text-[10px] font-mono font-bold text-[#00f2ff] bg-[#00f2ff]/15 border border-[#00f2ff]/30 px-3 py-2 rounded-xl hover:bg-[#00f2ff]/25 transition-all flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,242,255,0.1)]">
              <Download size={13} /> Download Report
            </button>
            
            <button onClick={handleClearLogs} disabled={isActionBusy}
              className="text-[10px] font-mono font-bold text-gray-400 bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-1.5">
              <Trash2 size={13} /> Purge Logs
            </button>
          </div>
        </header>

        {/* ACTIVE DEFECTION BANNER */}
        {activeDefectionAlert && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl animate-pulse flex justify-between items-start gap-4">
            <div className="flex gap-3">
              <ShieldAlert size={24} className="text-[#ff0055] shrink-0 mt-0.5" />
              <div className="font-mono text-xs space-y-1.5">
                <div className="font-black text-[#ff0055] uppercase tracking-wider text-sm">
                  ⚠️ INSTANT QUARANTINE TRIGGERED: {activeDefectionAlert.type}
                </div>
                <div className="text-white">
                  Source Host: <span className="text-[#00f2ff] font-bold">{activeDefectionAlert.ip}</span> | 
                  Calculated Risk Vector: <span className="text-amber-400 font-bold">{activeDefectionAlert.score}/100</span>
                </div>
                {activeDefectionAlert.mitre && (
                  <div className="text-purple-400 text-[10px]">
                    MITRE ATT&CK Mapping: <span className="font-bold">{activeDefectionAlert.mitre.technique}</span> — {activeDefectionAlert.mitre.name} ({activeDefectionAlert.mitre.tactic})
                  </div>
                )}
                <div className="text-gray-300 text-[10px] max-w-3xl leading-relaxed">{activeDefectionAlert.remediation}</div>
              </div>
            </div>
            <button onClick={() => setActiveDefectionAlert(null)} className="p-1 rounded bg-white/10 text-white hover:bg-white/20 transition-all">
              <X size={14} />
            </button>
          </div>
        )}

        {/* LOADING SKELETON LAYER */}
        {dashboardLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="glass-box p-4 rounded-2xl h-20 skeleton-glowing bg-white/[0.03]"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-box p-5 rounded-2xl h-64 skeleton-glowing bg-white/[0.03]"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ══ TAB 1: MAIN SOC DASHBOARD ══ */}
            {activeTab === 'Dashboard' && (
              <div className="space-y-6">
                
                {/* 7 TOP STATS KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                  {[
                    { label: 'Total Threats', value: socData.metrics?.incidents || 0, icon: Shield, color: '#e2e8f0', sub: 'Aggregated Logs' },
                    { label: 'Critical', value: socData.metrics?.critical || 0, icon: AlertOctagon, color: '#ff0055', sub: 'Risk ≥ 75' },
                    { label: 'High', value: socData.metrics?.high || 0, icon: AlertTriangle, color: '#ff7700', sub: 'Risk 60–74' },
                    { label: 'Medium', value: socData.metrics?.medium || 0, icon: ShieldAlert, color: '#eab308', sub: 'Risk 40–59' },
                    { label: 'Low', value: socData.metrics?.low || 0, icon: Activity, color: '#3b82f6', sub: 'Risk < 40' },
                    { label: 'Avg Risk', value: `${socData.metrics?.avgRiskScore || 0}%`, icon: TrendingUp, color: '#8b5cf6', sub: 'Global index' },
                    { label: 'Blocked IPs', value: socData.metrics?.blocked || 0, icon: Lock, color: '#10b981', sub: 'Quarantined' }
                  ].map(({ label, value, icon: Icon, color, sub }) => (
                    <div key={label} className="glass-box p-4 rounded-2xl flex justify-between items-center transition-all glow-cyan-hover">
                      <div className="min-w-0">
                        <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider truncate">{label}</div>
                        <div className="text-2xl font-black font-mono mt-0.5" style={{ color }}>{value}</div>
                        <div className="text-[8px] text-gray-600 font-mono truncate">{sub}</div>
                      </div>
                      <Icon size={18} className="shrink-0 opacity-50 ml-1.5" style={{ color }} />
                    </div>
                  ))}
                </div>

                {/* 3 SIDE BY SIDE CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-box p-5 rounded-2xl flex flex-col h-[280px]">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Activity size={12} className="text-[#00f2ff]" /> Average Risk Score Dial
                    </h3>
                    <div className="flex-1 min-h-0">
                      <RiskGaugeChart score={socData.metrics?.avgRiskScore || 83} label={socData.metrics?.avgRiskScore >= 75 ? 'CRITICAL' : socData.metrics?.avgRiskScore >= 60 ? 'HIGH' : 'MEDIUM'} />
                    </div>
                  </div>

                  <div className="glass-box p-5 rounded-2xl flex flex-col h-[280px]">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Target size={12} className="text-[#00f2ff]" /> Severity Distribution
                    </h3>
                    <div className="flex-1 min-h-0">
                      <SeverityDonutChart distribution={socData.dist} />
                    </div>
                  </div>

                  <div className="glass-box p-5 rounded-2xl flex flex-col h-[280px]">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Flame size={12} className="text-[#00f2ff]" /> Threat Type Breakdown
                    </h3>
                    <div className="flex-1 min-h-0">
                      <ThreatBreakdownChart logs={socData.logs || []} />
                    </div>
                  </div>
                </div>

                {/* TIMELINE RISK GRAPH */}
                <div className="glass-box p-5 rounded-2xl flex flex-col h-[320px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={12} className="text-[#00f2ff]" /> Incident Risk Score Timeline
                    </h3>
                    <span className="text-[9px] font-mono text-[#00f2ff] bg-[#00f2ff]/10 px-2 py-0.5 rounded border border-[#00f2ff]/20">REAL-TIME INGESTION SERIES</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <RiskTimelineChart logs={socData.logs || []} />
                  </div>
                </div>

                {/* LOWER THREE COLUMN DETAIL SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* COLUMN 1: LIVE ALERTS FEED */}
                  <div className="glass-box p-5 rounded-2xl flex flex-col h-[480px]">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" /> Live Threat Feed
                    </h3>
                    <div className="flex-1 min-h-0">
                      <LiveAlertsFeed logs={socData.logs} onBlock={handleBlockIP} />
                    </div>
                  </div>

                  {/* COLUMN 2: HEATMAP NODE MATRIX + TIMELINE */}
                  <div className="glass-box p-5 rounded-2xl flex flex-col h-[480px] justify-between gap-4">
                    <div className="flex-1 flex flex-col min-h-0 border-b border-white/5 pb-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Globe size={12} className="text-[#00f2ff]" /> Perimeter Heatmap
                      </h3>
                      <div className="flex-1 min-h-0">
                        <ThreatHeatmap logs={socData.logs} />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0 pt-2">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <History size={12} className="text-[#00f2ff]" /> Attack Chrono Timeline
                      </h3>
                      <div className="flex-1 min-h-0">
                        <AttackTimeline logs={socData.logs} />
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 3: AI RECOMMENDATIONS & CORE CONTROLS */}
                  <div className="glass-box p-5 rounded-2xl flex flex-col h-[480px] justify-between gap-4">
                    <div className="flex-1 flex flex-col min-h-0 border-b border-white/5 pb-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Bot size={12} className="text-[#00f2ff]" /> AI Remediation Assistant
                      </h3>
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed space-y-3">
                        {socData.logs && socData.logs.length > 0 ? (
                          <div>
                            <div className="text-white font-bold mb-1 border-b border-white/10 pb-1 flex items-center gap-1.5">
                              <ShieldAlert size={12} className="text-red-400" /> Remediating: {socData.logs[0].threat_type || socData.logs[0].description}
                            </div>
                            <div className="text-gray-300">
                              {getAiRemediation(socData.logs[0].threat_type || socData.logs[0].description, socData.logs[0].risk_score || socData.logs[0].priority_score)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-6">
                            No threat signals active. Core security metrics nominal.
                          </div>
                        )}
                        <div className="pt-2 text-[10px] text-gray-500 border-t border-white/5">
                          💡 SentinelGPT recommends enforcing strict geo-blocking firewall policies on Tor exit nodes to mitigate discoveries.
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col min-h-0 gap-2">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Server size={12} className="text-[#00f2ff]" /> Core Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleSimulateThreat} className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-xl text-[10px] font-mono font-bold transition-all uppercase">
                          ⚡ Inject Test
                        </button>
                        <button onClick={handleDownloadReport} className="py-2.5 px-3 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/25 rounded-xl text-[10px] font-mono font-bold transition-all uppercase">
                          📂 Gen Report
                        </button>
                        <button onClick={handleClearLogs} className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl text-[10px] font-mono font-bold transition-all uppercase col-span-2">
                          🔴 Purge Threat Matrices
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ══ TAB 2: THREAT LOG HISTORY ══ */}
            {activeTab === 'Threat History' && (
              <div className="space-y-6">
                <div className="glass-box p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Historical Incident Database</h3>
                    <button onClick={handleDownloadReport} className="text-xs bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/20 text-[#00f2ff] font-bold px-3 py-1.5 rounded-xl transition-all font-mono uppercase">
                      Export Logs
                    </button>
                  </div>
                  <ThreatTable logs={socData.logs || []} onBlock={handleBlockIP} />
                </div>
                
                <div className="glass-box p-5 rounded-2xl">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 font-mono">Active Perimeter Quarantine List</h3>
                  <BlockedIPs blocked={socData.blocked_ips || []} onUnblock={handleUnblockIP} />
                </div>
              </div>
            )}

            {/* ══ TAB 3: THREAT IP LOOKUP ══ */}
            {activeTab === 'Analyze Threat' && (
              <div className="space-y-6">
                <div className="glass-box p-8 rounded-2xl max-w-2xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-lg font-black text-white uppercase tracking-wider font-mono">Threat Intelligence IP Lookup</h2>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Query the SentinelGPT database to retrieve MITRE ATT&CK tactic associations, threat descriptions, and risk scoring.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff] font-mono"
                      placeholder="Enter IP (e.g. 185.220.101.5)"
                      id="threatIpInput"
                    />
                    <button
                      onClick={() => {
                        const val = document.getElementById('threatIpInput').value.trim();
                        if (!val) return;
                        const match = socData.logs.find(l => l.ip === val);
                        if (match) {
                          setChatMessages(prev => [
                            ...prev,
                            { sender: 'user', text: `Lookup threat intelligence for IP: ${val}` },
                            { sender: 'ai', text: `🔍 Threat query response:\n- Event: ${match.threat_type || match.description}\n- Priority Score: ${match.risk_score || match.priority_score}/100\n- Status: QUARANTINED\n- MITRE ATT&CK: ${MITRE_MAP[match.threat_type || match.description]?.technique || 'T1046'} (${MITRE_MAP[match.threat_type || match.description]?.tactic || 'Discovery'})` }
                          ]);
                          setActiveTab('Security Assistant');
                        } else {
                          setError(`IP address ${val} is not cataloged in current threat intelligence feed.`);
                          setTimeout(() => setError(''), 4000);
                        }
                      }}
                      className="bg-[#00f2ff] hover:bg-[#00d8e6] text-black font-extrabold px-6 py-3 rounded-xl text-xs font-mono tracking-wider transition-all active:scale-95 uppercase shadow-[0_0_12px_rgba(0,242,255,0.2)]"
                    >
                      Query Matrix
                    </button>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Active Threat Indicators</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {socData.logs.slice(0, 4).map(l => (
                        <button
                          key={l.id}
                          onClick={() => document.getElementById('threatIpInput').value = l.ip}
                          className="flex justify-between items-center p-3 bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl transition-all text-left"
                        >
                          <span className="text-xs font-mono font-bold text-white">{l.ip}</span>
                          <span className="text-[9px] font-mono text-red-400 font-black">{l.risk_score || l.priority_score} RISK</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ TAB 4: AI Cyber Assistant ══ */}
            {activeTab === 'Security Assistant' && (
              <div className="space-y-6 flex-1 flex flex-col min-h-0">
                <div className="glass-box p-5 rounded-2xl flex-1 flex flex-col min-h-0 justify-between gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="text-[#00f2ff]" size={20} />
                      <span className="text-xs font-black uppercase text-white tracking-widest font-mono">SentinelGPT conversational AI</span>
                    </div>
                    <span className="text-[9px] font-mono text-green-400">● Core AI Engine: ONLINE</span>
                  </div>

                  {/* CHAT MESSAGES DISPLAY */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 font-mono text-xs">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl max-w-xl leading-relaxed whitespace-pre-wrap border ${
                          msg.sender === 'user' 
                            ? 'bg-[#00f2ff]/10 text-white border-[#00f2ff]/25' 
                            : 'bg-[#0d1426] text-gray-200 border-white/5'
                        }`}>
                          <div className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                            {msg.sender === 'user' ? 'Operator Command' : 'Sentinel AI Output'}
                          </div>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* CHAT INPUT FORM */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-white/5 pt-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-black/45 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00f2ff] font-mono"
                      placeholder="Ask about a threat vector, mitigation step, or command query..."
                    />
                    <button
                      type="submit"
                      className="bg-[#00f2ff] hover:bg-[#00d8e6] text-black font-extrabold px-6 py-3 rounded-xl text-xs font-mono tracking-wider uppercase shadow-[0_0_12px_rgba(0,242,255,0.2)] active:scale-95"
                    >
                      Transmit
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ══ TAB 5: FILE SCANNER ══ */}
            {activeTab === 'File Upload' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="glass-box p-8 rounded-2xl space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-lg font-black text-white uppercase tracking-wider font-mono">Payload Heuristics File Scanner</h2>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Drag and drop network log files, scripts, or executables to verify static hash patterns and trace threats.
                    </p>
                  </div>

                  {/* DROPZONE */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-white/10 hover:border-[#00f2ff]/30 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-black/20 hover:bg-black/40 transition-all cursor-pointer relative"
                  >
                    <input
                      type="file"
                      onChange={handleFileDrop}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="fileScannerInput"
                    />
                    <Upload size={36} className="text-gray-500 animate-bounce" />
                    <span className="text-xs font-mono text-gray-300">
                      Drag files here or click to browse local storage
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      Max file size: 10 MB (Log/ASCII format preferred)
                    </span>
                  </div>

                  {/* ANALYSIS RESULTS */}
                  {uploadAnalysis && (
                    <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0f1d] space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                        <span className="text-xs font-mono font-bold text-white truncate max-w-[200px]">
                          📂 File: {uploadAnalysis.name}
                        </span>
                        <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded border ${
                          uploadAnalysis.status === 'analyzing'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : uploadAnalysis.verdict === 'CLEAN'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                        }`}>
                          {uploadAnalysis.status === 'analyzing' ? 'SCANNING...' : uploadAnalysis.verdict}
                        </span>
                      </div>

                      {uploadAnalysis.status === 'analyzing' ? (
                        <div className="space-y-3">
                          <div className="h-4 bg-white/5 rounded skeleton-glowing"></div>
                          <div className="h-3 bg-white/5 rounded skeleton-glowing w-2/3"></div>
                        </div>
                      ) : (
                        <div className="font-mono text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">File Size:</span>
                            <span className="text-white">{uploadAnalysis.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Payload Type:</span>
                            <span className="text-white">{uploadAnalysis.type}</span>
                          </div>
                          {uploadAnalysis.verdict !== 'CLEAN' && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Threat Risk Score:</span>
                              <span className="text-red-400 font-bold">{uploadAnalysis.score}/100</span>
                            </div>
                          )}
                          <div className="flex flex-col gap-1 border-t border-white/5 pt-2 mt-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Analysis Details:</span>
                            <span className="text-gray-300 text-[11px] leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
                              {uploadAnalysis.details}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}
          </>
        )}

      </main>

    </div>
  );
};

export default Dashboard;
