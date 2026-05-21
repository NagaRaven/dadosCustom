import { useState } from 'react';

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

const INPUT = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(var(--cyan-rgb),0.35)',
  color: '#e0e8f0',
  fontFamily: 'Rajdhani,sans-serif',
  fontSize: '11px',
  padding: '2px 4px',
  outline: 'none',
  caretColor: 'var(--cyan)',
  flex: 1,
  minWidth: 0,
  width: '100%',
};

const SMALL_BTN = {
  flex: 1,
  background: 'transparent',
  border: '1px solid',
  fontFamily: 'Orbitron,monospace',
  fontSize: '7px',
  padding: '2px 4px',
  cursor: 'pointer',
  borderRadius: '1px',
};

export default function ForcePanel({ connectedUsers, forcePowers, onAddForce, fortalezasCatalog = [], onUpdateCatalog }) {
  const players = connectedUsers.filter(u => u !== 'Master');

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [newNombre, setNewNombre]     = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [editingIdx, setEditingIdx]   = useState(null);
  const [editNombre, setEditNombre]   = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [hoverIdx, setHoverIdx]       = useState(null);

  const sortCatalog = (arr) => [...arr].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  function addEntry() {
    if (!newNombre.trim()) return;
    onUpdateCatalog(sortCatalog([...fortalezasCatalog, { nombre: newNombre.trim(), descripcion: newDesc.trim() }]));
    setNewNombre(''); setNewDesc('');
  }

  function confirmEdit(i) {
    if (!editNombre.trim()) return;
    const updated = [...fortalezasCatalog];
    updated[i] = { nombre: editNombre.trim(), descripcion: editDesc.trim() };
    onUpdateCatalog(sortCatalog(updated));
    setEditingIdx(null);
  }

  return (
    <>
      {/* ── Puntos de Fuerza ──────────────────────────────────────────────── */}
      <div
        className="hud-corners-full rounded-sm p-4"
        style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.2)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#00ff88', boxShadow:'0 0 5px #00ff88', flexShrink:0 }} />
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
                <div key={player} className="flex items-center justify-between px-3 py-2 rounded-sm"
                  style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)' }}>
                  <span className="font-rajdhani font-semibold text-sm" style={{ color: '#a0b4cc', minWidth: '80px' }}>{player}</span>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <ForceDots count={pts} />
                    <span className="font-orbitron font-black text-sm"
                      style={{ color: pts > 0 ? '#00ff88' : 'rgba(0,255,136,0.3)', minWidth: '16px', textAlign: 'right' }}>
                      {pts}
                    </span>
                  </div>
                  <button onClick={() => onAddForce(player)}
                    className="font-orbitron text-xs px-2 py-1 rounded-sm transition-all"
                    style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.4)', color: '#00ff88', cursor: 'pointer', letterSpacing: '0.05em' }}
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

      {/* ── Catálogo de Fortalezas (plegable) ────────────────────────────── */}
      <div style={{ border: '1px solid rgba(var(--cyan-rgb),0.18)', borderRadius: '2px', overflow: 'hidden' }}>
        <button
          onClick={() => setCatalogOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 10px', background: 'rgba(var(--cyan-rgb),0.04)',
            border: 'none', cursor: 'pointer',
          }}
        >
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(var(--cyan-rgb),0.5)', boxShadow: '0 0 4px rgba(var(--cyan-rgb),0.4)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '6.5px', letterSpacing: '0.12em', color: 'rgba(var(--cyan-rgb),0.65)', flex: 1, textAlign: 'left' }}>
            CATÁLOGO DE FORTALEZAS
          </span>
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '7px', color: 'rgba(var(--cyan-rgb),0.4)' }}>{catalogOpen ? '▲' : '▼'}</span>
        </button>

        {catalogOpen && (
          <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(var(--cyan-rgb),0.1)' }}>

            {/* Formulario nueva fortaleza */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '6px', letterSpacing: '0.1em', color: 'rgba(var(--cyan-rgb),0.4)', marginBottom: '5px' }}>NUEVA FORTALEZA</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                <input
                  value={newNombre}
                  onChange={e => setNewNombre(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addEntry(); } }}
                  placeholder="Nombre..."
                  style={INPUT}
                />
                <button
                  onClick={addEntry}
                  style={{ background: 'rgba(var(--cyan-rgb),0.1)', border: '1px solid rgba(var(--cyan-rgb),0.4)', color: 'var(--cyan)', fontFamily: 'Orbitron,monospace', fontSize: '10px', padding: '0 8px', cursor: 'pointer', flexShrink: 0, borderRadius: '1px' }}
                >+</button>
              </div>
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Descripción (opcional)..."
                style={{ ...INPUT, fontSize: '10px', color: 'rgba(200,215,230,0.7)' }}
              />
            </div>

            {/* Lista de fortalezas */}
            <div style={{ borderTop: '1px solid rgba(var(--cyan-rgb),0.08)', paddingTop: '6px' }}>
              {fortalezasCatalog.length === 0 && (
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '10px', color: 'rgba(var(--cyan-rgb),0.25)', textAlign: 'center', padding: '4px 0' }}>Sin fortalezas definidas</div>
              )}
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {fortalezasCatalog.map((f, i) => (
                  editingIdx === i ? (
                    <div key={i} style={{ marginBottom: '4px', padding: '4px 6px', background: 'rgba(var(--cyan-rgb),0.05)', border: '1px solid rgba(var(--cyan-rgb),0.15)', borderRadius: '2px' }}>
                      <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre..." style={{ ...INPUT, marginBottom: '3px' }} />
                      <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descripción..." style={{ ...INPUT, fontSize: '10px', marginBottom: '4px' }} />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => confirmEdit(i)} style={{ ...SMALL_BTN, color: 'rgba(0,255,136,0.7)', borderColor: 'rgba(0,255,136,0.4)' }}>✓ GUARDAR</button>
                        <button onClick={() => setEditingIdx(null)} style={{ ...SMALL_BTN, color: 'rgba(255,68,68,0.6)', borderColor: 'rgba(255,68,68,0.3)' }}>✕ CANCELAR</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 2px', borderBottom: '1px solid rgba(var(--cyan-rgb),0.06)', cursor: f.descripcion ? 'help' : 'default' }}
                      onMouseEnter={() => f.descripcion && setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    >
                      <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '11px', color: '#c8d4e0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.nombre}</span>
                      {f.descripcion && <span style={{ fontSize: '7px', color: 'rgba(var(--cyan-rgb),0.3)', flexShrink: 0 }}>···</span>}
                      <button
                        onClick={() => { setEditingIdx(i); setEditNombre(f.nombre); setEditDesc(f.descripcion || ''); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(var(--cyan-rgb),0.5)', fontSize: '10px', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                        title="Editar"
                      >✎</button>
                      <button
                        onClick={() => { setHoverIdx(null); onUpdateCatalog(fortalezasCatalog.filter((_, j) => j !== i)); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,68,68,0.5)', fontSize: '12px', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                        title="Eliminar"
                      >×</button>
                    </div>
                  )
                ))}
              </div>

              {/* Descripción al hover */}
              {hoverIdx !== null && fortalezasCatalog[hoverIdx]?.descripcion && (
                <div style={{ marginTop: '5px', padding: '5px 7px', background: 'rgba(7,9,15,0.92)', border: '1px solid rgba(var(--cyan-rgb),0.2)', borderRadius: '2px', fontFamily: 'Rajdhani,sans-serif', fontSize: '10px', color: 'rgba(195,215,235,0.85)', lineHeight: 1.45 }}>
                  {fortalezasCatalog[hoverIdx].descripcion}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
