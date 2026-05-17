
function ResultBadge({ value }) {
  if (value === 20) {
    return (
      <span
        className="font-orbitron font-black"
        style={{ color: '#ffd700', textShadow: '0 0 8px #ffd700', fontSize: '1.1rem' }}
      >
        {value}
      </span>
    );
  }
  if (value === 1) {
    return (
      <span
        className="font-orbitron font-black"
        style={{ color: '#ff4444', textShadow: '0 0 8px #ff4444', fontSize: '1.1rem' }}
      >
        {value}
      </span>
    );
  }
  return (
    <span
      className="font-orbitron font-black"
      style={{ color: '#00d4ff', fontSize: '1.1rem' }}
    >
      {value}
    </span>
  );
}

function RollEntry({ roll, isLatest }) {
  const isCrit   = roll.result === 20;
  const isFumble = roll.result === 1;

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-sm"
      style={{
        background: isLatest
          ? 'rgba(0,212,255,0.07)'
          : isCrit
          ? 'rgba(255,215,0,0.04)'
          : isFumble
          ? 'rgba(255,68,68,0.04)'
          : 'transparent',
        borderLeft: `2px solid ${
          isCrit ? '#ffd700' : isFumble ? '#ff4444' : isLatest ? '#00d4ff' : 'rgba(0,212,255,0.2)'
        }`,
        animation: isLatest ? 'roll-entry 0.35s ease-out' : 'none',
      }}
      data-testid="roll-entry"
    >
      {/* Nombre de usuario */}
      <span
        className="font-rajdhani font-semibold text-base"
        style={{ color: '#a0b4cc', minWidth: '90px' }}
      >
        {roll.username}
      </span>

      {/* Fórmula */}
      <span className="font-mono text-xs" style={{ color: 'rgba(0,212,255,0.4)', flex: 1, textAlign: 'center' }}>
        1d20 =
      </span>

      {/* Resultado */}
      <ResultBadge value={roll.result} />

      {/* Etiqueta especial */}
      {isCrit && (
        <span className="font-mono text-xs ml-3" style={{ color: '#ffd700', opacity: 0.8 }}>
          CRÍTICO
        </span>
      )}
      {isFumble && (
        <span className="font-mono text-xs ml-3" style={{ color: '#ff4444', opacity: 0.8 }}>
          PIFIA
        </span>
      )}
      {!isCrit && !isFumble && <span style={{ width: '56px' }} />}
    </div>
  );
}

export default function RollHistory({ history, currentUser, isAnimating }) {
  // Mientras la animación del dado corre, ocultamos la tirada más reciente
  // del propio usuario para que el resultado no se filtre antes de tiempo.
  const visible = (isAnimating && history.length > 0 && history[history.length - 1].username === currentUser)
    ? history.slice(0, -1)
    : history;

  const reversed = [...visible].reverse();

  return (
    <div className="flex flex-col h-full hud-corners-full glass-panel rounded-sm overflow-hidden">
      {/* Cabecera */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(0,212,255,0.15)' }}
      >
        <h2
          className="font-orbitron text-xs tracking-widest text-glow-cyan"
          style={{ color: '#00d4ff' }}
        >
          REGISTRO GLOBAL
        </h2>
        {/* Indicador HUD de capacidad — 20 segmentos */}
        <div className="flex items-center gap-1">
          <div className="flex gap-px items-end">
            {Array.from({ length: 20 }, (_, i) => {
              const filled = i < visible.length;
              const isLast = filled && i === visible.length - 1;
              return (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    height: filled ? (i < 10 ? '8px' : i < 16 ? '10px' : '13px') : '6px',
                    background: filled ? '#00d4ff' : 'rgba(0,212,255,0.08)',
                    boxShadow: isLast ? '0 0 6px #00d4ff' : filled ? '0 0 3px rgba(0,212,255,0.4)' : 'none',
                    transition: 'all 0.2s ease',
                    borderRadius: '1px',
                  }}
                />
              );
            })}
          </div>
          <span
            className="font-mono ml-1.5"
            style={{ fontSize: '0.6rem', color: 'rgba(0,212,255,0.35)', letterSpacing: '0.05em' }}
          >
            {visible.length}
          </span>
        </div>
      </div>

      {/* Lista — la más reciente arriba */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {reversed.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p
              className="font-mono text-xs text-center"
              style={{ color: 'rgba(0,212,255,0.25)' }}
              data-testid="empty-history"
            >
              Sin tiradas registradas.
              <br />Pulsa el botón para empezar.
            </p>
          </div>
        ) : (
          reversed.map((roll, idx) => (
            <RollEntry
              key={roll.id}
              roll={roll}
              isLatest={idx === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
