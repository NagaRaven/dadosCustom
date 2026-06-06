import { useState } from 'react';

const USERS = ['Master', 'Desarrollador', 'Nivare', 'Xalithra', 'Luz-Ya', 'Mireya', 'Kang'];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Selecciona un operador e ingresa el código de acceso');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        onLogin(data.username);
      } else {
        setError(data.message || 'Código de acceso incorrecto');
      }
    } catch {
      setError('Sin conexión con el servidor. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="scan-line" />

      {/* Partículas decorativas de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width:  `${120 + i * 80}px`,
              height: `${120 + i * 80}px`,
              border: '1px solid #00d4ff',
              left:   `${10 + i * 15}%`,
              top:    `${20 + (i % 3) * 25}%`,
              animation: `glow-pulse ${3 + i}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Tarjeta de login */}
      <div className="relative w-full max-w-md hud-corners-full glass-panel-bright rounded-sm p-8">

        {/* Cabecera */}
        <div className="text-center mb-8">
          {/* Emblema */}
          <div className="relative inline-block mb-4">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{
                border: '2px solid #00d4ff',
                boxShadow: '0 0 20px rgba(0,212,255,0.4), inset 0 0 20px rgba(0,212,255,0.1)',
              }}
            >
              <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px #00d4ff)' }}>
                ⬡
              </span>
            </div>
          </div>

          <h1
            className="font-orbitron text-lg font-black tracking-wider text-glow-cyan mb-1"
            style={{ color: '#00d4ff', animation: 'glitch 5s infinite' }}
          >
            STAR WARS — LA TIERRA PROMETIDA
          </h1>
          <p className="font-mono text-xs tracking-widest" style={{ color: 'rgba(0,212,255,0.5)' }}>
            SISTEMA DE ACCESO SEGURO — v2.0
          </p>
        </div>

        {/* Línea separadora */}
        <div
          className="h-px w-full mb-8"
          style={{ background: 'linear-gradient(to right, transparent, #00d4ff, transparent)' }}
        />

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Selector de operador */}
          <div>
            <label
              className="block font-orbitron text-xs tracking-widest mb-2"
              style={{ color: 'rgba(0,212,255,0.7)' }}
            >
              OPERADOR
            </label>
            <select
              className="cyber-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="username-select"
            >
              <option value="">— SELECCIONAR —</option>
              {USERS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Contraseña */}
          <div>
            <label
              className="block font-orbitron text-xs tracking-widest mb-2"
              style={{ color: 'rgba(0,212,255,0.7)' }}
            >
              CÓDIGO DE ACCESO
            </label>
            <input
              type="password"
              className="cyber-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              data-testid="password-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="font-mono text-xs p-3 rounded-sm"
              style={{
                background: 'rgba(255,68,68,0.08)',
                border: '1px solid rgba(255,68,68,0.35)',
                color: '#ff6666',
              }}
              data-testid="error-message"
            >
              ⚠ {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className="cyber-btn w-full py-3 text-sm"
            disabled={loading}
            data-testid="login-button"
            style={loading ? {} : { animation: 'glow-pulse 2s ease-in-out infinite' }}
          >
            {loading ? '· VERIFICANDO ·' : 'ACCEDER AL SISTEMA'}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center font-mono text-xs mt-6"
          style={{ color: 'rgba(0,212,255,0.2)' }}
        >
          CREADO POR DAVID MOLINA LABIANO
        </p>
      </div>
    </div>
  );
}
