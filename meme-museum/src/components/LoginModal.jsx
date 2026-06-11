import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ onClose }) {
  const { login, register, error, setError } = useAuth();
  const [mode, setMode]         = useState('login'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [localError, setLocalError] = useState('');

  const err = localError || error;

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setLocalError('');
    setError(null);
  };

  const handleSubmit = async () => {
    setLocalError('');
    if (!username.trim() || !password.trim()) {
      setLocalError('Compila tutti i campi');
      return;
    }
    if (password.length < 4) {
      setLocalError('Password troppo corta (min 4 caratteri)');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') await login(username.trim(), password);
      else await register(username.trim(), password);
      onClose();
    } catch (e) {
      setLocalError(e.message || 'Qualcosa è andato storto');
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* Sfondo super leggero per la GPU senza blur */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5, 5, 5, 0.96)' }}
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-sm mx-auto rounded-2xl p-7 flex flex-col gap-5 animate-fade-up"
        style={{ background: '#161616', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bebas text-3xl text-white tracking-wide">
            {mode === 'login' ? 'LOGIN' : 'REGISTRATI'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors text-xl leading-none"
          >✕</button>
        </div>

        {mode === 'login' && (
          <p className="text-[10px] font-mono text-[#555] bg-[#111] rounded-lg px-3 py-2 border border-[#222]">
            💡 Dev mode: usa <span className="text-[#7c5cbf]">test / test</span>
          </p>
        )}

        {err && (
          <div className="text-xs font-mono text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={onKey}
            autoFocus
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#7c5cbf] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKey}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-[#7c5cbf] transition-colors"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-mono font-bold text-sm text-white tracking-widest uppercase transition-all active:scale-95"
          style={{
            background: loading ? '#333' : '#7c5cbf',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Attendere...' : mode === 'login' ? 'Entra' : 'Crea account'}
        </button>

        <p className="text-center text-xs font-mono text-[#555]">
          {mode === 'login' ? 'Non hai un account?' : 'Hai già un account?'}{' '}
          <button
            onClick={switchMode}
            className="text-[#7c5cbf] hover:underline"
          >
            {mode === 'login' ? 'Registrati' : 'Accedi'}
          </button>
        </p>
      </div>
    </div>
  );
}