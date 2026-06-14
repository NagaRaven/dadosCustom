import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── Constantes ────────────────────────────────────────────────────────────

const FACCIONES = ['Imperio Sith', 'Imperio Infinito', 'República', 'Otros'];
const ESTADOS   = ['Vivo', 'Muerto', 'Desaparecido'];

const ESTADO_COLOR = {
  'Vivo':        '#00ff88',
  'Muerto':      '#ff4444',
  'Desaparecido':'#ffd700',
};

const FACCION_COLOR = {
  'Imperio Sith':     '#c084fc',
  'Imperio Infinito': '#ff7043',
  'República':        '#00d4ff',
  'Otros':            '#a0b0c0',
};

// ── Utilidades ────────────────────────────────────────────────────────────

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

// ── Placeholder holográfico SVG ───────────────────────────────────────────

function CharPlaceholder({ size = '100%' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}>
      <circle cx="50" cy="24" r="15" stroke="rgba(0,212,255,0.55)" strokeWidth="1.5" />
      <path d="M24 52 Q50 45 76 52 L70 92 H30 Z" stroke="rgba(0,212,255,0.55)" strokeWidth="1.5" fill="rgba(0,212,255,0.04)" />
      <line x1="14" y1="58" x2="24" y2="52" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" />
      <line x1="76" y1="52" x2="86" y2="58" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" />
      <line x1="14" y1="58" x2="11" y2="88" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" />
      <line x1="86" y1="58" x2="89" y2="88" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" />
      <line x1="30" y1="92" x2="26" y2="114" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" />
      <line x1="70" y1="92" x2="74" y2="114" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" />
      <circle cx="50" cy="24" r="15" stroke="rgba(0,212,255,0.12)" strokeWidth="8" />
    </svg>
  );
}

// ── Imagen holográfica (reutiliza efecto de Timeline) ─────────────────────

function HoloImage({ src, nombre, size = 'full' }) {
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const containerStyle = size === 'card'
    ? { position: 'relative', paddingBottom: '100%', overflow: 'visible', cursor: src ? 'zoom-in' : 'default', animation: 'holo-flicker 11s ease-in-out infinite', maskImage: 'radial-gradient(ellipse 88% 88% at 50% 38%, black 15%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.08) 60%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 88% 88% at 50% 38%, black 15%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.08) 60%, transparent 75%)' }
    : { position: 'relative', paddingBottom: '100%', overflow: 'visible', cursor: src ? 'zoom-in' : 'default', animation: 'holo-flicker 11s ease-in-out infinite', maskImage: 'radial-gradient(ellipse 88% 88% at 50% 38%, black 15%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.08) 60%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 88% 88% at 50% 38%, black 15%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.08) 60%, transparent 75%)' };

  return (
    <>
      <div
        style={containerStyle}
        onMouseEnter={() => src && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => src && setLightbox(true)}
      >
        {src ? (
          <img src={src} alt={nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(1.15) contrast(1.4) saturate(0)' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,10,25,0.8)' }}>
            <CharPlaceholder size="70%" />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,200,255,1)', mixBlendMode: 'color', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,212,255,0.12) 0px, rgba(0,212,255,0.12) 1px, transparent 1px, transparent 4px)', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,220,255,0.12) 0%, transparent 70%)', mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,6,30,0.45) 65%, rgba(0,0,20,0.8) 88%)', pointerEvents: 'none', zIndex: 3 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,230,255,0.55) 0%, rgba(0,200,255,0.22) 30%, transparent 60%)', pointerEvents: 'none', zIndex: 4 }} />
        {hovered && src && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(0,212,255,0.85)', background: 'rgba(0,8,18,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(0,212,255,0.45)', color: 'rgba(0,212,255,0.95)', fontSize: '1.1rem' }}>⤢</div>
          </div>
        )}
      </div>

      {/* Proyector */}
      <div style={{ position: 'relative', height: '54px', marginTop: '-20px', overflow: 'visible', background: 'transparent' }}>
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', width: '90%', height: '55px', background: 'linear-gradient(to top, rgba(0,220,255,0.32) 0%, rgba(0,180,255,0.1) 60%, transparent 100%)', clipPath: 'polygon(18% 100%, 82% 100%, 100% 0%, 0% 0%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '78%', height: '18px', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.55)', background: 'rgba(0,212,255,0.06)', boxShadow: '0 0 22px rgba(0,212,255,0.55), inset 0 0 12px rgba(0,212,255,0.18)', animation: 'holo-proj-pulse 2.5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '7px', left: '50%', transform: 'translateX(-50%)', width: '32%', height: '8px', borderRadius: '50%', background: 'rgba(0,220,255,0.7)', boxShadow: '0 0 18px rgba(0,212,255,0.95), 0 0 36px rgba(0,212,255,0.5)', animation: 'holo-proj-pulse 2.5s ease-in-out infinite', pointerEvents: 'none' }} />
      </div>

      {lightbox && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setLightbox(false)}>
          <img src={src} alt={nombre} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', display: 'block', borderRadius: '2px', boxShadow: '0 0 60px rgba(0,212,255,0.15)' }} />
          <button onClick={e => { e.stopPropagation(); setLightbox(false); }} style={{ position: 'absolute', top: '20px', right: '24px', background: 'transparent', border: '1px solid rgba(0,212,255,0.4)', color: 'rgba(0,212,255,0.7)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', padding: '6px 14px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.1em' }}>
            ✕ CERRAR
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Tarjeta de personaje ──────────────────────────────────────────────────

function CharCard({ char, isSelected, onClick }) {
  const statusColor = char.estado ? ESTADO_COLOR[char.estado] : 'rgba(0,212,255,0.3)';

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? 'rgba(0,212,255,0.07)' : 'rgba(10,12,20,0.92)',
        border: `1px solid ${isSelected ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.17)'}`,
        borderRadius: '3px',
        padding: '10px',
        cursor: 'pointer',
        transition: 'border-color 0.22s, background-color 0.22s, box-shadow 0.22s',
        boxShadow: isSelected ? '0 0 16px rgba(0,212,255,0.15)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Imagen miniatura vertical (4:5) */}
      <div style={{ position: 'relative', paddingBottom: '125%', background: 'rgba(0,10,25,0.8)', border: '1px solid rgba(0,212,255,0.18)', borderRadius: '2px', overflow: 'hidden' }}>
        {char.imagen ? (
          <img src={char.imagen} alt={char.nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CharPlaceholder size="65%" />
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          {char.estado && (
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}`, flexShrink: 0 }} />
          )}
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.07em', color: 'rgba(0,212,255,0.9)', wordBreak: 'break-word', lineHeight: 1.3 }}>
            {char.nombre}
          </div>
        </div>
        {char.titulo && (
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: 'rgba(0,212,255,0.5)', lineHeight: 1.3 }}>
            {char.titulo}
          </div>
        )}
        {char.faccion && (
          <div style={{ marginTop: '4px', display: 'inline-block', padding: '1px 7px', borderRadius: '2px', border: `1px solid ${FACCION_COLOR[char.faccion] || '#aaa'}44`, background: `${FACCION_COLOR[char.faccion] || '#aaa'}12`, color: FACCION_COLOR[char.faccion] || '#aaa', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.06em' }}>
            {char.faccion}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel de detalle ──────────────────────────────────────────────────────

function CharDetailPanel({ char, isEditor, timelineEvents, onEdit, onDelete, onNavigateToEvent, onClose }) {
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDel = () => {
    if (confirmDel) onDelete();
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
  };

  const linkedEvents = timelineEvents.filter(ev => (ev.linkedCharacters || []).includes(char.id));

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(175deg, rgba(0,10,22,0.98) 0%, rgba(0,5,14,0.99) 100%)',
      border: '1px solid rgba(0,212,255,0.55)',
      boxShadow: '0 0 40px rgba(0,212,255,0.14), inset 0 0 60px rgba(0,140,255,0.04)',
      overflow: 'hidden',
      animation: 'holo-flicker 9s ease-in-out infinite',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.008) 3px, rgba(0,212,255,0.008) 4px)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="hud-corners-full" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(0,212,255,0.1)', flexShrink: 0, zIndex: 3, position: 'relative' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(0,212,255,0.38)' }}>◈ ARCHIVO DE PERSONAJE</div>
        <div style={{ display: 'flex', gap: '7px' }}>
          {isEditor && (
            <>
              <button onClick={onEdit} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.25)', color: 'rgba(0,212,255,0.6)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 10px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.08em' }}>EDITAR</button>
              <button onClick={handleDel} style={{ background: confirmDel ? 'rgba(255,68,68,0.12)' : 'transparent', border: `1px solid ${confirmDel ? 'rgba(255,68,68,0.55)' : 'rgba(255,68,68,0.22)'}`, color: confirmDel ? '#ff4444' : 'rgba(255,68,68,0.55)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 10px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.07em', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {confirmDel ? '¿CONFIRMAR?' : 'ELIMINAR'}
              </button>
            </>
          )}
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 10px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.07em' }}>✕</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 3 }}>
        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0, padding: '18px 16px 24px 18px' }}>
          {/* Estado dot + Nombre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            {char.estado && (
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: ESTADO_COLOR[char.estado], boxShadow: `0 0 8px ${ESTADO_COLOR[char.estado]}`, flexShrink: 0 }} />
            )}
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1.35, color: 'rgba(0,220,255,0.95)', textShadow: '0 0 18px rgba(0,212,255,0.5)' }}>
              {char.nombre}
            </div>
          </div>

          {/* Título */}
          {char.titulo && (
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem', color: 'rgba(0,212,255,0.65)', marginBottom: '12px', fontStyle: 'italic' }}>
              {char.titulo}
            </div>
          )}

          {/* Chips: estado, facción, raza */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {char.estado && (
              <span style={{ padding: '2px 10px', borderRadius: '2px', border: `1px solid ${ESTADO_COLOR[char.estado]}66`, background: `${ESTADO_COLOR[char.estado]}12`, color: ESTADO_COLOR[char.estado], fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em' }}>
                {char.estado.toUpperCase()}
              </span>
            )}
            {char.faccion && (
              <span style={{ padding: '2px 10px', borderRadius: '2px', border: `1px solid ${FACCION_COLOR[char.faccion] || '#aaa'}55`, background: `${FACCION_COLOR[char.faccion] || '#aaa'}10`, color: FACCION_COLOR[char.faccion] || '#aaa', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em' }}>
                {char.faccion.toUpperCase()}
              </span>
            )}
            {char.raza && (
              <span style={{ padding: '2px 10px', borderRadius: '2px', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.06)', color: 'rgba(0,212,255,0.7)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.82rem' }}>
                {char.raza}
              </span>
            )}
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(0,212,255,0.45), rgba(0,212,255,0.1), transparent)', marginBottom: '14px' }} />

          {/* Descripción */}
          {char.descripcion ? (
            <div style={{ color: 'rgba(180,225,255,0.82)', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: 'Rajdhani, sans-serif', whiteSpace: 'pre-wrap', marginBottom: '18px' }}>
              {char.descripcion}
            </div>
          ) : (
            <div style={{ color: 'rgba(0,212,255,0.22)', fontSize: '0.78rem', fontStyle: 'italic', fontFamily: 'Rajdhani, sans-serif', marginBottom: '18px' }}>
              Sin descripción registrada.
            </div>
          )}

          {/* Eventos vinculados */}
          {linkedEvents.length > 0 && (
            <>
              <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(0,212,255,0.3), transparent)', marginBottom: '12px' }} />
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.38)', marginBottom: '8px' }}>
                EVENTOS VINCULADOS ({linkedEvents.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {linkedEvents.map(ev => (
                  <button key={ev.id} onClick={() => onNavigateToEvent(ev.id)} style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '2px', padding: '6px 10px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ev.nivel === 'legendario' ? '#ffd700' : 'rgba(0,212,255,0.7)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', color: 'rgba(0,212,255,0.75)', letterSpacing: '0.05em' }}>{ev.nombre}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: 'rgba(0,212,255,0.35)' }}>→</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Imagen holográfica */}
        <div style={{ flexShrink: 0, width: '46%', padding: '18px 18px 0 0', display: 'flex', flexDirection: 'column' }}>
          <HoloImage src={char.imagen} nombre={char.nombre} />
        </div>
      </div>
    </div>
  );
}

// ── Modal de creación/edición ─────────────────────────────────────────────

function CharModal({ char, onSave, onClose }) {
  const [nombre,      setNombre]      = useState(char.nombre || '');
  const [titulo,      setTitulo]      = useState(char.titulo || '');
  const [raza,        setRaza]        = useState(char.raza || '');
  const [descripcion, setDescripcion] = useState(char.descripcion || '');
  const [faccion,     setFaccion]     = useState(char.faccion || null);
  const [estado,      setEstado]      = useState(char.estado || null);
  const [imagen,      setImagen]      = useState(char.imagen || null);
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
    onSave({ nombre: nombre.trim(), titulo: titulo.trim(), raza: raza.trim(), descripcion: descripcion.trim(), faccion, estado, imagen });
  };

  const lbl = { display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.48)', marginBottom: '6px' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0d0d14', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '4px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 0 40px rgba(0,212,255,0.12)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.8)', marginBottom: '20px' }}>
          {char.id ? 'EDITAR PERSONAJE' : 'NUEVO PERSONAJE'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div>
            <label style={lbl}>NOMBRE *</label>
            <input className="cyber-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del personaje…" autoFocus />
          </div>

          <div>
            <label style={lbl}>TÍTULO</label>
            <input className="cyber-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título u honorífico…" />
          </div>

          <div>
            <label style={lbl}>RAZA</label>
            <input className="cyber-input" value={raza} onChange={e => setRaza(e.target.value)} placeholder="Especie o raza…" />
          </div>

          <div>
            <label style={lbl}>FACCIÓN</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {FACCIONES.map(f => {
                const col = FACCION_COLOR[f] || '#aaa';
                const sel = faccion === f;
                return (
                  <button key={f} type="button" onClick={() => setFaccion(sel ? null : f)} style={{ padding: '4px 12px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'cc' : col + '44'}`, background: sel ? `${col}18` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.56rem', letterSpacing: '0.08em' }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={lbl}>ESTADO</label>
            <div style={{ display: 'flex', gap: '7px' }}>
              {ESTADOS.map(s => {
                const col = ESTADO_COLOR[s];
                const sel = estado === s;
                return (
                  <button key={s} type="button" onClick={() => setEstado(sel ? null : s)} style={{ padding: '4px 14px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'cc' : col + '44'}`, background: sel ? `${col}18` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={lbl}>DESCRIPCIÓN</label>
            <textarea className="cyber-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción del personaje…" rows={4} style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>

          <div>
            <label style={lbl}>IMAGEN</label>
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

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} className="cyber-btn" style={{ padding: '6px 18px', fontSize: '0.6rem', borderColor: 'rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.5)' }}>CANCELAR</button>
            <button type="submit" className="cyber-btn" style={{ padding: '6px 22px', fontSize: '0.6rem' }}>{char.id ? 'GUARDAR' : 'CREAR'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function CharacterCatalog({ isEditor, catalogCharacters, timelineEvents, onAdd, onUpdate, onDelete, onNavigateToEvent, onBack, initialSelectedId }) {
  const [selectedId,    setSelectedId]    = useState(initialSelectedId || null);
  const [search,        setSearch]        = useState('');
  const [filterFaccion, setFilterFaccion] = useState(null);
  const [filterEstado,  setFilterEstado]  = useState(null);
  const [showModal,     setShowModal]     = useState(false);
  const [editingChar,   setEditingChar]   = useState(null);
  const [showFilters,   setShowFilters]   = useState(false);

  const selectedChar = selectedId ? catalogCharacters.find(c => c.id === selectedId) ?? null : null;

  const filtered = catalogCharacters.filter(c => {
    const nm = !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || (c.titulo || '').toLowerCase().includes(search.toLowerCase());
    const fm = !filterFaccion || c.faccion === filterFaccion;
    const em = !filterEstado  || c.estado  === filterEstado;
    return nm && fm && em;
  });

  const openAdd  = () => { setEditingChar({ nombre: '', titulo: '', raza: '', descripcion: '', faccion: null, estado: null, imagen: null }); setShowModal(true); };
  const openEdit = (ch) => { setEditingChar({ ...ch }); setShowModal(true); };

  const handleSave = (data) => {
    if (editingChar.id) onUpdate(editingChar.id, data);
    else onAdd(data);
    setShowModal(false);
    setEditingChar(null);
  };

  const handleDelete = () => {
    onDelete(selectedId);
    setSelectedId(null);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>

      {/* ══ CABECERA ══════════════════════════════════════════════════════ */}
      <div style={{ flexShrink: 0, padding: '0 18px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>

        {/* Fila 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0 7px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.58)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '5px 11px', cursor: 'pointer', letterSpacing: '0.08em', flexShrink: 0, borderRadius: '2px' }}>
            ← VOLVER
          </button>
          <span style={{ color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', flexShrink: 0 }}>
            CATÁLOGO DE PERSONAJES
          </span>
          <div style={{ flex: 1 }}>
            <input className="cyber-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o título…" style={{ fontSize: '0.75rem', padding: '4px 10px' }} />
          </div>
          {(() => {
            const activeCount = (filterFaccion ? 1 : 0) + (filterEstado ? 1 : 0);
            const active = activeCount > 0;
            return (
              <button onClick={() => setShowFilters(v => !v)} style={{ padding: '5px 11px', borderRadius: '2px', cursor: 'pointer', background: showFilters ? 'rgba(0,212,255,0.1)' : 'transparent', border: `1px solid ${active ? 'rgba(0,212,255,0.55)' : showFilters ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.28)'}`, color: active ? 'rgba(0,212,255,0.9)' : showFilters ? 'rgba(0,212,255,0.75)' : 'rgba(0,212,255,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                FILTROS{active ? ` (${activeCount})` : ''}&nbsp;<span style={{ fontSize: '0.45rem', opacity: 0.7 }}>{showFilters ? '▲' : '▼'}</span>
              </button>
            );
          })()}
          {isEditor && (
            <button onClick={openAdd} className="cyber-btn" style={{ padding: '5px 14px', fontSize: '0.58rem', letterSpacing: '0.1em', flexShrink: 0 }}>
              + NUEVO
            </button>
          )}
        </div>

        {/* Fila 2: filtros (colapsable) */}
        {showFilters && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '9px', flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em', flexShrink: 0 }}>FACCIÓN:</span>
          {FACCIONES.map(f => {
            const col = FACCION_COLOR[f] || '#aaa';
            const sel = filterFaccion === f;
            return (
              <button key={f} onClick={() => setFilterFaccion(sel ? null : f)} style={{ padding: '2px 9px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'aa' : col + '33'}`, background: sel ? `${col}18` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.05em' }}>
                {f}
              </button>
            );
          })}
          <div style={{ width: '1px', height: '14px', background: 'rgba(0,212,255,0.14)', flexShrink: 0 }} />
          <span style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em', flexShrink: 0 }}>ESTADO:</span>
          {ESTADOS.map(s => {
            const col = ESTADO_COLOR[s];
            const sel = filterEstado === s;
            return (
              <button key={s} onClick={() => setFilterEstado(sel ? null : s)} style={{ padding: '2px 9px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'aa' : col + '33'}`, background: sel ? `${col}12` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: col, opacity: sel ? 1 : 0.4 }} />
                {s}
              </button>
            );
          })}
          {(filterFaccion || filterEstado) && (
            <button onClick={() => { setFilterFaccion(null); setFilterEstado(null); }} style={{ padding: '2px 7px', background: 'transparent', border: '1px solid rgba(0,212,255,0.18)', color: 'rgba(0,212,255,0.38)', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', cursor: 'pointer', borderRadius: '2px' }}>
              ✕ LIMPIAR
            </button>
          )}
        </div>
        )}
      </div>

      {/* ══ CONTENIDO: cuadrícula + panel derecho ════════════════════════ */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

        {/* Cuadrícula */}
        <div style={{ flexShrink: 0, minHeight: 0, width: selectedChar ? '42%' : '100%', transition: 'width 0.35s ease', overflowY: 'auto', borderRight: selectedChar ? '1px solid rgba(0,212,255,0.1)' : 'none', padding: '14px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '60px', color: 'rgba(0,212,255,0.22)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
              {catalogCharacters.length === 0 ? 'NO HAY PERSONAJES REGISTRADOS' : 'SIN RESULTADOS'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {filtered.map(c => (
                <CharCard
                  key={c.id}
                  char={c}
                  isSelected={selectedId === c.id}
                  onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel detalle */}
        {selectedChar && (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', padding: '10px', animation: 'tl-detail-in 0.3s ease-out' }}>
            <CharDetailPanel
              char={selectedChar}
              isEditor={isEditor}
              timelineEvents={timelineEvents}
              onEdit={() => openEdit(selectedChar)}
              onDelete={handleDelete}
              onNavigateToEvent={onNavigateToEvent}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && editingChar && (
        <CharModal char={editingChar} onSave={handleSave} onClose={() => { setShowModal(false); setEditingChar(null); }} />
      )}
    </div>
  );
}
