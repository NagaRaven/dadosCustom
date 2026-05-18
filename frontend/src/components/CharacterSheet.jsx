import { useState, useRef } from 'react';

const PLAYERS = ['Nivare', 'Xalithra', 'Luz-Ya', 'Mireya', 'Kang'];

// ── Migración y normalización de datos ──────────────────────────────────────
function ensureItem(v) {
  if (!v) return { nombre: '', descripcion: '' };
  if (typeof v === 'string') return { nombre: v, descripcion: '' };
  return { nombre: v.nombre ?? '', descripcion: v.descripcion ?? '' };
}

function ensureChar(raw) {
  return {
    avatar:     raw?.avatar     ?? null,
    nombre:     raw?.nombre     ?? '',
    apellidos:  raw?.apellidos  ?? '',
    raza:       raw?.raza       ?? '',
    clase:      raw?.clase      ?? '',
    profesion:  raw?.profesion  ?? '',
    afiliacion: raw?.afiliacion ?? '',
    px:         raw?.px         ?? '',
    creditos: {
      enPosesion: raw?.creditos?.enPosesion ?? '',
      enElBanco:  raw?.creditos?.enElBanco  ?? '',
    },
    realesDeAOcho: {
      enPosesion: raw?.realesDeAOcho?.enPosesion ?? '',
      enElBanco:  raw?.realesDeAOcho?.enElBanco  ?? '',
    },
    inventario:           Array.isArray(raw?.inventario)           ? raw.inventario.map(ensureItem)           : [],
    habilidadesEspeciales: Array.isArray(raw?.habilidadesEspeciales) ? raw.habilidadesEspeciales.map(ensureItem) : [],
  };
}

// ── Estilos compartidos ──────────────────────────────────────────────────────
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

const BASIC_FIELDS = [
  { label: 'NOMBRE',     key: 'nombre'     },
  { label: 'APELLIDOS',  key: 'apellidos'  },
  { label: 'RAZA',       key: 'raza'       },
  { label: 'CLASE',      key: 'clase'      },
  { label: 'PROFESIÓN',  key: 'profesion'  },
  { label: 'AFILIACIÓN', key: 'afiliacion' },
  { label: 'PX',         key: 'px'         },
];

// ── Esquina decorativa ──────────────────────────────────────────────────────
function Corner({ pos }) {
  const map = {
    tl: { top: 0,    left: 0,   borderTop:    '1px solid rgba(0,212,255,0.55)', borderLeft:   '1px solid rgba(0,212,255,0.55)' },
    tr: { top: 0,    right: 0,  borderTop:    '1px solid rgba(0,212,255,0.55)', borderRight:  '1px solid rgba(0,212,255,0.55)' },
    bl: { bottom: 0, left: 0,   borderBottom: '1px solid rgba(0,212,255,0.55)', borderLeft:   '1px solid rgba(0,212,255,0.55)' },
    br: { bottom: 0, right: 0,  borderBottom: '1px solid rgba(0,212,255,0.55)', borderRight:  '1px solid rgba(0,212,255,0.55)' },
  };
  return <div style={{ position: 'absolute', width: '10px', height: '10px', ...map[pos] }} />;
}

// ── Separador decorativo simple (entre panel superior y panel económico) ─────
function DividerCircle() {
  return (
    <div style={{
      width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
      border: '1px solid rgba(0,212,255,0.45)',
      boxShadow: '0 0 8px rgba(0,212,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,0.9)' }} />
    </div>
  );
}

// ── Divisor de energía animado (entre Créditos y Reales) ─────────────────────
function EnergyDivider() {
  return (
    <div style={{
      width: '32px', flexShrink: 0,
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Línea vertical pulsante */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%',
        width: '1px', marginLeft: '-0.5px',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,212,255,0.55) 30%, rgba(0,212,255,0.35) 70%, transparent 100%)',
        animation: 'energy-line-pulse 2s ease-in-out infinite',
      }} />

      {/* Tick superior con punto */}
      <div style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '1px', background: 'rgba(0,212,255,0.35)' }} />
      <div style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(0,212,255,0.6)', boxShadow: '0 0 5px rgba(0,212,255,0.5)' }} />

      {/* Tick inferior con punto */}
      <div style={{ position: 'absolute', bottom: '16%', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '1px', background: 'rgba(0,212,255,0.35)' }} />
      <div style={{ position: 'absolute', bottom: '16%', left: '50%', transform: 'translate(-50%, 50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(0,212,255,0.6)', boxShadow: '0 0 5px rgba(0,212,255,0.5)' }} />

      {/* Grupo central: diamante externo + diamante rotante + punto */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '26px', height: '26px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Anillo externo estático (rotado 45° = diamante) */}
        <div style={{
          position: 'absolute',
          width: '22px', height: '22px',
          border: '1px solid rgba(0,212,255,0.18)',
          transform: 'rotate(45deg)',
        }} />
        {/* Diamante interior rotante */}
        <div style={{
          position: 'absolute',
          width: '14px', height: '14px',
          border: '1px solid rgba(0,212,255,0.65)',
          background: 'rgba(0,212,255,0.06)',
          animation: 'rune-rotate 3.5s linear infinite',
          animationName: 'rune-rotate',
        }} />
        {/* Segundo anillo contra-rotante, más pequeño */}
        <div style={{
          position: 'absolute',
          width: '8px', height: '8px',
          border: '1px solid rgba(0,212,255,0.4)',
          animation: 'rune-counter 2.5s linear infinite',
          transform: 'rotate(45deg)',
        }} />
        {/* Punto central luminoso */}
        <div style={{
          position: 'absolute',
          width: '4px', height: '4px', borderRadius: '50%',
          background: '#00d4ff',
          boxShadow: '0 0 10px rgba(0,212,255,1), 0 0 20px rgba(0,212,255,0.6)',
          animation: 'rune-glow-pulse 2s ease-in-out infinite',
        }} />
      </div>

      {/* Partícula que baja */}
      <div style={{
        position: 'absolute', left: '50%',
        transform: 'translateX(-50%)',
        width: '2px', height: '14px',
        borderRadius: '1px',
        background: 'linear-gradient(to bottom, transparent, #00d4ff 50%, transparent)',
        boxShadow: '0 0 5px rgba(0,212,255,0.7)',
        animation: 'energy-flow-down 2s ease-in-out infinite',
      }} />

      {/* Partícula que sube (desfasada) */}
      <div style={{
        position: 'absolute', left: '50%',
        transform: 'translateX(-50%)',
        width: '2px', height: '9px',
        borderRadius: '1px',
        background: 'linear-gradient(to top, transparent, rgba(0,212,255,0.85) 50%, transparent)',
        boxShadow: '0 0 4px rgba(0,212,255,0.6)',
        animation: 'energy-flow-up 2.5s ease-in-out 1.1s infinite',
      }} />
    </div>
  );
}

// ── Tooltip de descripción (descripción flotante dentro del panel) ────────────
function DescriptionPane({ text, accentColor = 'rgba(0,212,255,0.35)' }) {
  if (!text) return null;
  return (
    <div style={{
      marginTop: '6px', padding: '7px 10px',
      background: 'rgba(0,212,255,0.04)',
      border: `1px solid ${accentColor}`,
      borderRadius: '2px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Línea de acento izquierda */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '2px', background: accentColor }} />
      <p style={{
        margin: 0, paddingLeft: '6px',
        fontFamily: 'Rajdhani, sans-serif', fontSize: '11px',
        color: 'rgba(190,210,230,0.85)', lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
      }}>
        {text}
      </p>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function CharacterSheet({ username, isMaster, characters, onUpdate }) {
  const [selectedPlayer, setSelectedPlayer] = useState(isMaster ? PLAYERS[0] : username);
  const [isEditing, setIsEditing]           = useState(false);
  const [draft, setDraft]                   = useState(null);
  const [isDragOver, setIsDragOver]         = useState(false);
  const [hoveredInv, setHoveredInv]         = useState(null); // item object
  const [hoveredSkill, setHoveredSkill]     = useState(null); // item object
  const fileRef = useRef(null);

  const targetUser = isMaster ? selectedPlayer : username;
  const char = ensureChar(characters[targetUser]);
  const data = isEditing ? draft : char;

  // ── Helpers de estado ─────────────────────────────────────────────────────
  const set = (key, val) =>
    setDraft(p => ({ ...p, [key]: val }));

  const setNested = (obj, key, val) =>
    setDraft(p => ({ ...p, [obj]: { ...p[obj], [key]: val } }));

  const setItemField = (arrKey, idx, field, val) =>
    setDraft(p => {
      const a = [...p[arrKey]];
      a[idx] = { ...a[idx], [field]: val };
      return { ...p, [arrKey]: a };
    });

  const addItem = (arrKey) =>
    setDraft(p => ({ ...p, [arrKey]: [...p[arrKey], { nombre: '', descripcion: '' }] }));

  const removeItem = (arrKey, idx) =>
    setDraft(p => ({ ...p, [arrKey]: p[arrKey].filter((_, i) => i !== idx) }));

  function startEdit()   { setDraft(JSON.parse(JSON.stringify(char))); setIsEditing(true); }
  function cancelEdit()  { setDraft(null); setIsEditing(false); }
  function confirmEdit() { onUpdate(targetUser, draft); setDraft(null); setIsEditing(false); }

  // ── Avatar drag & drop ────────────────────────────────────────────────────
  function handleDrop(e) {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => set('avatar', ev.target.result);
    reader.readAsDataURL(file);
  }
  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('avatar', ev.target.result);
    reader.readAsDataURL(file); e.target.value = '';
  }

  // ── Secciones de items (inventario / habilidades) ─────────────────────────
  function renderItemSection({ arrKey, label, accentColor, lineStyle, bulletColor, emptyText }) {
    const items = data?.[arrKey] ?? [];
    const readItems = items.filter(it => it.nombre);

    return (
      <div className="glass-panel rounded-sm" style={{ flex: 1, padding: '10px', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          fontFamily: 'Orbitron, monospace', fontSize: '7px', letterSpacing: '0.15em',
          color: accentColor, textAlign: 'center', marginBottom: '8px',
          borderBottom: `1px solid ${accentColor}22`, paddingBottom: '6px',
        }}>
          {label}
        </div>

        {/* ── MODO LECTURA ── */}
        {!isEditing && (
          <>
            {readItems.length === 0 && (
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '11px', color: 'rgba(0,212,255,0.2)', textAlign: 'center', padding: '8px 0' }}>
                {emptyText}
              </div>
            )}
            {readItems.map((item, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', cursor: item.descripcion ? 'help' : 'default', padding: '2px 0' }}
                onMouseEnter={() => { if (arrKey === 'inventario') setHoveredInv(item.descripcion ? item : null); else setHoveredSkill(item.descripcion ? item : null); }}
                onMouseLeave={() => { if (arrKey === 'inventario') setHoveredInv(null); else setHoveredSkill(null); }}
              >
                {/* Bullet */}
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                  border: `1px solid ${bulletColor}`,
                  background: `${bulletColor}55`,
                  boxShadow: `0 0 5px ${bulletColor}66`,
                }} />
                <span style={{
                  fontFamily: arrKey === 'inventario' ? 'Share Tech Mono, monospace' : 'Rajdhani, sans-serif',
                  fontSize: '11px', color: '#c8d4e0',
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.nombre}
                </span>
                {item.descripcion && (
                  <span style={{ fontSize: '8px', color: 'rgba(0,212,255,0.35)', flexShrink: 0, letterSpacing: '0.05em' }}>···</span>
                )}
              </div>
            ))}
            {/* Panel de descripción en hover */}
            <DescriptionPane
              text={arrKey === 'inventario' ? hoveredInv?.descripcion : hoveredSkill?.descripcion}
              accentColor={lineStyle.background.match(/rgba\([^)]+\)/)?.[0] || 'rgba(0,212,255,0.35)'}
            />
          </>
        )}

        {/* ── MODO EDICIÓN ── */}
        {isEditing && (
          <>
            {items.map((item, i) => (
              <div key={i} style={{ marginBottom: '8px', padding: '6px 8px', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '2px' }}>
                {/* Fila nombre + botón eliminar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                    border: `1px solid ${bulletColor}`, background: `${bulletColor}44`,
                  }} />
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={e => setItemField(arrKey, i, 'nombre', e.target.value)}
                    placeholder="Nombre..."
                    style={{ ...EDIT_INPUT, fontSize: '12px', fontWeight: 600 }}
                  />
                  <button
                    onClick={() => removeItem(arrKey, i)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,68,68,0.6)', fontSize: '14px', padding: '0 2px',
                      lineHeight: 1, flexShrink: 0,
                    }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
                {/* Descripción */}
                <textarea
                  value={item.descripcion}
                  onChange={e => setItemField(arrKey, i, 'descripcion', e.target.value)}
                  placeholder="Descripción (visible al pasar el ratón)..."
                  rows={2}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(0,212,255,0.18)',
                    color: 'rgba(200,215,230,0.8)',
                    fontFamily: 'Rajdhani, sans-serif', fontSize: '11px',
                    padding: '4px 6px', outline: 'none',
                    width: '100%', resize: 'vertical',
                    caretColor: '#00d4ff', lineHeight: 1.4,
                    borderRadius: '1px',
                  }}
                />
              </div>
            ))}
            {/* Botón + */}
            <button
              className="cyber-btn"
              onClick={() => addItem(arrKey)}
              style={{
                width: '100%', fontSize: '7.5px', padding: '5px',
                borderColor: `${accentColor}88`, color: accentColor,
                marginTop: items.length > 0 ? '4px' : 0,
              }}
            >
              + AÑADIR
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="glass-panel-bright rounded-sm"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, position: 'relative' }}
    >
      {/* Esquinas HUD */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
      </div>

      {/* ── CABECERA ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(0,212,255,0.12)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.4))' }} />
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', letterSpacing: '0.22em', color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.6)', whiteSpace: 'nowrap' }}>
            FICHA DE PERSONAJE
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.4))' }} />
        </div>

        {isMaster ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select
              value={selectedPlayer}
              onChange={e => { setSelectedPlayer(e.target.value); cancelEdit(); }}
              className="cyber-input"
              style={{ flex: 1, fontSize: '10px', padding: '3px 28px 3px 10px', height: '28px' }}
            >
              {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {!isEditing && (
              <button className="cyber-btn" style={{ fontSize: '7.5px', padding: '4px 10px', flexShrink: 0 }} onClick={startEdit}>
                EDITAR FICHA
              </button>
            )}
          </div>
        ) : (
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.4)', textAlign: 'center' }}>
            {username.toUpperCase()}
          </div>
        )}
      </div>

      {/* ── CUERPO DESPLAZABLE ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 12px' }}>

        {/* ── PANEL SUPERIOR: Avatar + Campos básicos ───────────────────── */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>

          {/* Zona de avatar */}
          <div
            onClick={() => isEditing && fileRef.current?.click()}
            onDrop={isEditing ? handleDrop : undefined}
            onDragOver={isEditing ? e => { e.preventDefault(); setIsDragOver(true); } : undefined}
            onDragLeave={isEditing ? () => setIsDragOver(false) : undefined}
            style={{
              width: '100px', height: '130px', flexShrink: 0,
              border: `1px solid ${isDragOver ? 'rgba(0,212,255,0.9)' : isEditing ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.28)'}`,
              background: isDragOver ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.03)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: isEditing ? 'pointer' : 'default',
              transition: 'all 0.2s',
              position: 'relative', overflow: 'hidden',
              boxShadow: isEditing ? '0 0 16px rgba(0,212,255,0.15)' : 'none',
            }}
          >
            {['tl','tr','bl','br'].map(p => <Corner key={p} pos={p} />)}

            {data?.avatar ? (
              <>
                <img src={data.avatar} alt="Avatar" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                {isEditing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '18px', color: '#00d4ff' }}>⇪</span>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '7px', color: '#00d4ff', letterSpacing: '0.1em' }}>
                      {isDragOver ? 'SOLTAR' : 'CAMBIAR'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <span style={{ fontSize: '32px', color: 'rgba(0,212,255,0.18)', textShadow: '0 0 20px rgba(0,212,255,0.3)', lineHeight: 1, zIndex: 1 }}>?</span>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '6px', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.28)', marginTop: '10px', zIndex: 1, textAlign: 'center', lineHeight: 1.6 }}>
                  {isEditing ? (isDragOver ? 'SOLTAR\nAQUÍ' : 'ARRASTRAR\nO CLICK') : 'EN\nESPERA'}
                </span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

          {/* Campos básicos */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {BASIC_FIELDS.map(({ label, key }) => (
              <div key={key} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ ...LABEL, minWidth: '72px' }}>{label}</span>
                  {isEditing
                    ? <input type="text" value={data?.[key] ?? ''} onChange={e => set(key, e.target.value)} style={EDIT_INPUT} />
                    : <span style={VALUE}>{data?.[key] || '—'}</span>
                  }
                </div>
                {!isEditing && <div style={GLOW_LINE} />}
              </div>
            ))}
          </div>
        </div>

        {/* Separador decorativo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.2))' }} />
          <DividerCircle />
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.2))' }} />
        </div>

        {/* ── PANEL ECONÓMICO: Créditos | EnergyDivider | Reales ─────────── */}
        <div style={{ display: 'flex', gap: '0', alignItems: 'stretch', marginBottom: '14px' }}>

          {/* CRÉDITOS */}
          <div
            className="glass-panel rounded-sm"
            style={{ flex: 1, padding: '12px 14px', borderColor: 'rgba(255,215,0,0.28)', boxShadow: '0 0 18px rgba(255,215,0,0.05), inset 0 0 12px rgba(255,215,0,0.02)', borderRadius: '2px 0 0 2px', borderRight: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '7px', borderBottom: '1px solid rgba(255,215,0,0.18)' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.35))' }} />
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '7px', letterSpacing: '0.2em', color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.5)', whiteSpace: 'nowrap' }}>CRÉDITOS</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.35))' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* EN POSESIÓN */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6.5px', color: 'rgba(255,215,0,0.45)' }}>EN POSESIÓN</span>
                {isEditing
                  ? <input type="text" value={data?.creditos?.enPosesion ?? ''} onChange={e => setNested('creditos', 'enPosesion', e.target.value)} style={{ ...EDIT_INPUT, flex: 'none', fontSize: '14px', borderBottomColor: 'rgba(255,215,0,0.4)' }} />
                  : <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: 700, color: '#ffe566', textShadow: '0 0 8px rgba(255,215,0,0.3)', letterSpacing: '0.02em' }}>{data?.creditos?.enPosesion || '—'}</div>
                }
                <div style={GOLD_LINE} />
              </div>
              <div style={{ width: '1px', background: 'rgba(255,215,0,0.12)', flexShrink: 0 }} />
              {/* EN EL BANCO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6.5px', color: 'rgba(255,215,0,0.45)' }}>EN EL BANCO</span>
                {isEditing
                  ? <input type="text" value={data?.creditos?.enElBanco ?? ''} onChange={e => setNested('creditos', 'enElBanco', e.target.value)} style={{ ...EDIT_INPUT, flex: 'none', fontSize: '14px', borderBottomColor: 'rgba(255,215,0,0.4)' }} />
                  : <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: 700, color: '#ffe566', textShadow: '0 0 8px rgba(255,215,0,0.3)', letterSpacing: '0.02em' }}>{data?.creditos?.enElBanco || '—'}</div>
                }
                <div style={GOLD_LINE} />
              </div>
            </div>
          </div>

          {/* ── EnergyDivider ── */}
          <EnergyDivider />

          {/* REALES DE A OCHO */}
          <div
            className="glass-panel rounded-sm"
            style={{ flex: 1, padding: '12px 14px', borderColor: 'rgba(124,58,237,0.28)', boxShadow: '0 0 18px rgba(124,58,237,0.05), inset 0 0 12px rgba(124,58,237,0.02)', borderRadius: '0 2px 2px 0', borderLeft: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '7px', borderBottom: '1px solid rgba(124,58,237,0.18)' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.4))' }} />
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '6.5px', letterSpacing: '0.15em', color: 'rgba(190,150,255,0.95)', textShadow: '0 0 10px rgba(124,58,237,0.6)', whiteSpace: 'nowrap' }}>REALES DE A OCHO</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(124,58,237,0.4))' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* EN POSESIÓN */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6.5px', color: 'rgba(190,150,255,0.45)' }}>EN POSESIÓN</span>
                {isEditing
                  ? <input type="text" value={data?.realesDeAOcho?.enPosesion ?? ''} onChange={e => setNested('realesDeAOcho', 'enPosesion', e.target.value)} style={{ ...EDIT_INPUT, flex: 'none', fontSize: '14px', borderBottomColor: 'rgba(124,58,237,0.4)' }} />
                  : <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: 700, color: 'rgba(200,165,255,0.95)', textShadow: '0 0 8px rgba(124,58,237,0.4)', letterSpacing: '0.02em' }}>{data?.realesDeAOcho?.enPosesion || '—'}</div>
                }
                <div style={PURPLE_LINE} />
              </div>
              <div style={{ width: '1px', background: 'rgba(124,58,237,0.12)', flexShrink: 0 }} />
              {/* EN EL BANCO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: '4px', fontSize: '6.5px', color: 'rgba(190,150,255,0.45)' }}>EN EL BANCO</span>
                {isEditing
                  ? <input type="text" value={data?.realesDeAOcho?.enElBanco ?? ''} onChange={e => setNested('realesDeAOcho', 'enElBanco', e.target.value)} style={{ ...EDIT_INPUT, flex: 'none', fontSize: '14px', borderBottomColor: 'rgba(124,58,237,0.4)' }} />
                  : <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: 700, color: 'rgba(200,165,255,0.95)', textShadow: '0 0 8px rgba(124,58,237,0.4)', letterSpacing: '0.02em' }}>{data?.realesDeAOcho?.enElBanco || '—'}</div>
                }
                <div style={PURPLE_LINE} />
              </div>
            </div>
          </div>
        </div>

        {/* ── PANEL INFERIOR: Objetos Importantes | Habilidades ─────────── */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {renderItemSection({
            arrKey:      'inventario',
            label:       'OBJETOS IMPORTANTES',
            accentColor: 'rgba(0,212,255,0.6)',
            lineStyle:   GLOW_LINE,
            bulletColor: 'rgba(0,212,255,0.7)',
            emptyText:   'Sin objetos',
          })}
          {renderItemSection({
            arrKey:      'habilidadesEspeciales',
            label:       'HABILIDADES ESPECIALES',
            accentColor: 'rgba(0,255,136,0.6)',
            lineStyle:   { height: '1px', background: 'linear-gradient(to right, rgba(0,255,136,0.35), transparent)' },
            bulletColor: 'rgba(0,255,136,0.7)',
            emptyText:   'Sin habilidades',
          })}
        </div>

        {/* ── Controles de edición (Master) ─────────────────────────────── */}
        {isMaster && isEditing && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button className="cyber-btn" style={{ flex: 1, fontSize: '8px', padding: '7px', borderColor: 'rgba(0,255,136,0.5)', color: 'rgba(0,255,136,0.85)' }} onClick={confirmEdit}>
              CONFIRMAR
            </button>
            <button className="cyber-btn" style={{ flex: 1, fontSize: '8px', padding: '7px', borderColor: 'rgba(255,68,68,0.4)', color: 'rgba(255,68,68,0.75)' }} onClick={cancelEdit}>
              CANCELAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
