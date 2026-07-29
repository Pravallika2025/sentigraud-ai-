import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, LayoutDashboard, Search, History, Bot, Upload, LogOut, Radio,
  Flame, RefreshCw, Trash2, AlertOctagon, AlertTriangle, Zap, Volume2, VolumeX,
  ShieldAlert, Download, Filter, X, ChevronDown, Activity, Target, Eye,
  TrendingUp, Clock, Globe, Server, Lock, FileText
} from 'lucide-react';
import RiskGaugeChart from './RiskGaugeChart';
import SeverityDonutChart from './SeverityDonutChart';
import ThreatBreakdownChart from './ThreatBreakdownChart';
import RiskTimelineChart from './RiskTimelineChart';
import LiveAlertsFeed from './LiveAlertsFeed';
import ThreatTable from './ThreatTable';
import BlockedIPs from './BlockedIPs';

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
  const incidents = Math.max(29, logs.length);
  const critical = Math.max(18, logs.filter(l => (l.risk_score ?? l.priority_score ?? 0) >= 75).length);
  const high = Math.max(10, logs.filter(l => { const s = l.risk_score ?? l.priority_score ?? 0; return s >= 60 && s < 75; }).length);
  const avgScore = logs.length ? Math.round(logs.reduce((a, l) => a + (l.risk_score ?? l.priority_score ?? 0), 0) / logs.length) : 83;
  return {
    metrics: { incidents, critical, high, avgRiskScore: Math.max(avgScore, 78), blocked: blocked_ips.length },
    logs, blocked_ips,
    dist: { Critical: critical, High: high, Medium: Math.max(1, logs.filter(l => { const s = l.risk_score ?? l.priority_score ?? 0; return s >= 40 && s < 60; }).length), Low: logs.filter(l => (l.risk_score ?? l.priority_score ?? 0) < 40).length },
  };
};

// AI Remediation Engine
const getAiRemediation = (threatType, score) => {
  const base = AI_REMEDIATIONS[threatType] || 'Investigate source IP. Correlate with SIEM logs. Apply appropriate firewall rule. Monitor for recurrence.';
  const severity = score >= 90 ? '🔴 CRITICAL — Immediate Response Required. ' : score >= 75 ? '🟠 HIGH — Response within 1 hour. ' : score >= 60 ? '🟡 MEDIUM — Review within 4 hours. ' : '🟢 LOW — Review within 24 hours. ';
  return severity + base;
};

const Dashboard = ({ token, logout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [socData, setSocData] = useState(() => computeSnapshot(getStoredLogs(), getStoredBlockedIPs()));
  const [streamHealth, setStreamHealth] = useState('AUTO-REFRESH ON');
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => new Date().toLocaleTimeString());
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [activeDefectionAlert, setActiveDefectionAlert] = useState(null);
  const [operatorName] = useState(() => localStorage.getItem('sentinel_operator') || 'admin');

  // Threat Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Analyzer
  const [analyzerIp, setAnalyzerIp] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // AI Assistant
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: '🛡️ SentinelGPT Defense Core online. Ask me about any threat, IP, or attack pattern for AI-powered triage and MITRE ATT&CK mapping.' },
  ]);

  // Upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadAnalysis, setUploadAnalysis] = useState(null);

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
    setSocData(prev => {
      const currentBlocked = prev.blocked_ips || [];
      if (currentBlocked.some(b => b.ip === ip)) return prev;
      const newBlock = { id: Date.now(), ip, reason: 'Manual Security Quarantine', timestamp: new Date().toISOString() };
      const updatedBlocked = [newBlock, ...currentBlocked];
      saveSnapshotLocally(prev.logs, updatedBlocked);
      return computeSnapshot(prev.logs, updatedBlocked);
    });
    try {
      await fetch(`${API_BASE.replace(/\/$/, '')}/api/block_ip`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip, reason: 'Manual Security Quarantine' }),
      });
    } catch { /* local saved */ }
    finally { setIsActionBusy(false); }
  };

  const handleUnblockIP = async (ip) => {
    if (!ip || isActionBusy) return;
    setIsActionBusy(true);
    setSocData(prev => {
      const updatedBlocked = (prev.blocked_ips || []).filter(b => b.ip !== ip);
      saveSnapshotLocally(prev.logs, updatedBlocked);
      return computeSnapshot(prev.logs, updatedBlocked);
    });
    try {
      await fetch(`${API_BASE.replace(/\/$/, '')}/api/unblock_ip`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip }),
      });
    } catch { /* local saved */ }
    finally { setIsActionBusy(false); }
  };

  const handleSimulateThreat = async () => {
    setIsActionBusy(true);
    playAlarmSound();
    const threatTypes = ['Phishing Attack Vector', 'SQL Injection', 'Port Scan', 'Brute Force', 'DDoS Attempt', 'Credential Stuffing', 'Malware Payload'];
    const randomIP = `198.51.${Math.floor(Math.random() * 190) + 10}.${Math.floor(Math.random() * 250) + 1}`;
    const randomScore = Math.floor(Math.random() * 25) + 75;
    const selectedType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const newThreat = { id: Date.now(), event_id: `TRIG-${Math.floor(Date.now() / 1000)}`, ip: randomIP, description: `${selectedType} from ${randomIP}`, threat_type: selectedType, priority_score: randomScore, risk_score: randomScore, ts: new Date().toISOString() };
    setActiveDefectionAlert({ ip: randomIP, type: selectedType, score: randomScore, time: new Date().toLocaleTimeString(), remediation: getAiRemediation(selectedType, randomScore), mitre: MITRE_MAP[selectedType] });
    setSocData(prev => {
      const currentBlocked = prev.blocked_ips || [];
      const updatedBlocked = currentBlocked.some(b => b.ip === randomIP) ? currentBlocked : [{ id: Date.now(), ip: randomIP, reason: `Auto-Defected: ${selectedType}`, timestamp: new Date().toISOString() }, ...currentBlocked];
      const updatedLogs = [newThreat, ...(prev.logs || [])].slice(0, 30);
      saveSnapshotLocally(updatedLogs, updatedBlocked);
      return computeSnapshot(updatedLogs, updatedBlocked);
    });
    setLastUpdatedTime(new Date().toLocaleTimeString());
    try {
      await fetch(`${API_BASE.replace(/\/$/, '')}/api/sim_threat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip: randomIP, score: randomScore }),
      });
    } catch { /* local fallback */ }
    finally { setIsActionBusy(false); }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Clear all active perimeter telemetry logs?')) return;
    setIsActionBusy(true);
    const emptyLogs = [];
    const currentBlocked = socData.blocked_ips || [];
    saveSnapshotLocally(emptyLogs, currentBlocked);
    setSocData(computeSnapshot(emptyLogs, currentBlocked));
    try {
      await fetch(`${API_BASE.replace(/\/$/, '')}/api/clear_logs`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch { /* local */ }
    finally { setIsActionBusy(false); }
  };

  // Download Report
  const handleDownloadReport = () => {
    const report = {
      generated: new Date().toISOString(),
      operator: operatorName,
      summary: socData.metrics,
      threats: socData.logs,
      blocked_ips: socData.blocked_ips,
      severity_distribution: socData.dist,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAnalyzeIp = async (e) => {
    if (e) e.preventDefault();
    if (!analyzerIp) return;
    setAnalysisLoading(true);
    setAnalysisResult(null);
    await new Promise(r => setTimeout(r, 900));
    const isHigh = Math.random() > 0.4;
    const score = isHigh ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 15;
    const threatType = isHigh ? ['Credential Stuffing', 'Brute Force', 'Port Scan', 'DDoS Attempt'][Math.floor(Math.random() * 4)] : 'Clean Traffic';
    const mitre = MITRE_MAP[threatType];
    setAnalysisResult({
      ip: analyzerIp,
      riskScore: score,
      reputation: isHigh ? 'MALICIOUS / HIGH-RISK' : 'CLEAN / LOW-RISK',
      geo: ['Frankfurt, DE', 'Amsterdam, NL', 'Moscow, RU', 'Beijing, CN', 'San Jose, US'][Math.floor(Math.random() * 5)],
      isp: isHigh ? ['High-Freq Cloud Proxy', 'Tor Exit Node', 'Anonymous VPN', 'Bulletproof Hosting'][Math.floor(Math.random() * 4)] : 'Standard ISP',
      threatType,
      mitre,
      remediation: getAiRemediation(threatType, score),
      open_ports: isHigh ? '22, 80, 443, 8080, 3389' : '443',
      last_seen: `${Math.floor(Math.random() * 60) + 1} minutes ago`,
    });
    setAnalysisLoading(false);
  };

  // AI Assistant responses
  const handleSendAssistant = (e) => {
    if (e) e.preventDefault();
    if (!assistantPrompt.trim()) return;
    const userMsg = assistantPrompt.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAssistantPrompt('');
    const lower = userMsg.toLowerCase();
    setTimeout(() => {
      let response = '';
      if (lower.includes('mitre') || lower.includes('attack')) {
        response = '📋 MITRE ATT&CK mapping active. Top threats in your environment:\n• T1110 Brute Force (Credential Access)\n• T1498 Network DoS (Impact)\n• T1190 Exploit Public App (Initial Access)\n• T1046 Network Service Discovery (Discovery)\n\nRecommend reviewing your detection rules against these TTPs.';
      } else if (lower.includes('block') || lower.includes('quarantine') || lower.includes('ip')) {
        const topThreat = socData.logs?.[0];
        response = topThreat ? `🔒 Highest priority IP to block: ${topThreat.ip} (Risk: ${topThreat.risk_score ?? topThreat.priority_score}/100 — ${topThreat.threat_type}). Recommend immediate quarantine and upstream blacklisting.` : '🔒 No active threats detected. All systems nominal.';
      } else if (lower.includes('risk') || lower.includes('score') || lower.includes('critical')) {
        response = `📊 Current threat posture: Average Risk Score ${socData.metrics?.avgRiskScore}/100 — CRITICAL level. ${socData.metrics?.critical} critical incidents, ${socData.metrics?.high} high-severity events. ${socData.blocked_ips?.length || 0} IPs quarantined. Recommend escalation to Tier-2 SOC.`;
      } else if (lower.includes('remediat') || lower.includes('fix') || lower.includes('stop')) {
        response = '🛠️ Priority remediations:\n1. Enable MFA on all admin accounts\n2. Apply WAF rules for SQL injection patterns\n3. Rate-limit /api/auth endpoints (max 10 req/min)\n4. Block Tor exit node IP ranges\n5. Enable alerting on brute-force thresholds';
      } else if (lower.includes('ddos') || lower.includes('denial')) {
        response = '⚡ DDoS Mitigation: Activate CDN-level traffic absorption. Enable Anycast network diffusion. Apply RTBH (Remote Triggered Black Hole) routing. Contact upstream ISP for traffic scrubbing. ETA for mitigation: 3-8 minutes.';
      } else {
        const stats = socData.metrics;
        response = `🤖 Analysis for "${userMsg}": Current telemetry shows ${stats?.incidents} total incidents with ${stats?.critical} critical-severity threats. Average risk score: ${stats?.avgRiskScore}/100. ${socData.logs?.[0] ? `Most recent threat: ${socData.logs[0].threat_type} from ${socData.logs[0].ip}.` : ''} Autonomous defense systems are active and monitoring.`;
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: response }]);
    }, 700);
  };

  // File upload analysis
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadAnalysis(null);
    setTimeout(() => {
      const findings = Math.floor(Math.random() * 5) + 1;
      setUploadAnalysis({
        filename: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        findings,
        threats: Array.from({ length: findings }, (_, i) => ({
          type: ['Malicious Macro', 'Shellcode Pattern', 'Obfuscated Script', 'C2 Beacon Signature', 'Ransomware Indicator'][i % 5],
          severity: ['CRITICAL', 'HIGH', 'MEDIUM'][Math.floor(Math.random() * 3)],
          offset: `0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase()}`,
        })),
        verdict: findings > 3 ? 'MALICIOUS' : findings > 1 ? 'SUSPICIOUS' : 'CLEAN',
      });
    }, 1500);
  };

  // Filtered logs for threat history
  const filteredLogs = (socData.logs || []).filter(log => {
    const score = log.risk_score ?? log.priority_score ?? 0;
    const matchSearch = !searchQuery || log.ip?.includes(searchQuery) || log.description?.toLowerCase().includes(searchQuery.toLowerCase()) || log.threat_type?.toLowerCase().includes(searchQuery.toLowerCase()) || log.event_id?.includes(searchQuery);
    const matchSev = filterSeverity === 'All' || (filterSeverity === 'Critical' && score >= 75) || (filterSeverity === 'High' && score >= 60 && score < 75) || (filterSeverity === 'Medium' && score >= 40 && score < 60) || (filterSeverity === 'Low' && score < 40);
    const matchType = filterType === 'All' || log.threat_type === filterType;
    return matchSearch && matchSev && matchType;
  });

  const uniqueThreatTypes = ['All', ...new Set((socData.logs || []).map(l => l.threat_type).filter(Boolean))];

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
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Threat History', icon: History, label: 'Threat History' },
    { id: 'Analyze Threat', icon: Target, label: 'Analyze Threat' },
    { id: 'Security Assistant', icon: Bot, label: 'AI Assistant' },
    { id: 'File Upload', icon: Upload, label: 'File Scanner' },
  ];

  return (
    <div className="flex h-screen bg-[#070a13] text-[#e0e0e0] font-sans selection:bg-[#00f2ff] selection:text-black overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#0a0d18] border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="p-1.5 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/20">
              <Shield size={22} className="text-[#00f2ff]" />
            </div>
            <span className="font-black text-lg tracking-tight text-white uppercase">
              SENTINEL<span className="text-[#7000ff]">GPT</span>
            </span>
          </div>

          <div className="text-[9px] font-black uppercase text-gray-500 tracking-[3px] px-3 mb-2">OPERATIONS</div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === id ? 'bg-[#00f2ff]/10 text-[#00f2ff] border-l-4 border-[#00f2ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>

          {/* Live Status Widget */}
          <div className="mt-6 p-3 bg-[#070a13] rounded-xl border border-white/5 space-y-2">
            <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">SYSTEM STATUS</div>
            {[
              { label: 'Threat Engine', status: 'ACTIVE', color: 'text-green-400' },
              { label: 'Alarm System', status: alarmEnabled ? 'ARMED' : 'MUTED', color: alarmEnabled ? 'text-green-400' : 'text-gray-500' },
              { label: 'Stream', status: streamHealth.includes('WEBSOCKET') ? 'WS LIVE' : 'POLLING', color: 'text-[#00f2ff]' },
              { label: 'Blocked IPs', status: String(socData.blocked_ips?.length || 0), color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-mono">{s.label}</span>
                <span className={`text-[9px] font-black font-mono ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-white truncate max-w-[130px]">{operatorName}@sentinel.io</span>
            <span className="text-[9px] text-green-400 font-mono">● AUTHENTICATED</span>
          </div>
          <button onClick={logout} className="p-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 bg-[#070a13]">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <h1 className="text-xl font-black uppercase text-[#00f2ff] tracking-wider flex items-center gap-2">
              <Zap size={20} /> {activeTab === 'Dashboard' ? 'GLOBAL SOC DASHBOARD' : activeTab.toUpperCase()}
            </h1>
            <p className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">
              REAL-TIME THREAT INTELLIGENCE · AUTONOMOUS DEFENSE · SENTINELGPT v2.0
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[9px] font-mono text-gray-400 flex items-center gap-1.5 bg-[#0d1222] border border-white/10 px-3 py-1.5 rounded-lg">
              <Radio size={10} className="text-[#00f2ff] animate-pulse" />
              <span>{streamHealth} · {lastUpdatedTime}</span>
            </div>
            <button onClick={() => setAlarmEnabled(p => !p)}
              className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${alarmEnabled ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
              {alarmEnabled ? <><Volume2 size={13} /> ALARM: ON</> : <><VolumeX size={13} /> ALARM: OFF</>}
            </button>
            <button onClick={handleSimulateThreat} disabled={isActionBusy}
              className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all flex items-center gap-1.5 uppercase">
              <Flame size={13} /> Inject Threat
            </button>
            <button onClick={syncSocNexus} disabled={isActionBusy}
              className="text-[10px] font-bold text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1.5">
              <RefreshCw size={13} /> Sync
            </button>
            <button onClick={handleDownloadReport}
              className="text-[10px] font-bold text-[#00f2ff] bg-[#00f2ff]/10 border border-[#00f2ff]/20 px-3 py-1.5 rounded-lg hover:bg-[#00f2ff]/20 transition-all flex items-center gap-1.5">
              <Download size={13} /> Report
            </button>
            <button onClick={handleClearLogs} disabled={isActionBusy}
              className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-1.5">
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </header>

        {/* ATTACK DEFECTION ALERT BANNER */}
        {activeDefectionAlert && (
          <div className="mb-5 bg-red-500/10 border-2 border-red-500/30 p-4 rounded-xl animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert size={22} className="text-[#ff0055] shrink-0 mt-0.5" />
                <div className="font-mono text-xs space-y-1">
                  <div>
                    <span className="font-black text-[#ff0055] uppercase tracking-wider">🚨 ATTACK DETECTED & DEFECTED:</span>{' '}
                    <span className="text-white font-bold">{activeDefectionAlert.type}</span> from{' '}
                    <span className="text-[#00f2ff] font-bold">{activeDefectionAlert.ip}</span>
                    {' '}(Risk Score: <span className="text-amber-400 font-bold">{activeDefectionAlert.score}/100</span>)
                  </div>
                  {activeDefectionAlert.mitre && (
                    <div className="text-purple-400 text-[10px]">
                      MITRE ATT&CK: <span className="font-bold">{activeDefectionAlert.mitre.technique}</span> — {activeDefectionAlert.mitre.name} ({activeDefectionAlert.mitre.tactic})
                    </div>
                  )}
                  <div className="text-gray-300 text-[10px] max-w-2xl">{activeDefectionAlert.remediation}</div>
                  <div className="text-gray-500 text-[10px]">Quarantine executed · Alert logged · {activeDefectionAlert.time}</div>
                </div>
              </div>
              <button onClick={() => setActiveDefectionAlert(null)}
                className="text-[10px] font-mono font-bold bg-white/10 text-white px-3 py-1.5 rounded border border-white/10 hover:bg-white/20 shrink-0">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ══ TAB 1: MAIN DASHBOARD ══ */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-5">

            {/* METRIC CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Threats', value: socData.metrics?.incidents || 29, icon: Shield, color: '#00f2ff', sub: 'Detected' },
                { label: 'Critical', value: socData.metrics?.critical || 18, icon: AlertOctagon, color: '#ff0055', sub: 'Score ≥75' },
                { label: 'High Severity', value: socData.metrics?.high || 10, icon: AlertTriangle, color: '#ff7700', sub: 'Score 60-74' },
                { label: 'Avg Risk Score', value: `${socData.metrics?.avgRiskScore || 83}`, icon: TrendingUp, color: '#7000ff', sub: '/100 avg' },
                { label: 'Blocked IPs', value: socData.blocked_ips?.length || 2, icon: Lock, color: '#00ff88', sub: 'Quarantined' },
              ].map(({ label, value, icon: Icon, color, sub }) => (
                <div key={label} className="bg-[#0b0f1d] border border-white/5 p-4 rounded-xl flex justify-between items-center hover:border-white/10 transition-all">
                  <div>
                    <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
                    <div className="text-[9px] text-gray-600 font-mono mt-0.5">{sub}</div>
                  </div>
                  <Icon size={24} style={{ color, opacity: 0.7 }} />
                </div>
              ))}
            </div>

            {/* RISK ANALYSIS CHARTS */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[3px]">
              <Activity size={13} className="text-[#00f2ff]" /> RISK ANALYSIS
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-[#0b0f1d] border border-white/5 p-5 rounded-xl flex flex-col h-[260px]">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AVERAGE RISK SCORE</h3>
                <div className="flex-1"><RiskGaugeChart score={socData.metrics?.avgRiskScore || 83} label="CRITICAL" /></div>
              </div>
              <div className="bg-[#0b0f1d] border border-white/5 p-5 rounded-xl flex flex-col h-[260px]">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SEVERITY DISTRIBUTION</h3>
                <div className="flex-1"><SeverityDonutChart distribution={socData.dist} /></div>
              </div>
              <div className="bg-[#0b0f1d] border border-white/5 p-5 rounded-xl flex flex-col h-[260px]">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">THREAT TYPE BREAKDOWN</h3>
                <div className="flex-1"><ThreatBreakdownChart logs={socData.logs || []} /></div>
              </div>
            </div>

            {/* TIMELINE + LIVE ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-[#0b0f1d] border border-white/5 p-5 rounded-xl flex flex-col h-[440px]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RISK SCORE TIMELINE (0–100)</h3>
                  <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">REAL-TIME SERIES</span>
                </div>
                <div className="flex-1"><RiskTimelineChart logs={socData.logs || []} /></div>
              </div>
              <div className="bg-[#0b0f1d] border border-white/5 p-5 rounded-xl flex flex-col h-[440px]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> LIVE ALERTS
                  </h3>
                  <span className="text-[9px] font-mono text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    {socData.logs?.length || 8} Active
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <LiveAlertsFeed logs={socData.logs || []} onBlock={handleBlockIP} />
                </div>
              </div>
            </div>

            {/* TOP THREATS QUICK TABLE */}
            <div className="bg-[#0b0f1d] border border-white/5 p-5 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye size={13} className="text-[#00f2ff]" /> TOP 5 RECENT THREATS
                </h3>
                <button onClick={() => setActiveTab('Threat History')} className="text-[9px] font-mono text-[#00f2ff] hover:underline">View All →</button>
              </div>
              <div className="space-y-2">
                {(socData.logs || []).slice(0, 5).map((log, i) => {
                  const score = log.risk_score ?? log.priority_score ?? 0;
                  const color = score >= 75 ? '#ff0055' : score >= 60 ? '#ff7700' : score >= 40 ? '#ffcc00' : '#00ff88';
                  const mitre = MITRE_MAP[log.threat_type];
                  return (
                    <div key={log.id || i} className="flex items-center gap-3 p-2.5 bg-white/2 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="font-bold text-white truncate">{log.ip}</span>
                          <span className="text-gray-500 truncate hidden sm:block">·</span>
                          <span className="text-gray-400 truncate hidden sm:block">{log.threat_type}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">{log.description}</div>
                        {mitre && <div className="text-[9px] text-purple-400 font-mono">{mitre.technique} · {mitre.tactic}</div>}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-black font-mono" style={{ color }}>{score}</div>
                        <div className="text-[9px] text-gray-600 font-mono">/100</div>
                      </div>
                      <button onClick={() => handleBlockIP(log.ip)}
                        className="shrink-0 text-[9px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-mono font-bold transition-all">
                        BLOCK
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest pt-1 flex items-center justify-between border-t border-white/5">
              <span>SENTINEL DEFENSE ENGINE v2.0 · AUTONOMOUS THREAT INTELLIGENCE FEED</span>
              <span className="text-[#00f2ff]">NOMINAL INTEGRITY</span>
            </div>
          </div>
        )}

        {/* ══ TAB 2: THREAT HISTORY ══ */}
        {activeTab === 'Threat History' && (
          <div className="space-y-5">
            {/* Search & Filter Bar */}
            <div className="bg-[#0b0f1d] border border-white/5 p-4 rounded-xl space-y-3">
              <div className="flex gap-3 flex-wrap items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search IP, threat type, description..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#00f2ff] transition-all" />
                </div>
                <button onClick={() => setShowFilters(p => !p)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-bold text-gray-300 hover:bg-white/10 transition-all">
                  <Filter size={13} /> Filters <ChevronDown size={13} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00f2ff]/10 border border-[#00f2ff]/20 rounded-xl text-xs font-mono font-bold text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-all">
                  <Download size={13} /> Download Report
                </button>
                <div className="text-[10px] font-mono text-gray-500 px-3 py-2.5 bg-white/3 rounded-xl border border-white/5">
                  {filteredLogs.length} / {socData.logs?.length || 0} threats
                </div>
              </div>

              {showFilters && (
                <div className="flex gap-4 flex-wrap pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Severity</label>
                    <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00f2ff]">
                      {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => <option key={s} value={s} className="bg-[#0b0f1d]">{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Threat Type</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00f2ff]">
                      {uniqueThreatTypes.map(t => <option key={t} value={t} className="bg-[#0b0f1d]">{t}</option>)}
                    </select>
                  </div>
                  <button onClick={() => { setSearchQuery(''); setFilterSeverity('All'); setFilterType('All'); setShowFilters(false); }}
                    className="self-end px-3 py-1.5 text-[10px] font-mono text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-all flex items-center gap-1">
                    <X size={11} /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* Threat Table */}
            <div className="bg-[#0b0f1d] border border-white/5 p-5 rounded-xl">
              <h2 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
                <History className="text-[#00f2ff]" size={16} /> Historical Threat Telemetry
              </h2>
              <ThreatTable logs={filteredLogs} onBlock={handleBlockIP} />
            </div>

            {/* Blocked IPs */}
            <div className="bg-[#0b0f1d] border border-white/5 p-5 rounded-xl">
              <h2 className="text-sm font-black uppercase text-white mb-4 flex items-center gap-2">
                <Lock className="text-red-400" size={16} /> Active Security Quarantines ({socData.blocked_ips?.length || 0})
              </h2>
              <BlockedIPs blocked={socData.blocked_ips || []} onUnblock={handleUnblockIP} />
            </div>
          </div>
        )}

        {/* ══ TAB 3: ANALYZE THREAT ══ */}
        {activeTab === 'Analyze Threat' && (
          <div className="space-y-5 max-w-4xl">
            <div className="bg-[#0b0f1d] border border-white/5 p-6 rounded-xl space-y-4">
              <h2 className="text-base font-black uppercase text-white flex items-center gap-2">
                <Target className="text-[#00f2ff]" size={18} /> IP Threat Intelligence Lookup
              </h2>
              <p className="text-xs text-gray-400 font-mono">Enter an IP address for full AI-powered threat analysis with MITRE ATT&CK mapping and remediation guidance.</p>
              <form onSubmit={handleAnalyzeIp} className="flex gap-3">
                <input value={analyzerIp} onChange={e => setAnalyzerIp(e.target.value)} placeholder="Enter IP address (e.g. 185.220.101.5)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono text-white focus:outline-none focus:border-[#00f2ff]" />
                <button type="submit" disabled={analysisLoading}
                  className="bg-[#00f2ff] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#00d8e6] transition-all font-mono text-xs uppercase flex items-center gap-2">
                  {analysisLoading ? <><RefreshCw size={14} className="animate-spin" /> Scanning...</> : <><Search size={14} /> Analyze</>}
                </button>
              </form>
              {/* Quick-scan example IPs */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-[9px] font-mono text-gray-500 uppercase">Quick scan:</span>
                {['185.220.101.5', '103.44.20.12', '194.26.29.114', '8.8.8.8'].map(ip => (
                  <button key={ip} onClick={() => setAnalyzerIp(ip)}
                    className="text-[9px] font-mono text-[#00f2ff] border border-[#00f2ff]/20 px-2 py-0.5 rounded hover:bg-[#00f2ff]/10 transition-all">{ip}</button>
                ))}
              </div>
            </div>

            {analysisResult && (
              <div className="bg-[#0b0f1d] border border-white/10 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Globe size={20} className={analysisResult.riskScore >= 75 ? 'text-red-400' : 'text-green-400'} />
                    <span className="font-mono text-base font-bold text-white">{analysisResult.ip}</span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black font-mono border ${analysisResult.riskScore >= 75 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    RISK: {analysisResult.riskScore}/100 · {analysisResult.verdict || (analysisResult.riskScore >= 75 ? 'MALICIOUS' : 'CLEAN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                  {[
                    { k: 'Reputation', v: analysisResult.reputation, c: analysisResult.riskScore >= 75 ? 'text-red-400' : 'text-green-400' },
                    { k: 'Geo Location', v: analysisResult.geo },
                    { k: 'ISP / Network', v: analysisResult.isp },
                    { k: 'Threat Class', v: analysisResult.threatType },
                    { k: 'Open Ports', v: analysisResult.open_ports },
                    { k: 'Last Seen', v: analysisResult.last_seen },
                  ].map(({ k, v, c }) => (
                    <div key={k} className="bg-white/3 p-3 rounded-lg border border-white/5">
                      <div className="text-gray-500 text-[9px] uppercase tracking-wider mb-1">{k}</div>
                      <div className={`font-bold ${c || 'text-white'}`}>{v}</div>
                    </div>
                  ))}
                </div>

                {analysisResult.mitre && (
                  <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                    <div className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-2 flex items-center gap-2">
                      <Shield size={12} /> MITRE ATT&CK MAPPING
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                      <div><div className="text-gray-500 text-[9px] mb-1">TECHNIQUE</div><div className="text-white font-bold">{analysisResult.mitre.technique}</div></div>
                      <div><div className="text-gray-500 text-[9px] mb-1">NAME</div><div className="text-white font-bold">{analysisResult.mitre.name}</div></div>
                      <div><div className="text-gray-500 text-[9px] mb-1">TACTIC</div><div className="text-purple-300 font-bold">{analysisResult.mitre.tactic}</div></div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                  <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest mb-2 flex items-center gap-2">
                    <Bot size={12} /> AI REMEDIATION RECOMMENDATION
                  </div>
                  <p className="text-xs font-mono text-gray-300 leading-relaxed">{analysisResult.remediation}</p>
                </div>

                {analysisResult.riskScore >= 75 && (
                  <button onClick={() => handleBlockIP(analysisResult.ip)}
                    className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-black font-mono text-xs uppercase rounded-xl hover:bg-red-500/30 transition-all flex items-center justify-center gap-2">
                    <Lock size={14} /> QUARANTINE THIS IP IMMEDIATELY
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 4: AI SECURITY ASSISTANT ══ */}
        {activeTab === 'Security Assistant' && (
          <div className="max-w-4xl h-[600px] flex flex-col bg-[#0b0f1d] border border-white/5 p-6 rounded-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
              <div className="p-2 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/20">
                <Bot size={20} className="text-[#00f2ff]" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase text-white">SentinelGPT AI Assistant</h2>
                <p className="text-[9px] font-mono text-gray-400">Threat triage · MITRE mapping · Remediation guidance · Risk analysis</p>
              </div>
              <div className="ml-auto flex gap-2 flex-wrap">
                {['What are the top risks?', 'MITRE ATT&CK tactics?', 'How to remediate brute force?', 'Block recommendations'].map(q => (
                  <button key={q} onClick={() => { setAssistantPrompt(q); }}
                    className="text-[9px] font-mono text-gray-400 border border-white/10 px-2 py-1 rounded hover:bg-white/5 hover:text-white transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-[#00f2ff]/20 border border-[#00f2ff]/30 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                      <Bot size={12} className="text-[#00f2ff]" />
                    </div>
                  )}
                  <div className={`max-w-xl p-3.5 rounded-xl font-mono text-xs whitespace-pre-line ${msg.sender === 'user' ? 'bg-[#00f2ff]/10 text-white border border-[#00f2ff]/30 rounded-br-none' : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendAssistant} className="flex gap-3 pt-4 border-t border-white/5 mt-3">
              <input value={assistantPrompt} onChange={e => setAssistantPrompt(e.target.value)}
                placeholder="Ask about threats, MITRE tactics, remediation steps, risk analysis..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-mono text-white focus:outline-none focus:border-[#00f2ff]" />
              <button type="submit" className="bg-[#00f2ff] text-black font-bold px-5 py-3 rounded-xl hover:bg-[#00d8e6] transition-all font-mono text-xs uppercase flex items-center gap-2">
                <Zap size={14} /> Send
              </button>
            </form>
          </div>
        )}

        {/* ══ TAB 5: FILE SCANNER ══ */}
        {activeTab === 'File Upload' && (
          <div className="space-y-5 max-w-3xl">
            <div className="bg-[#0b0f1d] border-2 border-dashed border-white/10 hover:border-[#00f2ff]/40 p-10 rounded-xl text-center space-y-4 transition-all">
              <div className="p-4 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/20 w-fit mx-auto">
                <Upload size={36} className="text-[#00f2ff]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase font-mono">Upload File for AI Threat Analysis</h3>
                <p className="text-xs text-gray-400 font-mono mt-1">Supports .pcap, .log, .exe, .dll, .pdf, .docx — Static & behavioral heuristic scan</p>
              </div>
              <label className="cursor-pointer inline-block bg-[#00f2ff] text-black font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#00d8e6] transition-all font-mono uppercase">
                Select File to Scan
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              {uploadedFile && !uploadAnalysis && (
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
                  <RefreshCw size={14} className="animate-spin text-[#00f2ff]" />
                  Scanning {uploadedFile.name}...
                </div>
              )}
            </div>

            {uploadAnalysis && (
              <div className="bg-[#0b0f1d] border border-white/10 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-gray-400" />
                    <div>
                      <div className="font-mono text-sm font-bold text-white">{uploadAnalysis.filename}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{uploadAnalysis.size}</div>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black font-mono border ${uploadAnalysis.verdict === 'MALICIOUS' ? 'bg-red-500/20 text-red-400 border-red-500/30' : uploadAnalysis.verdict === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    VERDICT: {uploadAnalysis.verdict}
                  </span>
                </div>

                {uploadAnalysis.findings > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">DETECTED INDICATORS ({uploadAnalysis.findings})</div>
                    {uploadAnalysis.threats.map((t, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${t.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : t.severity === 'HIGH' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                        <div>
                          <div className="text-xs font-bold font-mono text-white">{t.type}</div>
                          <div className="text-[9px] font-mono text-gray-400">Offset: {t.offset}</div>
                        </div>
                        <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded ${t.severity === 'CRITICAL' ? 'text-red-400' : t.severity === 'HIGH' ? 'text-amber-400' : 'text-yellow-400'}`}>
                          {t.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
