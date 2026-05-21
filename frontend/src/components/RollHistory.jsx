import { useState } from 'react';

function ResultBadge({ value }) {
  const style = value === 20
    ? { color: '#ffd700', textShadow: '0 0 8px #ffd700', fontSize: '1.1rem' }
    : value === 1
    ? { color: '#ff4444', textShadow: '0 0 8px #ff4444', fontSize: '1.1rem' }
    : { color: '#00d4ff', fontSize: '1.1rem' };

  return <span className="font-orbitron font-black" style={style}>{value}</span>;
}

function RollEntry({ roll, isLatest }) {
  const isCrit   = roll.result === 20;
  const isFumble = roll.result === 1;
  const isForce  = !!roll.usedForce;

  const borderColor = isCrit    ? '#ffd700'
    : isFumble ? '#ff4444'
    : isForce  ? '#00ff88'
    : isLatest ? '#00d4ff'
    : 'rgba(0,212,255,0.2)';

  const bg = isCrit    ? 'rgba(255,215,0,0.07)'
    : isFumble ? 'rgba(255,68,68,0.07)'
    : isForce  ? 'rgba(0,255,136,0.06)'
    : isLatest ? 'rgba(0,212,255,0.07)'
    : 'transparent';

  let boxShadow = 'none';
  let animation = 'none';

  if (isLatest) {
    if (isCrit) {
      boxShadow = '0 0 18px rgba(255,215,0,0.25), inset 0 0 8px rgba(255,215,0,0.05)';
      animation = 'roll-entry 0.35s ease-out, crit-entry-glow 2.2s 0.4s ease-in-out infinite';
    } else if (isFumble) {
      boxShadow = '0 0 18px rgba(255,68,68,0.25), inset 0 0 8px rgba(255,68,68,0.05)';
      animation = 'roll-entry 0.35s ease-out, fumble-entry-glow 2.2s 0.4s ease-in-out infinite';
    } else if (isForce) {
      boxShadow = '0 0 18px rgba(0,255,136,0.2), inset 0 0 8px rgba(0,255,136,0.04)';
      animation = 'roll-entry 0.35s ease-out, force-entry-glow 2.2s 0.4s ease-in-out infinite';
    } else {
      animation = 'roll-entry 0.35s ease-out';
    }
  }

  const borderStyle = isLatest && (isCrit || isFumble || isForce)
    ? { border: `1px solid ${borderColor}`, borderLeft: `3px solid ${borderColor}` }
    : { borderLeft: `2px solid ${borderColor}` };

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-sm"
      style={{ background: bg, boxShadow, animation, transition: 'box-shadow 0.3s', ...borderStyle }}
      data-testid="roll-entry"
    >
      <span className="font-rajdhani font-semibold text-base" style={{ color: '#a0b4cc', minWidth: '90px' }}>
        {roll.username}
      </span>
      <span className="font-mono text-xs" style={{ color: 'rgba(0,212,255,0.4)', flex: 1, textAlign: 'center' }}>
        1d20 =
      </span>
      <ResultBadge value={roll.result} />
      <div className="flex gap-2 ml-3" style={{ minWidth: '80px', justifyContent: 'flex-end' }}>
        {isCrit   && <span className="font-mono text-xs" style={{ color: '#ffd700', opacity: 0.9 }}>CRÍTICO</span>}
        {isFumble && <span className="font-mono text-xs" style={{ color: '#ff4444', opacity: 0.9 }}>PIFIA</span>}
        {isForce  && <span className="font-mono text-xs" style={{ color: '#00ff88', opacity: 0.9 }}>★ FUERZA</span>}
        {!isCrit && !isFumble && !isForce && <span style={{ width: '56px' }} />}
      </div>
    </div>
  );
}

export default function RollHistory({ history, currentUser, isAnimating }) {
  const [expanded, setExpanded] = useState(false);

  const visible = (isAnimating && history.length > 0 && history[history.length - 1].username === currentUser)
    ? history.slice(0, -1)
    : history;

  const reversed = [...visible].reverse();
  const top5     = reversed.slice(0, 5);
  const rest     = reversed.slice(5);

  return (
    <div className="flex flex-col h-full hud-corners-full glass-panel rounded-sm overflow-hidden">
      {/* Cabecera */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(0,212,255,0.15)' }}>
        <h2 className="font-orbitron text-xs tracking-widest text-glow-cyan" style={{ color: '#00d4ff' }}>
          REGISTRO GLOBAL
        </h2>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {reversed.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-mono text-xs text-center" style={{ color: 'rgba(0,212,255,0.25)' }} data-testid="empty-history">
              Sin tiradas registradas.
              <br />Pulsa el botón para empezar.
            </p>
          </div>
        ) : (
          <>
            {/* Las 5 más recientes — siempre visibles */}
            {top5.map((roll, idx) => (
              <RollEntry key={roll.id} roll={roll} isLatest={idx === 0} />
            ))}

            {/* Desplegable con las anteriores */}
            {rest.length > 0 && (
              <>
                <button
                  onClick={() => setExpanded(e => !e)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '6px 16px', marginTop: '2px',
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.18))' }} />
                  <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.52rem', letterSpacing: '0.13em', color: 'rgba(0,212,255,0.45)', whiteSpace: 'nowrap' }}>
                    {expanded ? '▲ OCULTAR' : `▼ ${rest.length} ANTERIORES`}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.18))' }} />
                </button>

                {expanded && (
                  <div className="space-y-0.5">
                    {rest.map((roll) => (
                      <RollEntry key={roll.id} roll={roll} isLatest={false} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
