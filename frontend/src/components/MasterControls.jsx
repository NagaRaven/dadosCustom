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

export default function MasterControls({ onForce, forceStatus, theme = 'blue', onSetTheme, connectedUsers = [], characters = {}, onSetStatus, canForce = false }) {
  const isArmed = forceStatus !== null;
  const [customValue, setCustomValue] = useState('');
  const [collapsed, setCollapsed]     = useState(true);
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
      className="hud-corners-full rounded-sm py-3 px-4"
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

      {/* Controles de forzado — todo en una sola fila */}
      <div className="flex gap-2 mb-4 items-center">

        {/* Crítico — cuadrado amarillo, sin texto */}
        <button
          onClick={() => canForce && onForce('critical')}
          disabled={isArmed || !canForce}
          title={canForce ? 'Forzar crítico (20)' : 'Sin permisos para forzar'}
          style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: (isArmed || !canForce) ? 'transparent' : 'rgba(255,215,0,0.08)',
            border: `1px solid ${(isArmed || !canForce) ? 'rgba(255,215,0,0.2)' : 'rgba(255,215,0,0.55)'}`,
            color: (isArmed || !canForce) ? 'rgba(255,215,0,0.3)' : '#ffd700',
            cursor: (isArmed || !canForce) ? 'not-allowed' : 'pointer',
            boxShadow: (isArmed || !canForce) ? 'none' : '0 0 10px rgba(255,215,0,0.15)',
            borderRadius: '2px',
            fontFamily: 'Orbitron, monospace',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
          data-testid="force-critical"
        >
          20
        </button>

        {/* Pifia — cuadrado rojo, sin texto */}
        <button
          onClick={() => canForce && onForce('fumble')}
          disabled={isArmed || !canForce}
          title={canForce ? 'Forzar pifia (1)' : 'Sin permisos para forzar'}
          style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: (isArmed || !canForce) ? 'transparent' : 'rgba(255,68,68,0.08)',
            border: `1px solid ${(isArmed || !canForce) ? 'rgba(255,68,68,0.2)' : 'rgba(255,68,68,0.55)'}`,
            color: (isArmed || !canForce) ? 'rgba(255,68,68,0.3)' : '#ff4444',
            cursor: (isArmed || !canForce) ? 'not-allowed' : 'pointer',
            boxShadow: (isArmed || !canForce) ? 'none' : '0 0 10px rgba(255,68,68,0.15)',
            borderRadius: '2px',
            fontFamily: 'Orbitron, monospace',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
          data-testid="force-fumble"
        >
          1
        </button>

        {/* Input tirada personalizada */}
        <input
          type="text"
          inputMode="numeric"
          placeholder="1–20"
          value={customValue}
          onChange={handleInput}
          onKeyDown={(e) => e.key === 'Enter' && canForce && handleForceCustom()}
          disabled={isArmed || !canForce}
          className="cyber-input text-center font-orbitron text-sm flex-1"
          style={{
            height: '40px',
            borderColor: (isArmed || !canForce)
              ? 'rgba(124,58,237,0.15)'
              : isCustomValid
              ? 'rgba(124,58,237,0.7)'
              : 'rgba(124,58,237,0.3)',
            color: isCustomValid && canForce ? '#c4b5fd' : 'rgba(196,181,253,0.5)',
            background: 'rgba(124,58,237,0.06)',
            cursor: (isArmed || !canForce) ? 'not-allowed' : 'text',
          }}
          data-testid="custom-value-input"
        />

        {/* Confirmar tirada personalizada — icono ▶ */}
        <button
          onClick={() => canForce && handleForceCustom()}
          disabled={isArmed || !isCustomValid || !canForce}
          title={canForce ? 'Forzar tirada personalizada' : 'Sin permisos para forzar'}
          style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: (isArmed || !isCustomValid || !canForce) ? 'transparent' : 'rgba(124,58,237,0.12)',
            border: `1px solid ${(isArmed || !isCustomValid || !canForce) ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.7)'}`,
            color: (isArmed || !isCustomValid || !canForce) ? 'rgba(124,58,237,0.3)' : '#c4b5fd',
            cursor: (isArmed || !isCustomValid || !canForce) ? 'not-allowed' : 'pointer',
            boxShadow: (isArmed || !isCustomValid || !canForce) ? 'none' : '0 0 12px rgba(124,58,237,0.25)',
            borderRadius: '2px',
            fontSize: '16px',
          }}
          data-testid="force-custom"
        >
          ▶
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

      {connectedUsers.filter(u => u !== 'Master' && u !== 'Desarrollador').length === 0 ? (
        <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:'11px', color:'rgba(124,58,237,0.35)', textAlign:'center', padding:'4px 0' }}>
          Sin jugadores conectados
        </div>
      ) : (
        connectedUsers.filter(u => u !== 'Master' && u !== 'Desarrollador').map(u => {
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
