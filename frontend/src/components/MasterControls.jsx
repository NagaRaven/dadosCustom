import { useState, useEffect, useRef } from 'react';

function statusLabel(forceStatus) {
  if (typeof forceStatus === 'number') return `TIRADA FORZADA: ${forceStatus}`;
  if (forceStatus === 'critical') return 'CRÍTICO ARMADO';
  if (forceStatus === 'fumble')   return 'PIFIA ARMADA';
  return '';
}

const STATUS_OPTIONS = ['Intacto','Herido leve','Herido grave','Enfermo','Aturdido','Lesionado','Heridas críticas'];
const STATUS_COLORS = {
  'Intacto':          '#00e676',
  'Herido leve':      '#ffd700',
  'Herido grave':     '#ff8c00',
  'Enfermo':          '#c084fc',
  'Aturdido':         '#94a3b8',
  'Lesionado':        '#a855f7',
  'Heridas críticas': '#ff4444',
};

// Panel exclusivo del Master — no renderizado para otros usuarios
export default function MasterControls({ onForce, forceStatus, theme = 'blue', onSetTheme, connectedUsers = [], characters = {}, onSetStatus }) {
  const isArmed = forceStatus !== null;
  const [customValue, setCustomValue] = useState('');
  const [collapsed, setCollapsed]     = useState(false);
  const prevStatusRef = useRef(null);

  // Vacía el input cuando la tirada forzada se ha consumido
  useEffect(() => {
    if (prevStatusRef.current !== null && forceStatus === null) {
      setCustomValue('');
    }
    prevStatusRef.current = forceStatus;
  }, [forceStatus]);

  const handleInput = (e) => {
    const raw = e.target.value;
    if (raw === '') { setCustomValue(''); return; }
    if (!/^\d+$/.test(raw)) return;          // solo dígitos
    const num = parseInt(raw, 10);
    if (num < 1 || num > 20) return;         // fuera de rango → rechazado
    setCustomValue(String(num));
  };

  const handleForceCustom = () => {
    const num = parseInt(customValue, 10);
    if (!num || num < 1 || num > 20) return;
    onForce('custom', num);
  };

  const isCustomValid = customValue !== '' && parseInt(customValue, 10) >= 1 && parseInt(customValue, 10) <= 20;

  return (
    <div
      className="hud-corners-full rounded-sm p-4"
      style={{
        background: 'rgba(124,58,237,0.06)',
        border: '1px solid rgba(124,58,237,0.35)',
        boxShadow: isArmed ? '0 0 20px rgba(124,58,237,0.3)' : 'none',
        transition: 'box-shadow 0.4s',
      }}
    >
      {/* Cabecera — clicable para plegar */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          cursor: 'pointer', padding: 0,
          marginBottom: collapsed ? 0 : '12px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: isArmed ? '#ffd700' : '#7c3aed',
            boxShadow: isArmed ? '0 0 8px #ffd700' : '0 0 6px #7c3aed',
            animation: isArmed ? 'glow-pulse 1s ease-in-out infinite' : 'none',
          }}
        />
        <span
          className="font-orbitron text-xs tracking-widest flex-1 text-left"
          style={{ color: isArmed ? '#ffd700' : 'rgba(124,58,237,0.85)' }}
        >
          CONTROL MAESTRO
        </span>
        <span style={{
          fontFamily: 'monospace', fontSize: '11px',
          color: isArmed ? 'rgba(255,215,0,0.6)' : 'rgba(124,58,237,0.6)',
          transition: 'transform 0.2s',
          display: 'inline-block',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </button>

      {/* Contenido plegable */}
      {!collapsed && <>

      {/* Estado del forzado */}
      {isArmed && (
        <div
          className="font-mono text-xs mb-3 px-3 py-2 rounded-sm text-center"
          style={{
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.3)',
            color: '#ffd700',
          }}
        >
          ⚡ {statusLabel(forceStatus)} — EN ESPERA
        </div>
      )}

      {/* Botones crítico / pifia */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => onForce('critical')}
          disabled={isArmed}
          className="flex-1 py-2.5 rounded-sm font-orbitron text-xs tracking-wider transition-all"
          style={{
            background: isArmed ? 'transparent' : 'rgba(255,215,0,0.08)',
            border: `1px solid ${isArmed ? 'rgba(255,215,0,0.2)' : 'rgba(255,215,0,0.55)'}`,
            color: isArmed ? 'rgba(255,215,0,0.3)' : '#ffd700',
            cursor: isArmed ? 'not-allowed' : 'pointer',
            boxShadow: isArmed ? 'none' : '0 0 10px rgba(255,215,0,0.15)',
          }}
          data-testid="force-critical"
        >
          FORZAR CRÍTICO
        </button>

        <button
          onClick={() => onForce('fumble')}
          disabled={isArmed}
          className="flex-1 py-2.5 rounded-sm font-orbitron text-xs tracking-wider transition-all"
          style={{
            background: isArmed ? 'transparent' : 'rgba(255,68,68,0.08)',
            border: `1px solid ${isArmed ? 'rgba(255,68,68,0.2)' : 'rgba(255,68,68,0.55)'}`,
            color: isArmed ? 'rgba(255,68,68,0.3)' : '#ff4444',
            cursor: isArmed ? 'not-allowed' : 'pointer',
            boxShadow: isArmed ? 'none' : '0 0 10px rgba(255,68,68,0.15)',
          }}
          data-testid="force-fumble"
        >
          FORZAR PIFIA
        </button>
      </div>

      {/* Separador */}
      <div
        className="h-px w-full mb-4"
        style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)' }}
      />

      {/* Input + botón tirada personalizada */}
      <div className="flex gap-3 items-stretch">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            placeholder="1 – 20"
            value={customValue}
            onChange={handleInput}
            disabled={isArmed}
            className="cyber-input h-full text-center font-orbitron text-sm"
            style={{
              borderColor: isArmed
                ? 'rgba(124,58,237,0.15)'
                : isCustomValid
                ? 'rgba(124,58,237,0.7)'
                : 'rgba(124,58,237,0.3)',
              color: isCustomValid ? '#c4b5fd' : 'rgba(196,181,253,0.5)',
              background: 'rgba(124,58,237,0.06)',
              cursor: isArmed ? 'not-allowed' : 'text',
            }}
            data-testid="custom-value-input"
          />
        </div>

        <button
          onClick={handleForceCustom}
          disabled={isArmed || !isCustomValid}
          className="flex-1 py-2.5 rounded-sm font-orbitron text-xs tracking-wider transition-all"
          style={{
            background: isArmed || !isCustomValid ? 'transparent' : 'rgba(124,58,237,0.12)',
            border: `1px solid ${isArmed || !isCustomValid ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.7)'}`,
            color: isArmed || !isCustomValid ? 'rgba(124,58,237,0.3)' : '#c4b5fd',
            cursor: isArmed || !isCustomValid ? 'not-allowed' : 'pointer',
            boxShadow: isArmed || !isCustomValid ? 'none' : '0 0 12px rgba(124,58,237,0.25)',
          }}
          data-testid="force-custom"
        >
          FORZAR TIRADA
        </button>
      </div>

      {/* Separador cromático */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.35), transparent)', margin: '16px 0 12px' }}
      />

      {/* Botones de tema — rejilla 2×2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
        {[
          { id:'yellow', label:'AMARILLO', hex:'#ffd700', rgb:'255,215,0' },
          { id:'blue',   label:'AZUL',     hex:'#00d4ff', rgb:'0,212,255' },
          { id:'red',    label:'ROJO',     hex:'#ff4444', rgb:'255,68,68' },
          { id:'orange', label:'NARANJA',  hex:'#ff8c00', rgb:'255,140,0' },
        ].map(({ id, label, hex, rgb }) => {
          const active = theme === id;
          return (
            <button
              key={id}
              onClick={() => onSetTheme(id)}
              disabled={active}
              className="py-2 rounded-sm font-orbitron tracking-wider transition-all"
              style={{
                background: active ? `rgba(${rgb},0.14)` : `rgba(${rgb},0.05)`,
                border: `1px solid ${active ? `rgba(${rgb},0.75)` : `rgba(${rgb},0.4)`}`,
                color: active ? hex : `rgba(${rgb},0.55)`,
                cursor: active ? 'default' : 'pointer',
                boxShadow: active ? `0 0 14px rgba(${rgb},0.3)` : 'none',
                fontSize: '0.52rem',
              }}
            >
              ◉ {label}
            </button>
          );
        })}
      </div>

      {/* Separador + sección de estado por jugador */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.35), transparent)', margin: '14px 0 10px' }}
      />

      <div style={{ fontFamily:'Orbitron,monospace', fontSize:'6.5px', letterSpacing:'0.15em', color:'rgba(124,58,237,0.7)', marginBottom:'8px', textAlign:'center' }}>
        ESTADO DE JUGADORES
      </div>

      {connectedUsers.filter(u => u !== 'Master').length === 0 ? (
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'rgba(124,58,237,0.35)', textAlign:'center', padding:'4px 0' }}>
          Sin jugadores conectados
        </div>
      ) : (
        connectedUsers.filter(u => u !== 'Master').map(u => {
          const currentStatus = characters[u]?.estado || 'Intacto';
          const statusColor = STATUS_COLORS[currentStatus] || '#94a3b8';
          return (
            <div key={u} style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', flexShrink:0, background:statusColor, boxShadow:`0 0 5px ${statusColor}99` }} />
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'6.5px', color:'rgba(200,190,255,0.7)', flex:'0 0 58px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u}</span>
              <select
                value={currentStatus}
                onChange={e => onSetStatus && onSetStatus(u, e.target.value)}
                className="cyber-input"
                style={{ flex:1, fontSize:'9px', padding:'2px 22px 2px 6px', height:'22px', color:statusColor, borderColor:`${statusColor}66` }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          );
        })
      )}

      </>}
    </div>
  );
}
