import React, { useState } from 'react';
<<<<<<< HEAD
import { Shield, Lock, User, Terminal, KeyRound } from 'lucide-react';
=======
import { Shield, Lock, User, Terminal, KeyRound, Mail, UserPlus, Building, ShieldAlert, Check } from 'lucide-react';
>>>>>>> b14c3a6d116677458df651f45a076b68ee997c05

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://127.0.0.1:8000';
};

const API_BASE = getApiBase();

const Login = ({ setToken = () => {} }) => {
<<<<<<< HEAD
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/login` : `${API_BASE}/api/login`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || 'admin', password: password || 'admin123' }),
      });

      if (!response.ok) {
        // Fallback for OAuth form request if JSON not accepted
        const formData = new FormData();
        formData.append('username', username || 'admin');
        formData.append('password', password || 'admin123');

        const fallbackResponse = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        if (!fallbackResponse.ok) throw new Error('AUTHORIZATION_FAILED');
        const fallbackData = await fallbackResponse.json();
        if (fallbackData?.access_token) {
          localStorage.setItem('sentinel_token', fallbackData.access_token);
          setToken(fallbackData.access_token);
=======
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Registration specific fields
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Security Analyst');
  const [organization, setOrganization] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const getStoredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('sentinel_users') || '{}');
    } catch {
      return {};
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const cleanUsername = username.trim() || email.split('@')[0];
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim() || !fullName.trim()) {
      setError('Full Name, Email, and Password are required');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the terms & conditions');
      setLoading(false);
      return;
    }

    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/register` : `${API_BASE}/api/register`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: password.trim(),
          full_name: fullName.trim(),
          role: role,
          organization: organization.trim() || 'Independent'
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Registration failed');
      }

      setSuccessMsg('Operator registered in database! Authenticating...');
      
      setTimeout(() => {
        // Auto-login using the credentials
        triggerLoginFlow(cleanEmail, password);
      }, 800);
      
    } catch (err) {
      // Local fallback for offline/demo preview if backend database is unreachable
      const users = getStoredUsers();
      users[cleanEmail] = {
        username: cleanUsername,
        email: cleanEmail,
        password: password.trim(),
        full_name: fullName.trim(),
        role: role,
        organization: organization.trim() || 'Independent',
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem('sentinel_users', JSON.stringify(users));
      setSuccessMsg('Operator registered locally! Authenticating...');
      
      setTimeout(() => {
        const token = `operator_token_${Date.now()}`;
        localStorage.setItem('sentinel_token', token);
        localStorage.setItem('sentinel_operator', cleanUsername);
        localStorage.setItem('sentinel_user_fullname', fullName.trim());
        localStorage.setItem('sentinel_user_role', role);
        localStorage.setItem('sentinel_user_org', organization.trim() || 'Independent');
        localStorage.setItem('sentinel_user_email', cleanEmail);
        setToken(token);
        setLoading(false);
      }, 800);
    }
  };

  const triggerLoginFlow = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError('');
    
    const cleanEmail = loginEmail.trim().toLowerCase();
    const storedUsers = getStoredUsers();

    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/login` : `${API_BASE}/api/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanEmail, password: loginPassword }),
      });

      if (!response.ok) {
        // Form Data fallback
        const formData = new FormData();
        formData.append('username', cleanEmail);
        formData.append('password', loginPassword);
        const fbResponse = await fetch(endpoint, { method: 'POST', body: formData });
        if (!fbResponse.ok) throw new Error('AUTH_FAILED');
        
        const fbData = await fbResponse.json();
        if (fbData?.access_token) {
          localStorage.setItem('sentinel_token', fbData.access_token);
          localStorage.setItem('sentinel_operator', fbData.username || cleanEmail.split('@')[0]);
          localStorage.setItem('sentinel_user_fullname', fbData.full_name || 'Operator');
          localStorage.setItem('sentinel_user_role', fbData.role || 'Security Analyst');
          localStorage.setItem('sentinel_user_org', fbData.organization || 'Sentinel Corp');
          localStorage.setItem('sentinel_user_email', fbData.email || cleanEmail);
          setToken(fbData.access_token);
>>>>>>> b14c3a6d116677458df651f45a076b68ee997c05
          return;
        }
      }

      const data = await response.json();
<<<<<<< HEAD
      const token = data?.access_token;
      
      if (token) {
        localStorage.setItem('sentinel_token', token);
        setToken(token);
      } else {
        throw new Error('TOKEN_ERROR');
      }
    } catch (err) {
      // Local fallback for offline/demo simulation if backend unreachable during preview
      if (username === 'admin' && (password === 'admin123' || password === '')) {
        const dummyToken = 'bypass_token';
        localStorage.setItem('sentinel_token', dummyToken);
        setToken(dummyToken);
      } else {
        setError('Invalid Access Credentials');
=======
      if (data?.access_token) {
        localStorage.setItem('sentinel_token', data.access_token);
        localStorage.setItem('sentinel_operator', data.username || cleanEmail.split('@')[0]);
        localStorage.setItem('sentinel_user_fullname', data.full_name || 'Operator');
        localStorage.setItem('sentinel_user_role', data.role || 'Security Analyst');
        localStorage.setItem('sentinel_user_org', data.organization || 'Sentinel Corp');
        localStorage.setItem('sentinel_user_email', data.email || cleanEmail);
        setToken(data.access_token);
      } else {
        throw new Error('TOKEN_ERROR');
      }
    } catch {
      // Local offline verification
      const defaultAccounts = {
        "admin@sentinel.ai": { password: "Admin@123", username: "admin", fullname: "Admin User", role: "Administrator", org: "Sentinel Security Core" },
        "analyst@sentinel.ai": { password: "Analyst@123", username: "analyst", fullname: "Analyst User", role: "Security Analyst", org: "Global SOC Center" },
        "demo@sentinel.ai": { password: "Demo@123", username: "demo", fullname: "Demo User", role: "Demo Observer", org: "Public Sandbox" }
      };
      
      let authenticatedUser = null;
      if (defaultAccounts[cleanEmail] && defaultAccounts[cleanEmail].password === loginPassword) {
        authenticatedUser = defaultAccounts[cleanEmail];
      } else {
        // Check registered local users
        const matchedUser = Object.values(storedUsers).find(u => u.email === cleanEmail);
        if (matchedUser && matchedUser.password === loginPassword) {
          authenticatedUser = {
            username: matchedUser.username,
            fullname: matchedUser.full_name,
            role: matchedUser.role,
            org: matchedUser.organization
          };
        }
      }

      if (authenticatedUser) {
        const dummyToken = 'bypass_token';
        localStorage.setItem('sentinel_token', dummyToken);
        localStorage.setItem('sentinel_operator', authenticatedUser.username);
        localStorage.setItem('sentinel_user_fullname', authenticatedUser.fullname);
        localStorage.setItem('sentinel_user_role', authenticatedUser.role);
        localStorage.setItem('sentinel_user_org', authenticatedUser.org);
        localStorage.setItem('sentinel_user_email', cleanEmail);
        setToken(dummyToken);
      } else {
        setError('Invalid Operator Credentials. Check email or security key.');
>>>>>>> b14c3a6d116677458df651f45a076b68ee997c05
      }
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleBypass = () => {
    const dummyToken = 'bypass_token';
    localStorage.setItem('sentinel_token', dummyToken);
=======
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    triggerLoginFlow(email, password);
  };

  const handleBypass = () => {
    const dummyToken = 'bypass_token';
    localStorage.setItem('sentinel_token', dummyToken);
    localStorage.setItem('sentinel_operator', 'admin');
    localStorage.setItem('sentinel_user_fullname', 'Admin User');
    localStorage.setItem('sentinel_user_role', 'Administrator');
    localStorage.setItem('sentinel_user_org', 'Sentinel Security Core');
    localStorage.setItem('sentinel_user_email', 'admin@sentinel.ai');
>>>>>>> b14c3a6d116677458df651f45a076b68ee997c05
    setToken(dummyToken);
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050510] text-[#e0e0e0] font-sans selection:bg-[#00f2ff]">
      <div className="glass-card p-8 md:p-10 w-full max-w-md shadow-2xl border border-white/10 rounded-2xl bg-white/[0.01]">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-[#00f2ff]/10 mb-4 border border-[#00f2ff]/20">
            <Shield size={44} className="text-[#00f2ff]" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-1">
            SENTINEL<span className="text-[#7000ff]">GPT</span>
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold">
            Autonomous Cyber Defense Link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
              <User size={12} /> Operator Identity
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all font-mono"
              placeholder="Username (admin)"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
              <Lock size={12} /> Security Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#00f2ff]/50 transition-all font-mono"
              placeholder="•••••••• (admin123)"
            />
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-3 rounded-xl text-center font-bold font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00f2ff] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#00d8e6] transition-all active:scale-95 flex items-center justify-center gap-2 text-xs tracking-wider"
          >
            {loading ? "AUTHENTICATING MATRIX..." : <><Terminal size={16} /> AUTHORIZE DEFENSE ACCESS</>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
          <button
            onClick={handleBypass}
            className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors uppercase font-mono tracking-widest flex items-center gap-1"
          >
            <KeyRound size={12} /> Quick Demo Access (Bypass)
          </button>
=======
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#05070f] text-[#d1d5db] font-sans selection:bg-[#00f2ff] overflow-hidden">
      
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.15); }
        }
        .scanline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0, 242, 255, 0), rgba(0, 242, 255, 0.05) 50%, rgba(0, 242, 255, 0) 100%);
          animation: scanline 7s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        .orb-1 {
          animation: float-orb-1 12s infinite ease-in-out;
        }
        .orb-2 {
          animation: float-orb-2 15s infinite ease-in-out;
        }
        .cyber-panel {
          box-shadow: 0 0 25px rgba(0, 242, 255, 0.15), inset 0 0 15px rgba(0, 242, 255, 0.05);
          backdrop-filter: blur(12px);
        }
      `}</style>

      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00f2ff]/5 filter blur-[100px] orb-1"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[#7000ff]/5 filter blur-[120px] orb-2"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        
        {/* Scanline overlay */}
        <div className="scanline"></div>
      </div>

      {/* CENTRAL AUTH CARD */}
      <div className="relative z-10 w-full max-w-lg transition-all duration-300">
        <div className="cyber-panel p-8 md:p-10 border border-[#00f2ff]/20 bg-[#080d1a]/85 rounded-2xl">
          
          {/* HEADER / LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3.5 rounded-2xl bg-[#00f2ff]/10 mb-3 border border-[#00f2ff]/25 shadow-[0_0_25px_rgba(0,242,255,0.2)]">
              <Shield size={44} className="text-[#00f2ff] animate-pulse" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-0.5">
              SENTINEL<span className="text-[#7000ff]">GPT</span>
            </h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping"></span>
              Autonomous AI SOC Defense Link
            </p>
          </div>

          {/* MODE SELECTOR */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isRegisterMode ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.3)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lock size={12} /> OPERATOR LOGIN
            </button>

            <button
              type="button"
              onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isRegisterMode ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.3)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={12} /> NEW REGISTER
            </button>
          </div>

          {/* ALERT SYSTEM */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] p-3.5 rounded-xl font-bold font-mono flex items-center gap-2 shadow-inner">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] p-3.5 rounded-xl font-bold font-mono flex items-center gap-2 shadow-inner">
              <Check size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {!isRegisterMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                  <Mail size={12} className="text-[#00f2ff]" /> Email or Identity
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]/30 transition-all font-mono"
                  placeholder="admin@sentinel.ai"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                  <Lock size={12} className="text-[#00f2ff]" /> Security Key / Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]/30 transition-all font-mono"
                  placeholder="••••••••"
                />
              </div>

              {/* REMEMBER & FORGOT */}
              <div className="flex items-center justify-between text-xs font-mono px-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-white/5 border border-white/10 text-[#00f2ff] focus:ring-0 cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setError('Password recovery link has been logged to security terminal.')}
                  className="text-[#00f2ff] hover:underline"
                >
                  Forgot Key?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#00f2ff] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#00d8e6] transition-all active:scale-95 flex items-center justify-center gap-2 text-xs tracking-wider font-mono uppercase shadow-[0_0_15px_rgba(0,242,255,0.2)]"
              >
                {loading ? "INITIALIZING SECURITY ACCESS..." : <><Terminal size={16} /> AUTHORIZE MATRIX ACCESS</>}
              </button>

              <div className="text-center mt-3.5">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMsg(''); }}
                  className="text-xs text-gray-400 hover:text-[#00f2ff] transition-colors font-mono"
                >
                  Need access? <span className="underline font-bold">Register Operator</span>
                </button>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                    <User size={11} className="text-[#00f2ff]" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                    placeholder="Pravallika"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                    <Mail size={11} className="text-[#00f2ff]" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                    placeholder="operator@sentinel.ai"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                    <User size={11} className="text-[#00f2ff]" /> Account Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                    placeholder="pravallika2025"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                    <Building size={11} className="text-[#00f2ff]" /> Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                    placeholder="Global SOC Corp"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                  <Shield size={11} className="text-[#00f2ff]" /> Operational Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#040812]/90 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f2ff] font-mono cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="Incident Responder">Incident Responder</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                    <Lock size={11} className="text-[#00f2ff]" /> Security Key
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                    placeholder="Create key"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                    <Lock size={11} className="text-[#00f2ff]" /> Confirm Key
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#040812]/80 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                    placeholder="Verify key"
                  />
                </div>
              </div>

              {/* TERMS */}
              <div className="flex items-start gap-2 text-[10px] font-mono text-gray-400 mt-2 px-1">
                <input
                  type="checkbox"
                  required
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded bg-white/5 border border-white/10 text-[#00f2ff] focus:ring-0 mt-0.5 cursor-pointer"
                />
                <label htmlFor="terms" className="cursor-pointer hover:text-gray-200">
                  I accept the Sentinel Security protocol and terms of authorization.
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-3 bg-[#00f2ff] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#00d8e6] transition-all active:scale-95 flex items-center justify-center gap-2 text-xs tracking-wider font-mono uppercase shadow-[0_0_15px_rgba(0,242,255,0.2)]"
              >
                <UserPlus size={16} /> REGISTER OPERATOR
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
                  className="text-xs text-gray-400 hover:text-[#00f2ff] transition-colors font-mono"
                >
                  Already authorized? <span className="underline font-bold">Back to Login</span>
                </button>
              </div>
            </form>
          )}

          {/* QUICK DEMO ACCESS */}
          <div className="mt-5 pt-4 border-t border-white/5 flex flex-col items-center gap-2.5">
            <button
              onClick={handleBypass}
              className="text-[10px] text-[#00f2ff]/60 hover:text-[#00f2ff] transition-colors uppercase font-mono tracking-widest flex items-center gap-1.5"
            >
              <KeyRound size={12} /> Quick Demo Access (Bypass)
            </button>
            
            {/* Seeded credentials help */}
            <div className="text-[9px] text-gray-500 font-mono text-center leading-relaxed">
              Default users:<br/>
              Admin: <span className="text-[#00f2ff]">admin@sentinel.ai</span> (Admin@123)<br/>
              Analyst: <span className="text-[#00f2ff]">analyst@sentinel.ai</span> (Analyst@123)<br/>
              Demo: <span className="text-[#00f2ff]">demo@sentinel.ai</span> (Demo@123)
            </div>
          </div>

>>>>>>> b14c3a6d116677458df651f45a076b68ee997c05
        </div>
      </div>
    </div>
  );
};

export default Login;
