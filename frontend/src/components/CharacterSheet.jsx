import { useState, useRef } from 'react';

const PLAYERS = ['Nivare', 'Xalithra', 'Luz-Ya', 'Mireya', 'Kang'];
const INV_SLOTS   = 8;
const SKILL_SLOTS = 5;

function padArr(arr, n) {
  const a = Array.isArray(arr) ? [...arr] : [];
  while (a.length < n) a.push('');
  return a;
}

function ensureChar(raw) {
  return {
    avatar:    raw?.avatar    ?? null,
    nombre:    raw?.nombre    ?? '',
    apellidos: raw?.apellidos ?? '',
    raza:      raw?.raza      ?? '',
    clase:     raw?.clase     ?? '',
    profesion: raw?.profesion ?? '',
    afiliacion:raw?.afiliacion?? '',
    px:        raw?.px        ?? '',
    creditos: {
      enPosesion: raw?.creditos?.enPosesion ?? '',
      enElBanco:  raw?.creditos?.enElBanco  ?? '',
    },
    realesDeAOcho: {
      enPosesion: raw?.realesDeAOcho?.enPosesion ?? '',
      enElBanco:  raw?.realesDeAOcho?.enElBanco  ?? '',
    },
    inventario:          padArr(raw?.inventario, INV_SLOTS),
    habilidadesEspeciales: padArr(raw?.habilidadesEspeciales, SKILL_SLOTS),
  };
}

// ── Estilos compartidos ─────────────────────────────────────────────────────
const LABEL = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '7.5px',
  letterSpacing: '0.12em',
  color: 'rgba(0,212,255,0.5)',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const VALUE = {
  fontFamily: 'Rajdhani, sans-serif',
  fontSize: '13px',
  color: '#e0e8f0',
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const EDIT_INPUT = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(0,212,255,0.4)',
  color: '#e0e8f0',
  fontFamily: 'Rajdhani, sans-serif',
  fontSize: '13px',
  padding: '1px 2px',
  outline: 'none',
  flex: 1,
  minWidth: 0,
  caretColor: '#00d4ff',
  width: '100%',
};

const GLOW_LINE   = { height: '1px', background: 'linear-gradient(to right, rgba(0,212,255,0.35), rgba(0,212,255,0.08), transparent)', marginTop: '3px' };
const GOLD_LINE   = { height: '1px', background: 'linear-gradient(to right, rgba(255,215,0,0.4), rgba(255,215,0,0.08), transparent)', marginTop: '3px' };
const PURPLE_LINE = { height: '1px', background: 'linear-gradient(to right, rgba(124,58,237,0.4), rgba(124,58,237,0.08), transparent)', marginTop: '3px' };

// ── Campos básicos ──────────────────────────────────────────────────────────
const BASIC_FIELDS = [
  { label: 'NOMBRE',    key: 'nombre'    },
  { label: 'APELLIDOS', key: 'apellidos' },
  { label: 'RAZA',      key: 'raza'      },
  { label: 'CLASE',     key: 'clase'     },
  { label: 'PROFESIÓN', key: 'profesion' },
  { label: 'AFILIACIÓN',key: 'afiliacion'},
  { label: 'PX',        key: 'px'        },
];

// ── Decoración de ángulo ────────────────────────────────────────────────────
function Corner({ pos }) {
  const styles = {
    tl: { top: 0, left: 0,    borderTop: '1px solid rgba(0,212,255,0.55)', borderLeft:   '1px solid rgba(0,212,255,0.55)' },
    tr: { top: 0, right: 0,   borderTop: '1px solid rgba(0,212,255,0.55)', borderRight:  '1px solid rgba(0,212,255,0.55)' },
    bl: { bottom: 0, left: 0, borderBottom: '1px solid rgba(0,212,255,0.55)', borderLeft: '1px solid rgba(0,212,255,0.55)' },
    br: { bottom: 0, right: 0,borderBottom: '1px solid rgba(0,212,255,0.55)', borderRight:'1px solid rgba(0,212,255,0.55)' },
  };
  return <div style={{ position: 'absolute', width: '10px', height: '10px', ...styles[pos] }} />;
}

// ── Símbolo circular divisor ─────────────────────────────────────────────────
function DividerCircle({ vertical = false }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      alignItems: 'center',
      gap: 0,
      ...(vertical ? { width: '18px', flexShrink: 0 } : { height: '16px', flex: 1 }),
    }}>
      <div style={{
        ...(vertical
          ? { width: '1px', flex: 1, background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.25))' }
          : { flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.25))' }),
      }} />
      <div style={{
        width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
        border: '1px solid rgba(0,212,255,0.45)',
        boxShadow: '0 0 8px rgba(0,212,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,0.9)' }} />
      </div>
      <div style={{
        ...(vertical
          ? { width: '1px', flex: 1, background: 'linear-gradient(to top, transparent, rgba(0,212,255,0.25))' }
          : { flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.25))' }),
      }} />
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CharacterSheet({ username, isMaster, characters, onUpdate }) {
  const [selectedPlayer, setSelectedPlayer] = useState(isMaster ? PLAYERS[0] : username);
  const [isEditing, setIsEditing]           = useState(false);
  const [draft, setDraft]                   = useState(null);
  const [isDragOver, setIsDragOver]         = useState(false);
  const fileRef = useRef(null);

  const targetUser = isMaster ? selectedPlayer : username;
  const char = ensureChar(characters[targetUser]);
  const data = isEditing ? draft : char;

  // Helpers de actualización del borrador
  const set = (key, val) =>
    setDraft(p => ({ ...p, [key]: val }));
  const setNested = (obj, key, val) =>
    setDraft(p => ({ ...p, [obj]: { ...p[obj], [key]: val } }));
  const setArr = (arrKey, idx, val) =>
    setDraft(p => { const a = [...p[arrKey]]; a[idx] = val; return { ...p, [arrKey]: a }; });

  function startEdit()   { setDraft(JSON.parse(JSON.stringify(char))); setIsEditing(true); }
  function cancelEdit()  { setDraft(null); setIsEditing(false); }
  function confirmEdit() { onUpdate(targetUser, draft); setDraft(null); setIsEditing(false); }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => set('avatar', ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('avatar', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div
      className="glass-panel-bright rounded-sm"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, position: 'relative' }}
    >
      {/* Esquinas HUD externas */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
      </div>

      {/* ── CABECERA ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(0,212,255,0.12)', flexShrink: 0 }}>
        {/* Título con decoración */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.4))' }} />
          <span style={{
            fontFamily: 'Orbitron, monospace', fontSize: '9px',
            letterSpacing: '0.2em', color: '#00d4ff',
            textShadow: '0 0 10px rgba(0,212,255,0.6)',
            whiteSpace: 'nowrap',
          }}>
            FICHA DE PERSONAJE
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.4))' }} />
        </div>

        {/* Selector de jugador (solo Master) */}
        {isMaster ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select
              value={selectedPlayer}
              onChange={e => { setSelectedPlayer(e.target.value); cancelEdit(); }}
              className="cyber-input"
              style={{ flex: 1, fontSize: '10px', padding: '3px 24px 3px 8px', height: '26px' }}
            >
              {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {!isEditing && (
              <button
                className="cyber-btn"
                style={{ fontSize: '7.5px', padding: '3px 8px', flexShrink: 0 }}
                onClick={startEdit}
              >
                EDITAR FICHA
              </button>
            )}
          </div>
        ) : (
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: '8px',
            letterSpacing: '0.15em', color: 'rgba(0,212,255,0.4)',
            textAlign: 'center',
          }}>
            {username.toUpperCase()}
          </div>
        )}
      </div>

      {/* ── CUERPO DESPLAZABLE ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 10px' }}>

        {/* ── PANEL SUPERIOR: Avatar + Campos básicos ───────────────────── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>

          {/* Zona de avatar */}
          <div
            onClick={() => isEditing && fileRef.current?.click()}
            onDrop={isEditing ? handleDrop : undefined}
            onDragOver={isEditing ? e => { e.preventDefault(); setIsDragOver(true); } : undefined}
            onDragLeave={isEditing ? () => setIsDragOver(false) : undefined}
            style={{
              width: '82px', height: '106px', flexShrink: 0,
              border: `1px solid ${isDragOver ? 'rgba(0,212,255,0.9)' : isEditing ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.28)'}`,
              background: isDragOver ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.03)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: isEditing ? 'pointer' : 'default',
              transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              position: 'relative', overflow: 'hidden',
              boxShadow: isEditing ? '0 0 14px rgba(0,212,255,0.15), inset 0 0 14px rgba(0,212,255,0.05)' : 'none',
            }}
          >
            {/* Esquinas del avatar */}
            {['tl','tr','bl','br'].map(p => <Corner key={p} pos={p} />)}

            {data?.avatar ? (
              <>
                <img
                  src={data.avatar}
                  alt="Avatar"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isEditing && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '4px',
                  }}>
                    <span style={{ fontSize: '16px', color: '#00d4ff' }}>⇪</span>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '6px', color: '#00d4ff', letterSpacing: '0.1em' }}>
                      {isDragOver ? 'SOLTAR' : 'CAMBIAR'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <span style={{ fontSize: '26px', color: 'rgba(0,212,255,0.2)', textShadow: '0 0 18px rgba(0,212,255,0.3)', lineHeight: 1, zIndex: 1 }}>
                  ?
                </span>
                <span style={{
                  fontFamily: 'Orbitron, monospace', fontSize: '5.5px',
                  letterSpacing: '0.1em', color: 'rgba(0,212,255,0.3)',
                  marginTop: '8px', zIndex: 1, textAlign: 'center', lineHeight: 1.5,
                }}>
                  {isEditing ? (isDragOver ? 'SOLTAR\nAQUÍ' : 'ARRASTRAR\nO CLICK') : 'EN\nESPERA'}
                </span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

          {/* Campos básicos */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {BASIC_FIELDS.map(({ label, key }) => (
              <div key={key} style={{ marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ ...LABEL, minWidth: '66px' }}>{label}</span>
                  {isEditing
                    ? <input
                        type="text"
                        value={data?.[key] ?? ''}
                        onChange={e => set(key, e.target.value)}
                        style={EDIT_INPUT}
                      />
                    : <span style={VALUE}>{data?.[key] || '—'}</span>
                  }
                </div>
                {!isEditing && <div style={GLOW_LINE} />}
              </div>
            ))}
          </div>
        </div>

        {/* Separador decorativo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.2))' }} />
          <DividerCircle />
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.2))' }} />
        </div>

        {/* ── PANEL ECONÓMICO: 4 recuadros simétricos apaisados ────────── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>

          {/* ── CRÉDITOS ── */}
          <div
            className="glass-panel rounded-sm"
            style={{
              flex: 1, padding: '10px',
              borderColor: 'rgba(255,215,0,0.28)',
              boxShadow: '0 0 18px rgba(255,215,0,0.05), inset 0 0 12px rgba(255,215,0,0.03)',
            }}
          >
            {/* Header con línea inferior dorada */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              marginBottom: '9px', paddingBottom: '6px',
              borderBottom: '1px solid rgba(255,215,0,0.2)',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.3))' }} />
              <span style={{
                fontFamily: 'Orbitron, monospace', fontSize: '7px', letterSpacing: '0.2em',
                color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.5)',
                whiteSpace: 'nowrap',
              }}>
                CRÉDITOS
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.3))' }} />
            </div>

            {/* Sub-campos en fila */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {/* EN POSESIÓN */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6px', color: 'rgba(255,215,0,0.45)' }}>
                  EN POSESIÓN
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={data?.creditos?.enPosesion ?? ''}
                    onChange={e => setNested('creditos', 'enPosesion', e.target.value)}
                    style={{ ...EDIT_INPUT, flex: 'none', fontSize: '13px', borderBottomColor: 'rgba(255,215,0,0.4)' }}
                  />
                ) : (
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '15px', fontWeight: 700,
                    color: '#ffe566', textShadow: '0 0 8px rgba(255,215,0,0.35)',
                    letterSpacing: '0.03em',
                  }}>
                    {data?.creditos?.enPosesion || '—'}
                  </div>
                )}
                <div style={GOLD_LINE} />
              </div>

              {/* Divisor vertical sutil */}
              <div style={{ width: '1px', background: 'rgba(255,215,0,0.15)', flexShrink: 0 }} />

              {/* EN EL BANCO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6px', color: 'rgba(255,215,0,0.45)' }}>
                  EN EL BANCO
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={data?.creditos?.enElBanco ?? ''}
                    onChange={e => setNested('creditos', 'enElBanco', e.target.value)}
                    style={{ ...EDIT_INPUT, flex: 'none', fontSize: '13px', borderBottomColor: 'rgba(255,215,0,0.4)' }}
                  />
                ) : (
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '15px', fontWeight: 700,
                    color: '#ffe566', textShadow: '0 0 8px rgba(255,215,0,0.35)',
                    letterSpacing: '0.03em',
                  }}>
                    {data?.creditos?.enElBanco || '—'}
                  </div>
                )}
                <div style={GOLD_LINE} />
              </div>
            </div>
          </div>

          {/* Separador central con círculo */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '3px', width: '16px', flexShrink: 0,
          }}>
            <div style={{ width: '1px', flex: 1, background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.2))' }} />
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
              border: '1px solid rgba(0,212,255,0.4)',
              boxShadow: '0 0 6px rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 5px rgba(0,212,255,0.9)' }} />
            </div>
            <div style={{ width: '1px', flex: 1, background: 'linear-gradient(to top, transparent, rgba(0,212,255,0.2))' }} />
          </div>

          {/* ── REALES DE A OCHO ── */}
          <div
            className="glass-panel rounded-sm"
            style={{
              flex: 1, padding: '10px',
              borderColor: 'rgba(124,58,237,0.28)',
              boxShadow: '0 0 18px rgba(124,58,237,0.05), inset 0 0 12px rgba(124,58,237,0.03)',
            }}
          >
            {/* Header con línea inferior púrpura */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              marginBottom: '9px', paddingBottom: '6px',
              borderBottom: '1px solid rgba(124,58,237,0.2)',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.35))' }} />
              <span style={{
                fontFamily: 'Orbitron, monospace', fontSize: '6px', letterSpacing: '0.15em',
                color: 'rgba(190,150,255,0.95)', textShadow: '0 0 10px rgba(124,58,237,0.6)',
                whiteSpace: 'nowrap',
              }}>
                REALES DE A OCHO
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(124,58,237,0.35))' }} />
            </div>

            {/* Sub-campos en fila */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {/* EN POSESIÓN */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6px', color: 'rgba(190,150,255,0.45)' }}>
                  EN POSESIÓN
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={data?.realesDeAOcho?.enPosesion ?? ''}
                    onChange={e => setNested('realesDeAOcho', 'enPosesion', e.target.value)}
                    style={{ ...EDIT_INPUT, flex: 'none', fontSize: '13px', borderBottomColor: 'rgba(124,58,237,0.4)' }}
                  />
                ) : (
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '15px', fontWeight: 700,
                    color: 'rgba(200,165,255,0.95)', textShadow: '0 0 8px rgba(124,58,237,0.4)',
                    letterSpacing: '0.03em',
                  }}>
                    {data?.realesDeAOcho?.enPosesion || '—'}
                  </div>
                )}
                <div style={PURPLE_LINE} />
              </div>

              {/* Divisor vertical sutil */}
              <div style={{ width: '1px', background: 'rgba(124,58,237,0.15)', flexShrink: 0 }} />

              {/* EN EL BANCO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6px', color: 'rgba(190,150,255,0.45)' }}>
                  EN EL BANCO
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={data?.realesDeAOcho?.enElBanco ?? ''}
                    onChange={e => setNested('realesDeAOcho', 'enElBanco', e.target.value)}
                    style={{ ...EDIT_INPUT, flex: 'none', fontSize: '13px', borderBottomColor: 'rgba(124,58,237,0.4)' }}
                  />
                ) : (
                  <div style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '15px', fontWeight: 700,
                    color: 'rgba(200,165,255,0.95)', textShadow: '0 0 8px rgba(124,58,237,0.4)',
                    letterSpacing: '0.03em',
                  }}>
                    {data?.realesDeAOcho?.enElBanco || '—'}
                  </div>
                )}
                <div style={PURPLE_LINE} />
              </div>
            </div>
          </div>
        </div>

        {/* ── PANEL INFERIOR: Inventario | Habilidades ──────────────────── */}
        <div style={{ display: 'flex', gap: '6px' }}>

          {/* Inventario */}
          <div className="glass-panel rounded-sm" style={{ flex: 1, padding: '8px' }}>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '7px', letterSpacing: '0.15em',
              color: 'rgba(0,212,255,0.6)', textAlign: 'center', marginBottom: '8px',
            }}>
              INVENTARIO
            </div>
            {(data?.inventario ?? Array(INV_SLOTS).fill('')).map((item, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={item}
                    onChange={e => setArr('inventario', i, e.target.value)}
                    placeholder="···"
                    style={{
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid rgba(0,212,255,0.25)',
                      color: '#e0e8f0', fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '10px', padding: '1px 2px', outline: 'none',
                      width: '100%', caretColor: '#00d4ff',
                    }}
                  />
                ) : (
                  <div style={{
                    fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
                    color: item ? '#c8d4e0' : 'rgba(0,212,255,0.1)',
                    paddingBottom: '3px',
                    borderBottom: '1px solid rgba(0,212,255,0.1)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '0.03em',
                  }}>
                    {item || '···'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Habilidades especiales */}
          <div className="glass-panel rounded-sm" style={{ flex: 1, padding: '8px' }}>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '7px', letterSpacing: '0.12em',
              color: 'rgba(0,255,136,0.7)', textShadow: '0 0 6px rgba(0,255,136,0.3)',
              textAlign: 'center', marginBottom: '8px', lineHeight: 1.4,
            }}>
              HABILIDADES<br/>ESPECIALES
            </div>
            {(data?.habilidadesEspeciales ?? Array(SKILL_SLOTS).fill('')).map((skill, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '7px' }}>
                {/* Bullet luminoso */}
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                  border: `1px solid ${skill ? 'rgba(0,255,136,0.7)' : 'rgba(0,212,255,0.2)'}`,
                  background: skill ? 'rgba(0,255,136,0.35)' : 'transparent',
                  boxShadow: skill ? '0 0 6px rgba(0,255,136,0.45)' : 'none',
                  transition: 'all 0.3s',
                }} />
                {isEditing ? (
                  <input
                    type="text"
                    value={skill}
                    onChange={e => setArr('habilidadesEspeciales', i, e.target.value)}
                    placeholder="—"
                    style={{
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid rgba(0,212,255,0.25)',
                      color: '#e0e8f0', fontFamily: 'Rajdhani, sans-serif',
                      fontSize: '11px', padding: '1px 2px', outline: 'none',
                      flex: 1, caretColor: '#00d4ff',
                    }}
                  />
                ) : (
                  <span style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '11px',
                    color: skill ? '#c8d4e0' : 'rgba(0,212,255,0.18)',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {skill || '—'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Controles de edición (solo Master en modo editar) ─────────── */}
        {isMaster && isEditing && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
            <button
              className="cyber-btn"
              style={{ flex: 1, fontSize: '8px', padding: '6px 4px', borderColor: 'rgba(0,255,136,0.5)', color: 'rgba(0,255,136,0.85)' }}
              onClick={confirmEdit}
            >
              CONFIRMAR
            </button>
            <button
              className="cyber-btn"
              style={{ flex: 1, fontSize: '8px', padding: '6px 4px', borderColor: 'rgba(255,68,68,0.4)', color: 'rgba(255,68,68,0.75)' }}
              onClick={cancelEdit}
            >
              CANCELAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
