import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ── Constantes ────────────────────────────────────────────────────────────

const MAP_SRC = '/ciudad-noche.png';
const MAP_RATIO = 1680 / 936;

const ACCENT = '#b06cf0';   // violeta (acentos del detalle)
const CYAN   = '#00d4ff';

// Categorías canónicas: color → icono + etiqueta
const CATEGORIES = [
  { key: 'casa',     label: 'Casas',     color: '#00d4ff' },
  { key: 'lugar',    label: 'Lugares',   color: '#00ff88' },
  { key: 'mision',   label: 'Misiones',  color: '#ffd700' },
  { key: 'jugador',  label: 'Jugadores', color: '#ff8c00' },
];
const COLOR_CAT = { '#00d4ff': 'casa', '#00ff88': 'lugar', '#ffd700': 'mision', '#ff8c00': 'jugador' };

// Paleta del selector (4 canónicos + extras)
const PALETTE = [
  { label: 'Casas (azul)',        value: '#00d4ff' },
  { label: 'Lugares (verde)',     value: '#00ff88' },
  { label: 'Misiones (amarillo)', value: '#ffd700' },
  { label: 'Jugadores (naranja)', value: '#ff8c00' },
  { label: 'Rojo',                value: '#ff4444' },
  { label: 'Negro',               value: '#1a1a1a' },
  { label: 'Blanco',              value: '#ffffff' },
];

const catOf   = (color) => COLOR_CAT[color] || 'default';
const colorOf = (poi) => poi.color || '#ffffff';

const Z_MIN = 1, Z_MAX = 6, Z_STEP = 0.6;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ── Utilidad de compresión de imagen (igual que en el resto de catálogos) ──

async function compressImage(file) {
  const MAX_W = 1200, MAX_H = 800, QUALITY = 0.82;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
      if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── Iconos de marcador por categoría ───────────────────────────────────────

function MarkerIcon({ category, color, size = 28 }) {
  const glow = `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 2px ${color})`;
  const common = { width: size, height: size, display: 'block', filter: glow };

  if (category === 'casa') {
    // Palacio / templo simple
    return (
      <svg viewBox="0 0 24 24" style={common} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3 L21 9 H3 Z" fill={color} opacity="0.9" />
        <rect x="5"  y="10" width="2.4" height="8" fill={color} />
        <rect x="9"  y="10" width="2.4" height="8" fill={color} />
        <rect x="13" y="10" width="2.4" height="8" fill={color} />
        <rect x="16.6" y="10" width="2.4" height="8" fill={color} />
        <rect x="3" y="18.5" width="18" height="2.2" fill={color} />
      </svg>
    );
  }
  if (category === 'mision') {
    // Símbolo de admiración
    return (
      <svg viewBox="0 0 24 24" style={common} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10.5" fill="rgba(0,0,0,0.55)" stroke={color} strokeWidth="1.8" />
        <rect x="10.6" y="5.5" width="2.8" height="8.4" rx="1.2" fill={color} />
        <circle cx="12" cy="17.6" r="1.7" fill={color} />
      </svg>
    );
  }
  if (category === 'jugador') {
    // Símbolo de persona
    return (
      <svg viewBox="0 0 24 24" style={common} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10.5" fill="rgba(0,0,0,0.55)" stroke={color} strokeWidth="1.6" />
        <circle cx="12" cy="9" r="3.2" fill={color} />
        <path d="M5.5 18.5 Q12 12.5 18.5 18.5 Z" fill={color} />
      </svg>
    );
  }
  if (category === 'lugar') {
    // Punto de interés (círculo con anillo)
    return (
      <svg viewBox="0 0 24 24" style={common} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9.5" fill="none" stroke={color} strokeWidth="1.6" opacity="0.7" />
        <circle cx="12" cy="12" r="4.6" fill={color} />
      </svg>
    );
  }
  // Por defecto (rojo / negro / blanco / personalizado): rombo
  return (
    <svg viewBox="0 0 24 24" style={common} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
    </svg>
  );
}

// ── Detalle de un punto (estilo "Transmisión activa") ──────────────────────

function PoiDetail({ poi, isEditor, onEdit, onDelete, onClose }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const color = colorOf(poi);
  const recompensas = (poi.recompensas || '').split(',').map(s => s.trim()).filter(Boolean);

  const handleDel = () => {
    if (confirmDel) onDelete();
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
  };

  const labelStyle = { fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.22em', color: `${ACCENT}aa`, marginBottom: '7px' };

  return createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(2,2,10,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div style={{
        position: 'relative', width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto',
        background: 'linear-gradient(165deg, rgba(14,10,28,0.98) 0%, rgba(6,5,16,0.99) 100%)',
        border: `1px solid ${ACCENT}55`, borderRadius: '5px',
        boxShadow: `0 0 50px ${ACCENT}33, inset 0 0 60px rgba(120,60,220,0.05)`,
        padding: '22px 26px',
      }}>
        {/* Esquinas HUD */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={v+h} style={{ position: 'absolute', [v]: '9px', [h]: '9px', width: '16px', height: '16px',
            [`border${v[0].toUpperCase()+v.slice(1)}`]: `1px solid ${ACCENT}`, [`border${h[0].toUpperCase()+h.slice(1)}`]: `1px solid ${ACCENT}`, opacity: 0.7, pointerEvents: 'none' }} />
        ))}

        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', letterSpacing: '0.25em', color: `${ACCENT}cc` }}>TRANSMISIÓN ACTIVA</span>
            </div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.04em', color: '#eaf6ff', textShadow: `0 0 22px ${ACCENT}66`, lineHeight: 1.15 }}>
              {poi.nombre}
            </div>
          </div>
          <button onClick={onClose} title="Cerrar" style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%', background: 'transparent', border: `1px solid ${ACCENT}55`, color: `${ACCENT}cc`, cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}>✕</button>
        </div>

        {/* Subrayado degradado */}
        <div style={{ height: '2px', margin: '12px 0 18px', background: `linear-gradient(to right, ${ACCENT} 0%, ${CYAN} 45%, transparent 80%)` }} />

        {/* Imagen opcional */}
        {poi.imagen && (
          <img src={poi.imagen} alt={poi.nombre} style={{ width: '100%', maxHeight: '230px', objectFit: 'cover', borderRadius: '3px', border: `1px solid ${ACCENT}33`, marginBottom: '18px', display: 'block' }} />
        )}

        {/* Bajo control de */}
        {poi.faccion && (
          <div style={{ marginBottom: '18px' }}>
            <div style={labelStyle}>BAJO CONTROL DE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: `1px solid ${ACCENT}40`, borderLeft: `3px solid ${ACCENT}`, borderRadius: '3px', background: 'rgba(120,60,220,0.06)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.95rem', color: CYAN, letterSpacing: '0.04em' }}>{poi.faccion}</span>
            </div>
          </div>
        )}

        {/* Informe de inteligencia */}
        {poi.descripcion && (
          <div style={{ marginBottom: '18px' }}>
            <div style={labelStyle}>INFORME DE INTELIGENCIA</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.98rem', lineHeight: 1.65, color: 'rgba(205,225,255,0.88)', whiteSpace: 'pre-wrap' }}>
              {poi.descripcion}
            </div>
          </div>
        )}

        {/* Recompensas */}
        {recompensas.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={labelStyle}>RECOMPENSAS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {recompensas.map((r, i) => (
                <span key={i} style={{ padding: '4px 12px', border: `1px solid ${CYAN}66`, borderRadius: '2px', background: `${CYAN}10`, color: CYAN, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', letterSpacing: '0.02em' }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Coordenadas */}
        <div style={{ marginBottom: '20px' }}>
          <div style={labelStyle}>COORDENADAS</div>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', color: 'rgba(0,212,255,0.6)', letterSpacing: '0.08em' }}>
            X: {poi.x.toFixed(2)}%　·　Y: {poi.y.toFixed(2)}%
          </div>
        </div>

        {/* Pie */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '14px', borderTop: `1px solid ${ACCENT}22`, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: `${ACCENT}55` }}>ZYGERRIA CITY DATABASE v4.2</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditor && (
              <>
                <button onClick={onEdit} style={{ background: 'transparent', border: `1px solid ${ACCENT}45`, color: `${ACCENT}cc`, fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', padding: '7px 14px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.1em' }}>EDITAR</button>
                <button onClick={handleDel} style={{ background: confirmDel ? 'rgba(255,68,68,0.14)' : 'transparent', border: `1px solid ${confirmDel ? 'rgba(255,68,68,0.6)' : 'rgba(255,68,68,0.3)'}`, color: confirmDel ? '#ff5555' : 'rgba(255,68,68,0.65)', fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', padding: '7px 14px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                  {confirmDel ? '¿CONFIRMAR?' : 'ELIMINAR'}
                </button>
              </>
            )}
            <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${ACCENT}45`, color: `${ACCENT}cc`, fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', padding: '7px 16px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.1em' }}>CERRAR TRANSMISIÓN</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Modal de creación / edición ─────────────────────────────────────────────

function PoiModal({ poi, onSave, onClose }) {
  const [nombre,      setNombre]      = useState(poi.nombre || '');
  const [faccion,     setFaccion]     = useState(poi.faccion || '');
  const [recompensas, setRecompensas] = useState(poi.recompensas || '');
  const [descripcion, setDescripcion] = useState(poi.descripcion || '');
  const [color,       setColor]       = useState(poi.color || '#00ff88');
  const [imagen,      setImagen]      = useState(poi.imagen || null);
  const [imgLoading,  setImgLoading]  = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImgLoading(true);
    try { setImagen(await compressImage(file)); } catch { /* ignore */ }
    setImgLoading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave({
      nombre: nombre.trim(),
      faccion: faccion.trim() || null,
      recompensas: recompensas.trim(),
      descripcion: descripcion.trim(),
      color,
      imagen,
    });
  };

  const lbl = { display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.48)', marginBottom: '6px' };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0d0d14', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '4px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 0 40px rgba(0,212,255,0.12)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.8)', marginBottom: '20px' }}>
          {poi.id ? 'EDITAR PUNTO DE INTERÉS' : 'NUEVO PUNTO DE INTERÉS'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div>
            <label style={lbl}>NOMBRE *</label>
            <input className="cyber-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del punto…" autoFocus />
          </div>

          <div>
            <label style={lbl}>FACCIÓN</label>
            <input className="cyber-input" value={faccion} onChange={e => setFaccion(e.target.value)} placeholder="Casa o facción…" />
          </div>

          <div>
            <label style={lbl}>COLOR / CATEGORÍA</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PALETTE.map(p => {
                const sel = color === p.value;
                return (
                  <button key={p.value} type="button" onClick={() => setColor(p.value)} title={p.label}
                    style={{ width: '34px', height: '34px', borderRadius: '3px', cursor: 'pointer', background: p.value, border: sel ? '2px solid #fff' : '1px solid rgba(255,255,255,0.25)', boxShadow: sel ? `0 0 10px ${p.value}` : 'none', position: 'relative' }}>
                    {sel && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.value === '#ffffff' ? '#000' : '#fff', fontSize: '0.8rem', fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MarkerIcon category={catOf(color)} color={color} size={26} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.82rem', color: 'rgba(0,212,255,0.55)' }}>
                {CATEGORIES.find(c => c.color === color)?.label || 'Marcador genérico'}
              </span>
            </div>
          </div>

          <div>
            <label style={lbl}>RECOMPENSAS</label>
            <input className="cyber-input" value={recompensas} onChange={e => setRecompensas(e.target.value)} placeholder="Ej: Influencia, Dinero, Recursos" />
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.72rem', color: 'rgba(0,212,255,0.35)', marginTop: '4px' }}>Separa varias con comas.</div>
          </div>

          <div>
            <label style={lbl}>DESCRIPCIÓN</label>
            <textarea className="cyber-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción / informe…" rows={4} style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>

          <div>
            <label style={lbl}>IMAGEN (opcional)</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
            {imagen ? (
              <div>
                <img src={imagen} alt="" style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'cover', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '2px', display: 'block' }} />
                <div style={{ display: 'flex', gap: '6px', marginTop: '7px' }}>
                  <button type="button" onClick={() => fileRef.current?.click()} className="cyber-btn" style={{ padding: '3px 10px', fontSize: '0.55rem' }}>CAMBIAR</button>
                  <button type="button" onClick={() => setImagen(null)} className="cyber-btn" style={{ padding: '3px 10px', fontSize: '0.55rem', borderColor: 'rgba(255,68,68,0.4)', color: 'rgba(255,68,68,0.6)' }}>QUITAR</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={imgLoading} style={{ background: 'rgba(0,212,255,0.03)', border: '1px dashed rgba(0,212,255,0.28)', color: 'rgba(0,212,255,0.48)', fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', padding: '12px 20px', cursor: 'pointer', width: '100%', borderRadius: '2px' }}>
                {imgLoading ? 'PROCESANDO…' : '+ SUBIR IMAGEN'}
              </button>
            )}
          </div>

          {poi.id && (
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.78rem', color: 'rgba(0,212,255,0.4)' }}>
              Arrastra el punto sobre el mapa para reubicarlo.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} className="cyber-btn" style={{ padding: '6px 18px', fontSize: '0.6rem', borderColor: 'rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.5)' }}>CANCELAR</button>
            <button type="submit" className="cyber-btn" style={{ padding: '6px 22px', fontSize: '0.6rem' }}>{poi.id ? 'GUARDAR' : 'CREAR'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── Componente principal ────────────────────────────────────────────────────

export default function MapaZygerria({ isEditor, pois, onAdd, onUpdate, onDelete, onBack }) {
  const viewportRef = useRef(null);
  const [fit, setFit] = useState({ w: 0, h: 0, ox: 0, oy: 0 });
  const [view, setView] = useState({ z: 1, tx: 0, ty: 0 });

  const [selectedId, setSelectedId] = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [placing,    setPlacing]    = useState(false);
  const [pendingPos, setPendingPos] = useState(null);
  const [hoverId,    setHoverId]    = useState(null);

  const [showFilters,  setShowFilters]  = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterCats,   setFilterCats]   = useState([]);   // categorías activas
  const [filterFaccion,setFilterFaccion]= useState('');

  const [liveMove, setLiveMove] = useState(null); // { id, x, y } durante arrastre
  const dragRef = useRef(null);

  const selected = selectedId ? pois.find(p => p.id === selectedId) : null;

  // ── Cálculo de la caja de ajuste (fit) según el tamaño del viewport ──
  const recomputeFit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    let w = W, h = W / MAP_RATIO;
    if (h > H) { h = H; w = H * MAP_RATIO; }
    setFit({ w, h, ox: (W - w) / 2, oy: (H - h) / 2 });
  }, []);

  useLayoutEffect(() => {
    recomputeFit();
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(recomputeFit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recomputeFit]);

  // Reajustar límites de paneo cuando cambia fit/zoom
  useEffect(() => {
    setView(v => ({
      ...v,
      tx: clamp(v.tx, fit.w * (1 - v.z), 0),
      ty: clamp(v.ty, fit.h * (1 - v.z), 0),
    }));
  }, [fit.w, fit.h]);

  const clampView = (z, tx, ty) => ({
    z,
    tx: clamp(tx, fit.w * (1 - z), 0),
    ty: clamp(ty, fit.h * (1 - z), 0),
  });

  // Zoom centrado en un punto del viewport
  const zoomAt = (newZ, cx, cy) => {
    setView(v => {
      const z = clamp(newZ, Z_MIN, Z_MAX);
      const sx = (cx - fit.ox - v.tx) / v.z;
      const sy = (cy - fit.oy - v.ty) / v.z;
      return clampView(z, (cx - fit.ox) - sx * z, (cy - fit.oy) - sy * z);
    });
  };

  const onWheel = (e) => {
    e.preventDefault();
    const r = viewportRef.current.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    zoomAt(view.z * factor, e.clientX - r.left, e.clientY - r.top);
  };

  const zoomButton = (dir) => {
    const r = viewportRef.current.getBoundingClientRect();
    zoomAt(view.z + dir * Z_STEP, r.width / 2, r.height / 2);
  };
  const resetView = () => setView({ z: 1, tx: 0, ty: 0 });

  // Convierte coordenadas de cliente a porcentaje sobre el mapa
  const clientToPct = (clientX, clientY) => {
    const r = viewportRef.current.getBoundingClientRect();
    const cx = clientX - r.left, cy = clientY - r.top;
    const sx = (cx - fit.ox - view.tx) / view.z;
    const sy = (cy - fit.oy - view.ty) / view.z;
    return { x: clamp((sx / fit.w) * 100, 0, 100), y: clamp((sy / fit.h) * 100, 0, 100) };
  };

  // ── Paneo del mapa ──
  const onViewportPointerDown = (e) => {
    if (placing) return; // en modo colocación el clic coloca, no panea
    if (e.button !== 0) return;
    dragRef.current = { type: 'pan', startX: e.clientX, startY: e.clientY, origTx: view.tx, origTy: view.ty, moved: false };
    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
  };

  // ── Arrastre / clic sobre un marcador (solo editor puede mover) ──
  const onMarkerPointerDown = (e, poi) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (isEditor) {
      dragRef.current = { type: 'marker', poiId: poi.id, startX: e.clientX, startY: e.clientY, moved: false };
      window.addEventListener('pointermove', onWindowPointerMove);
      window.addEventListener('pointerup', onWindowPointerUp);
    } else {
      dragRef.current = { type: 'view-only', poiId: poi.id, startX: e.clientX, startY: e.clientY, moved: false };
      window.addEventListener('pointerup', onWindowPointerUp);
    }
  };

  const onWindowPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 4) d.moved = true;
    if (d.type === 'pan') {
      setView(v => clampView(v.z, d.origTx + dx, d.origTy + dy));
    } else if (d.type === 'marker' && d.moved) {
      const { x, y } = clientToPct(e.clientX, e.clientY);
      d.pos = { x, y };
      setLiveMove({ id: d.poiId, x, y });
    }
  };

  const onWindowPointerUp = () => {
    const d = dragRef.current;
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
    dragRef.current = null;
    if (!d) return;
    if ((d.type === 'marker' || d.type === 'view-only') && !d.moved) {
      setSelectedId(d.poiId); // clic simple → abrir detalle
    } else if (d.type === 'marker' && d.moved && d.pos) {
      onUpdate(d.poiId, { x: d.pos.x, y: d.pos.y });
    }
    setLiveMove(null);
  };

  // Clic en el mapa en modo colocación
  const onViewportClick = (e) => {
    if (!placing) return;
    const { x, y } = clientToPct(e.clientX, e.clientY);
    setPendingPos({ x, y });
    setEditing({ nombre: '', faccion: '', recompensas: '', descripcion: '', color: '#00ff88', imagen: null });
    setShowModal(true);
    setPlacing(false);
  };

  // Escape: cancela colocación o cierra detalle
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (placing) setPlacing(false);
      else if (selectedId) setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [placing, selectedId]);

  const startPlacing = () => { setPlacing(true); setSelectedId(null); };

  const handleSave = (data) => {
    if (editing?.id) {
      onUpdate(editing.id, data);
    } else {
      onAdd({ ...data, x: pendingPos?.x ?? 50, y: pendingPos?.y ?? 50 });
    }
    setShowModal(false);
    setEditing(null);
    setPendingPos(null);
  };

  const handleDelete = () => {
    if (selectedId) onDelete(selectedId);
    setSelectedId(null);
  };

  // ── Filtrado ──
  const factions = [...new Set(pois.map(p => p.faccion).filter(Boolean))].sort();
  const visible = pois.filter(p => {
    const nm = !search || p.nombre.toLowerCase().includes(search.toLowerCase());
    const cm = filterCats.length === 0 || filterCats.includes(catOf(p.color));
    const fm = !filterFaccion || p.faccion === filterFaccion;
    return nm && cm && fm;
  });
  const activeFilterCount = (search ? 1 : 0) + filterCats.length + (filterFaccion ? 1 : 0);

  const toggleCat = (key) => setFilterCats(cs => cs.includes(key) ? cs.filter(c => c !== key) : [...cs, key]);
  const clearFilters = () => { setSearch(''); setFilterCats([]); setFilterFaccion(''); };

  const cursor = placing ? 'crosshair' : (view.z > 1 ? 'grab' : 'default');

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#06060c' }}>

      {/* ══ CABECERA ══ */}
      <div style={{ flexShrink: 0, padding: '0 18px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0 7px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.58)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '5px 11px', cursor: 'pointer', letterSpacing: '0.08em', flexShrink: 0, borderRadius: '2px' }}>
            ← VOLVER
          </button>
          <span style={{ color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', flexShrink: 0 }}>
            MAPA DE ZYGERRIA
          </span>
          <div style={{ flex: 1 }}>
            <input className="cyber-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar punto por nombre…" style={{ fontSize: '0.75rem', padding: '4px 10px' }} />
          </div>
          <button onClick={() => setShowFilters(v => !v)} style={{ padding: '5px 11px', borderRadius: '2px', cursor: 'pointer', background: showFilters ? 'rgba(0,212,255,0.1)' : 'transparent', border: `1px solid ${activeFilterCount ? 'rgba(0,212,255,0.55)' : showFilters ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.28)'}`, color: activeFilterCount ? 'rgba(0,212,255,0.9)' : showFilters ? 'rgba(0,212,255,0.75)' : 'rgba(0,212,255,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            FILTROS{activeFilterCount ? ` (${activeFilterCount})` : ''}&nbsp;<span style={{ fontSize: '0.45rem', opacity: 0.7 }}>{showFilters ? '▲' : '▼'}</span>
          </button>
          {isEditor && (
            <button onClick={startPlacing} className="cyber-btn" style={{ padding: '5px 14px', fontSize: '0.58rem', letterSpacing: '0.1em', flexShrink: 0, background: placing ? 'rgba(0,212,255,0.18)' : undefined }}>
              {placing ? 'COLOCANDO…' : '+ NUEVO'}
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '9px', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em' }}>CATEGORÍA:</span>
            {CATEGORIES.map(c => {
              const sel = filterCats.includes(c.key);
              return (
                <button key={c.key} onClick={() => toggleCat(c.key)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? c.color + 'cc' : c.color + '40'}`, background: sel ? `${c.color}1e` : 'transparent', color: sel ? c.color : `${c.color}88`, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.05em' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.color, opacity: sel ? 1 : 0.5 }} />
                  {c.label}
                </button>
              );
            })}
            <div style={{ width: '1px', height: '14px', background: 'rgba(0,212,255,0.14)' }} />
            <span style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em' }}>FACCIÓN:</span>
            <select value={filterFaccion} onChange={e => setFilterFaccion(e.target.value)} className="cyber-input" style={{ fontSize: '0.72rem', padding: '3px 8px', maxWidth: '220px' }}>
              <option value="">Todas</option>
              {factions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ padding: '2px 7px', background: 'transparent', border: '1px solid rgba(0,212,255,0.18)', color: 'rgba(0,212,255,0.38)', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', cursor: 'pointer', borderRadius: '2px' }}>
                ✕ LIMPIAR
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══ MAPA ══ */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <div
          ref={viewportRef}
          onPointerDown={onViewportPointerDown}
          onClick={onViewportClick}
          onWheel={onWheel}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor, touchAction: 'none', userSelect: 'none' }}
        >
          {fit.w > 0 && (
            <div style={{
              position: 'absolute', left: fit.ox, top: fit.oy, width: fit.w, height: fit.h,
              transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.z})`, transformOrigin: '0 0',
            }}>
              <img src={MAP_SRC} alt="Mapa de Zygerria" draggable={false}
                style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />

              {/* Marcadores */}
              {visible.map(poi => {
                const pos = liveMove && liveMove.id === poi.id ? liveMove : poi;
                const color = colorOf(poi);
                const isHover = hoverId === poi.id;
                return (
                  <div key={poi.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, width: 0, height: 0, zIndex: isHover ? 5 : 2 }}>
                    <div
                      onPointerDown={e => onMarkerPointerDown(e, poi)}
                      onMouseEnter={() => setHoverId(poi.id)}
                      onMouseLeave={() => setHoverId(h => h === poi.id ? null : h)}
                      style={{ position: 'absolute', left: 0, top: 0, transform: `translate(-50%, -50%) scale(${1 / view.z})`, transformOrigin: 'center', cursor: isEditor ? 'pointer' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                    >
                      <MarkerIcon category={catOf(poi.color)} color={color} size={isHover ? 32 : 28} />
                      {isHover && (
                        <span style={{ whiteSpace: 'nowrap', fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', letterSpacing: '0.05em', color: '#eaf6ff', background: 'rgba(4,4,12,0.85)', border: `1px solid ${color}77`, borderRadius: '2px', padding: '2px 7px', boxShadow: `0 0 10px ${color}55`, pointerEvents: 'none' }}>
                          {poi.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Banner de colocación */}
        {placing && (
          <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.5)', borderRadius: '3px', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(0,212,255,0.9)' }}>HAZ CLIC EN EL MAPA PARA COLOCAR EL PUNTO</span>
            <button onClick={() => setPlacing(false)} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.4)', color: 'rgba(0,212,255,0.7)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', padding: '3px 9px', cursor: 'pointer', borderRadius: '2px' }}>CANCELAR (ESC)</button>
          </div>
        )}

        {/* Controles de zoom */}
        <div style={{ position: 'absolute', right: '14px', bottom: '14px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { lbl: '🔍+', fn: () => zoomButton(1),  title: 'Acercar' },
            { lbl: '🔍−', fn: () => zoomButton(-1), title: 'Alejar' },
            { lbl: '⊡',   fn: resetView,           title: 'Restablecer vista' },
          ].map(b => (
            <button key={b.title} onClick={b.fn} title={b.title} style={{ width: '38px', height: '38px', background: 'rgba(6,8,18,0.85)', border: '1px solid rgba(0,212,255,0.4)', color: 'rgba(0,212,255,0.8)', borderRadius: '3px', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 0 12px rgba(0,0,0,0.4)' }}>
              {b.lbl}
            </button>
          ))}
        </div>

        {/* Leyenda */}
        <div style={{ position: 'absolute', left: '14px', bottom: '14px', zIndex: 20, background: 'rgba(6,8,18,0.85)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '3px', padding: '10px 12px', boxShadow: '0 0 14px rgba(0,0,0,0.4)' }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.4)', marginBottom: '8px' }}>LEYENDA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CATEGORIES.map(c => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MarkerIcon category={c.key} color={c.color} size={18} />
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.8rem', color: 'rgba(205,225,255,0.8)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contador */}
        <div style={{ position: 'absolute', right: '14px', top: '12px', zIndex: 20, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.4)' }}>
          {visible.length} / {pois.length} PUNTOS
        </div>
      </div>

      {/* Detalle */}
      {selected && (
        <PoiDetail
          poi={selected}
          isEditor={isEditor}
          onEdit={() => { setEditing({ ...selected }); setShowModal(true); setSelectedId(null); }}
          onDelete={handleDelete}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Modal */}
      {showModal && editing && (
        <PoiModal poi={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); setPendingPos(null); }} />
      )}
    </div>
  );
}
