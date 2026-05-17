// Panel exclusivo del Master para gestionar los Puntos de Fuerza de los jugadores

function ForceDots({ count }) {
  const shown = Math.min(count, 6);
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: i < shown ? '#00ff88' : 'rgba(0,255,136,0.12)',
            boxShadow: i < shown ? '0 0 4px #00ff88' : 'none',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

export default function ForcePanel({ connectedUsers, forcePowers, onAddForce }) {
  const players = connectedUsers.filter(u => u !== 'Master');

  return (
    <div
      className="hud-corners-full rounded-sm p-4"
      style={{
        background: 'rgba(0,255,136,0.03)',
        border: '1px solid rgba(0,255,136,0.2)',
      }}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: '#00ff88', boxShadow: '0 0 5px #00ff88' }}
        />
        <span className="font-orbitron text-xs tracking-widest" style={{ color: 'rgba(0,255,136,0.8)' }}>
          PUNTOS DE FUERZA
        </span>
      </div>

      {players.length === 0 ? (
        <p className="font-mono text-xs text-center" style={{ color: 'rgba(0,255,136,0.25)' }}>
          Sin jugadores conectados
        </p>
      ) : (
        <div className="space-y-2">
          {players.map((player) => {
            const pts = forcePowers[player] ?? 0;
            return (
              <div
                key={player}
                className="flex items-center justify-between px-3 py-2 rounded-sm"
                style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)' }}
              >
                {/* Nombre */}
                <span
                  className="font-rajdhani font-semibold text-sm"
                  style={{ color: '#a0b4cc', minWidth: '80px' }}
                >
                  {player}
                </span>

                {/* Dots + número */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <ForceDots count={pts} />
                  <span
                    className="font-orbitron font-black text-sm"
                    style={{ color: pts > 0 ? '#00ff88' : 'rgba(0,255,136,0.3)', minWidth: '16px', textAlign: 'right' }}
                  >
                    {pts}
                  </span>
                </div>

                {/* Botón añadir */}
                <button
                  onClick={() => onAddForce(player)}
                  className="font-orbitron text-xs px-2 py-1 rounded-sm transition-all"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    border: '1px solid rgba(0,255,136,0.4)',
                    color: '#00ff88',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,136,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  data-testid={`add-force-${player}`}
                >
                  + FUERZA
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
