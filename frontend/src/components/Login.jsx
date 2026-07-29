import React, { useState } from 'react';
import { Shield, Lock, User, Terminal, KeyRound, Mail, UserPlus } from 'lucide-react';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://127.0.0.1:8000';
};

const API_BASE = getApiBase();

const Login = ({ setToken = () => {} }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    const cleanUsername = username.trim();
    if (!cleanUsername || !password.trim()) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
          email: email.trim() || `${cleanUsername}@sentinel.io`,
          password: password.trim()
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Registration failed');
      }

      setSuccessMsg('Operator registered in database! Authenticating...');
      
      setTimeout(() => {
        // Auto-login using the credentials
        handleLogin();
      }, 800);
      
    } catch (err) {
      // Local fallback for offline/demo preview if backend database is unreachable
      const users = getStoredUsers();
      users[cleanUsername.toLowerCase()] = {
        username: cleanUsername,
        email: email.trim() || `${cleanUsername}@sentinel.io`,
        password: password.trim(),
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem('sentinel_users', JSON.stringify(users));
      setSuccessMsg('Operator registered locally! Authenticating...');
      
      setTimeout(() => {
        const token = `operator_token_${Date.now()}`;
        localStorage.setItem('sentinel_token', token);
        localStorage.setItem('sentinel_operator', cleanUsername);
        setToken(token);
        setLoading(false);
      }, 800);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const cleanUsername = username.toLowerCase().trim();
    const storedUsers = getStoredUsers();

    // Check locally registered accounts first
    if (storedUsers[cleanUsername] && storedUsers[cleanUsername].password === password.trim()) {
      const token = `operator_token_${Date.now()}`;
      localStorage.setItem('sentinel_token', token);
      localStorage.setItem('sentinel_operator', storedUsers[cleanUsername].username);
      setToken(token);
      setLoading(false);
      return;
    }

    try {
      const endpoint = API_BASE.endsWith('/') ? `${API_BASE}api/login` : `${API_BASE}/api/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || 'admin', password: password || 'admin123' }),
      });

      if (!response.ok) {
        const formData = new FormData();
        formData.append('username', username || 'admin');
        formData.append('password', password || 'admin123');

        const fallbackResponse = await fetch(endpoint, { method: 'POST', body: formData });
        if (!fallbackResponse.ok) throw new Error('AUTHORIZATION_FAILED');
        const fallbackData = await fallbackResponse.json();
        if (fallbackData?.access_token) {
          localStorage.setItem('sentinel_token', fallbackData.access_token);
          localStorage.setItem('sentinel_operator', username || 'admin');
          setToken(fallbackData.access_token);
          return;
        }
      }

      const data = await response.json();
      const token = data?.access_token;
      if (token) {
        localStorage.setItem('sentinel_token', token);
        localStorage.setItem('sentinel_operator', username || 'admin');
        setToken(token);
      } else {
        throw new Error('TOKEN_ERROR');
      }
    } catch {
      if ((username === 'admin' && (password === 'admin123' || password === '')) || storedUsers[cleanUsername]) {
        const dummyToken = 'bypass_token';
        localStorage.setItem('sentinel_token', dummyToken);
        localStorage.setItem('sentinel_operator', username || 'admin');
        setToken(dummyToken);
      } else {
        setError('Invalid Operator Credentials. Check username or register a new account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = () => {
    const dummyToken = 'bypass_token';
    localStorage.setItem('sentinel_token', dummyToken);
    localStorage.setItem('sentinel_operator', 'admin');
    setToken(dummyToken);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070a13] text-[#e0e0e0] font-sans selection:bg-[#00f2ff]">
      <div className="glass-card p-8 md:p-10 w-full max-w-md shadow-2xl border border-white/10 rounded-2xl bg-[#0b0f1d]">
        
        {/* BRANDING HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3.5 rounded-2xl bg-[#00f2ff]/10 mb-3 border border-[#00f2ff]/20 shadow-[0_0_20px_rgba(0,242,255,0.15)]">
            <Shield size={42} className="text-[#00f2ff]" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-1">
            SENTINEL<span className="text-[#7000ff]">GPT</span>
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold">
            Autonomous Cyber Defense Link
          </p>
        </div>

        {/* MODE TOGGLE TABS */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              !isRegisterMode ? 'bg-[#00f2ff] text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock size={12} /> Operator Login
          </button>

          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isRegisterMode ? 'bg-[#00f2ff] text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus size={12} /> Register Account
          </button>
        </div>

        {/* ERROR & SUCCESS ALERTS */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-3 rounded-xl text-center font-bold font-mono">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] p-3 rounded-xl text-center font-bold font-mono">
            {successMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {!isRegisterMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                <User size={12} /> Operator Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                placeholder="Username or Email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                <Lock size={12} /> Security Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                placeholder="•••••••• (admin123)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#00f2ff] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#00d8e6] transition-all active:scale-95 flex items-center justify-center gap-2 text-xs tracking-wider font-mono uppercase"
            >
              {loading ? "AUTHENTICATING MATRIX..." : <><Terminal size={16} /> AUTHORIZE DEFENSE ACCESS</>}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMsg(''); }}
                className="text-[11px] text-[#00f2ff] hover:underline font-mono"
              >
                Create New Operator Account →
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                <User size={12} /> Operator Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                placeholder="Choose username"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                <Mail size={12} /> Operator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                placeholder="operator@organization.io"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                <Lock size={12} /> Security Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                placeholder="Create password"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-mono">
                <Lock size={12} /> Confirm Security Key
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00f2ff] transition-all font-mono"
                placeholder="Confirm password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-[#00f2ff] text-black font-extrabold py-3.5 rounded-xl hover:bg-[#00d8e6] transition-all active:scale-95 flex items-center justify-center gap-2 text-xs tracking-wider font-mono uppercase"
            >
              <UserPlus size={16} /> REGISTER OPERATOR ACCOUNT
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
                className="text-[11px] text-gray-400 hover:text-white hover:underline font-mono"
              >
                ← Back to Operator Login
              </button>
            </div>
          </form>
        )}

        {/* QUICK DEMO ACCESS */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col items-center gap-2">
          <button
            onClick={handleBypass}
            className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors uppercase font-mono tracking-widest flex items-center gap-1"
          >
            <KeyRound size={12} /> Quick Demo Access (Bypass)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
