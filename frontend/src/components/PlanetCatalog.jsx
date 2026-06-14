import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── Constantes ────────────────────────────────────────────────────────────

const SITUACIONES  = ['Núcleo', 'Borde Medio', 'Borde Exterior', 'Desconocido'];
const TIPOS_PLANETA = ['mundo helado', 'desierto', 'selva', 'urbano', 'estación espacial'];

const SITUACION_COLOR = {
  'Núcleo':         '#ffffff',
  'Borde Medio':    '#00d4ff',
  'Borde Exterior': '#5bc8e8',
  'Desconocido':    '#4a5568',
};

const TIPO_COLOR = {
  'mundo helado':       '#88ccff',
  'desierto':           '#ffa844',
  'selva':              '#44cc77',
  'urbano':             '#cc88ff',
  'estación espacial':  '#ccddff',
};

// Zonas en % de mitad del mapa (radio desde centro 50,50)
const ZONE_RADII = { nucleo: 10, bordeMedio: 22.5, bordeExterior: 35 };

// ── Utilidades ────────────────────────────────────────────────────────────

function distanceFromCenter(x, y) {
  return Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
}

function zoneFromCoords(x, y) {
  const d = distanceFromCenter(x, y);
  if (d < ZONE_RADII.nucleo)        return 'Núcleo';
  if (d < ZONE_RADII.bordeMedio)    return 'Borde Medio';
  if (d < ZONE_RADII.bordeExterior) return 'Borde Exterior';
  return 'Desconocido';
}

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

// ── Placeholder planeta ───────────────────────────────────────────────────

function PlanetPlaceholder({ size = '70%' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <circle cx="50" cy="50" r="28" stroke="rgba(0,212,255,0.6)" strokeWidth="1.5" fill="rgba(0,212,255,0.04)" />
      <ellipse cx="50" cy="50" rx="44" ry="11" stroke="rgba(0,212,255,0.4)" strokeWidth="1.2" />
      <path d="M24 40 Q50 36 76 40" stroke="rgba(0,212,255,0.25)" strokeWidth="1" />
      <path d="M22 50 Q50 46 78 50" stroke="rgba(0,212,255,0.25)" strokeWidth="1" />
      <path d="M24 60 Q50 56 76 60" stroke="rgba(0,212,255,0.25)" strokeWidth="1" />
      <circle cx="50" cy="50" r="28" stroke="rgba(0,212,255,0.08)" strokeWidth="10" />
    </svg>
  );
}

// ── Imagen holográfica del planeta ────────────────────────────────────────

function HoloImage({ src, nombre }) {
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div
        style={{ position: 'relative', paddingBottom: '100%', overflow: 'visible', cursor: src ? 'zoom-in' : 'default', animation: 'holo-flicker 11s ease-in-out infinite', maskImage: 'radial-gradient(ellipse 88% 88% at 50% 38%, black 15%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.08) 60%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 88% 88% at 50% 38%, black 15%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.08) 60%, transparent 75%)' }}
        onMouseEnter={() => src && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => src && setLightbox(true)}
      >
        {src ? (
          <img src={src} alt={nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(1.15) contrast(1.4) saturate(0)' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,10,25,0.8)' }}>
            <PlanetPlaceholder size="70%" />
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
      <div style={{ position: 'relative', height: '54px', marginTop: '-20px', overflow: 'visible' }}>
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', width: '90%', height: '55px', background: 'linear-gradient(to top, rgba(0,220,255,0.32) 0%, rgba(0,180,255,0.1) 60%, transparent 100%)', clipPath: 'polygon(18% 100%, 82% 100%, 100% 0%, 0% 0%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '78%', height: '18px', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.55)', background: 'rgba(0,212,255,0.06)', boxShadow: '0 0 22px rgba(0,212,255,0.55), inset 0 0 12px rgba(0,212,255,0.18)', animation: 'holo-proj-pulse 2.5s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '7px', left: '50%', transform: 'translateX(-50%)', width: '32%', height: '8px', borderRadius: '50%', background: 'rgba(0,220,255,0.7)', boxShadow: '0 0 18px rgba(0,212,255,0.95), 0 0 36px rgba(0,212,255,0.5)', animation: 'holo-proj-pulse 2.5s ease-in-out infinite', pointerEvents: 'none' }} />
      </div>

      {lightbox && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setLightbox(false)}>
          <img src={src} alt={nombre} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', display: 'block', borderRadius: '2px', boxShadow: '0 0 60px rgba(0,212,255,0.15)' }} />
          <button onClick={e => { e.stopPropagation(); setLightbox(false); }} style={{ position: 'absolute', top: '20px', right: '24px', background: 'transparent', border: '1px solid rgba(0,212,255,0.4)', color: 'rgba(0,212,255,0.7)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', padding: '6px 14px', cursor: 'pointer', borderRadius: '2px' }}>✕ CERRAR</button>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Mini-mapa para el modal ───────────────────────────────────────────────

function MiniMap({ posX, posY, onPickPosition }) {
  const mapRef = useRef(null);

  const handleClick = (e) => {
    if (!onPickPosition) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    onPickPosition(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  return (
    <div ref={mapRef} onClick={handleClick} style={{ position: 'relative', paddingBottom: '100%', background: 'radial-gradient(ellipse at center, rgba(0,20,50,1) 0%, rgba(0,5,15,1) 100%)', border: '1px solid rgba(0,212,255,0.35)', borderRadius: '3px', overflow: 'hidden', cursor: onPickPosition ? 'crosshair' : 'default' }}>
      {/* Cuadrícula sutil */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)', backgroundSize: '10% 10%', pointerEvents: 'none' }} />

      {/* Zonas concéntricas */}
      {[
        { r: ZONE_RADII.bordeExterior * 2, color: 'rgba(0,212,255,0.18)', label: 'BORDE EXT.', glow: '0 0 20px rgba(0,212,255,0.12)' },
        { r: ZONE_RADII.bordeMedio    * 2, color: 'rgba(0,180,255,0.28)', label: 'BORDE MED.', glow: '0 0 16px rgba(0,180,255,0.2)' },
        { r: ZONE_RADII.nucleo        * 2, color: 'rgba(255,255,255,0.5)', label: 'NÚCLEO',     glow: '0 0 20px rgba(255,255,255,0.3)' },
      ].map(({ r, color, label, glow }) => (
        <div key={label} style={{ position: 'absolute', width: `${r}%`, height: `${r}%`, borderRadius: '50%', border: `1px solid ${color}`, boxShadow: glow, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
      ))}

      {/* Punto de posición elegida */}
      {posX !== undefined && posY !== undefined && (
        <div style={{ position: 'absolute', left: `${posX}%`, top: `${posY}%`, transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(0,212,255,0.9)', boxShadow: '0 0 12px rgba(0,212,255,0.9), 0 0 24px rgba(0,212,255,0.4)', pointerEvents: 'none', zIndex: 5 }} />
      )}

      {onPickPosition && (
        <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'Orbitron, monospace', fontSize: '0.48rem', color: 'rgba(0,212,255,0.45)', letterSpacing: '0.08em', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          HAZ CLIC PARA POSICIONAR
        </div>
      )}
    </div>
  );
}

// ── Modal de creación/edición ─────────────────────────────────────────────

function PlanetModal({ planet, onSave, onClose }) {
  const [nombre,      setNombre]      = useState(planet.nombre || '');
  const [descripcion, setDescripcion] = useState(planet.descripcion || '');
  const [situacion,   setSituacion]   = useState(planet.situacion || 'Desconocido');
  const [tipo,        setTipo]        = useState(planet.tipo || null);
  const [imagen,      setImagen]      = useState(planet.imagen || null);
  const [posX,        setPosX]        = useState(planet.posX ?? 50);
  const [posY,        setPosY]        = useState(planet.posY ?? 50);
  const [imgLoading,  setImgLoading]  = useState(false);
  const [manualSit,   setManualSit]   = useState(false);
  const fileRef = useRef(null);

  const handlePickPosition = (x, y) => {
    setPosX(x);
    setPosY(y);
    if (!manualSit) setSituacion(zoneFromCoords(x, y));
  };

  const handleSituacionManual = (s) => {
    setSituacion(s);
    setManualSit(true);
  };

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
    onSave({ nombre: nombre.trim(), descripcion: descripcion.trim(), situacion, tipo, imagen, posX, posY });
  };

  const lbl = { display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.48)', marginBottom: '6px' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0d0d14', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '4px', padding: '24px', width: '100%', maxWidth: '640px', boxShadow: '0 0 40px rgba(0,212,255,0.12)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.8)', marginBottom: '20px' }}>
          {planet.id ? 'EDITAR PLANETA' : 'NUEVO PLANETA'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Columna izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>NOMBRE *</label>
                <input className="cyber-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del planeta…" autoFocus />
              </div>

              <div>
                <label style={lbl}>TIPO DE MUNDO</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {TIPOS_PLANETA.map(t => {
                    const col = TIPO_COLOR[t] || '#aaa';
                    const sel = tipo === t;
                    return (
                      <button key={t} type="button" onClick={() => setTipo(sel ? null : t)} style={{ padding: '3px 9px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'cc' : col + '33'}`, background: sel ? `${col}18` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.06em' }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={lbl}>SITUACIÓN {manualSit && <span style={{ opacity: 0.5 }}>(manual)</span>}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {SITUACIONES.map(s => {
                    const col = SITUACION_COLOR[s] || '#aaa';
                    const sel = situacion === s;
                    return (
                      <button key={s} type="button" onClick={() => handleSituacionManual(s)} style={{ padding: '3px 9px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'cc' : col + '33'}`, background: sel ? `${col}18` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.05em' }}>
                        {s}
                      </button>
                    );
                  })}
                  {manualSit && (
                    <button type="button" onClick={() => { setManualSit(false); setSituacion(zoneFromCoords(posX, posY)); }} style={{ padding: '2px 7px', background: 'transparent', border: '1px solid rgba(0,212,255,0.18)', color: 'rgba(0,212,255,0.38)', fontFamily: 'Orbitron, monospace', fontSize: '0.48rem', cursor: 'pointer', borderRadius: '2px' }}>
                      ↩ AUTO
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={lbl}>DESCRIPCIÓN</label>
                <textarea className="cyber-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción del planeta…" rows={4} style={{ resize: 'vertical', minHeight: '80px' }} />
              </div>

              <div>
                <label style={lbl}>IMAGEN</label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
                {imagen ? (
                  <div>
                    <img src={imagen} alt="" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'cover', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '2px', display: 'block' }} />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <button type="button" onClick={() => fileRef.current?.click()} className="cyber-btn" style={{ padding: '3px 10px', fontSize: '0.55rem' }}>CAMBIAR</button>
                      <button type="button" onClick={() => setImagen(null)} className="cyber-btn" style={{ padding: '3px 10px', fontSize: '0.55rem', borderColor: 'rgba(255,68,68,0.4)', color: 'rgba(255,68,68,0.6)' }}>QUITAR</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={imgLoading} style={{ background: 'rgba(0,212,255,0.03)', border: '1px dashed rgba(0,212,255,0.28)', color: 'rgba(0,212,255,0.48)', fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', padding: '10px', cursor: 'pointer', width: '100%', borderRadius: '2px' }}>
                    {imgLoading ? 'PROCESANDO…' : '+ IMAGEN'}
                  </button>
                )}
              </div>
            </div>

            {/* Columna derecha: mini-mapa */}
            <div>
              <label style={lbl}>POSICIÓN EN EL MAPA</label>
              <MiniMap posX={posX} posY={posY} onPickPosition={handlePickPosition} />
              <div style={{ marginTop: '6px', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: 'rgba(0,212,255,0.4)', textAlign: 'center' }}>
                X: {posX.toFixed(1)}% · Y: {posY.toFixed(1)}%
              </div>
              <div style={{ marginTop: '4px', textAlign: 'center' }}>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', color: SITUACION_COLOR[situacion] || '#aaa', letterSpacing: '0.1em' }}>
                  ◆ {situacion}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} className="cyber-btn" style={{ padding: '6px 18px', fontSize: '0.6rem', borderColor: 'rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.5)' }}>CANCELAR</button>
            <button type="submit" className="cyber-btn" style={{ padding: '6px 22px', fontSize: '0.6rem' }}>{planet.id ? 'GUARDAR' : 'CREAR'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Panel de detalle del planeta ──────────────────────────────────────────

function PlanetDetailPanel({ planet, isEditor, timelineEvents, onEdit, onDelete, onNavigateToEvent, onClose }) {
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDel = () => {
    if (confirmDel) onDelete();
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
  };

  const linkedEvents = timelineEvents.filter(ev => (ev.linkedPlanets || []).includes(planet.id));
  const sitColor = SITUACION_COLOR[planet.situacion] || '#aaa';
  const tipoColor = planet.tipo ? (TIPO_COLOR[planet.tipo] || '#aaa') : null;

  return (
    <div style={{
      position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)',
      width: '340px', maxHeight: '85%',
      background: 'rgba(0,5,18,0.92)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0,212,255,0.55)',
      boxShadow: '0 0 40px rgba(0,212,255,0.18), inset 0 0 60px rgba(0,140,255,0.04)',
      borderRadius: '3px',
      display: 'flex', flexDirection: 'column',
      animation: 'holo-flicker 9s ease-in-out infinite',
      zIndex: 10,
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.008) 3px, rgba(0,212,255,0.008) 4px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(0,212,255,0.1)', flexShrink: 0, zIndex: 3, position: 'relative' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(0,212,255,0.38)' }}>◈ DATOS PLANETARIOS</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {isEditor && (
            <>
              <button onClick={onEdit} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.25)', color: 'rgba(0,212,255,0.6)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 8px', cursor: 'pointer', borderRadius: '2px' }}>EDITAR</button>
              <button onClick={handleDel} style={{ background: confirmDel ? 'rgba(255,68,68,0.12)' : 'transparent', border: `1px solid ${confirmDel ? 'rgba(255,68,68,0.55)' : 'rgba(255,68,68,0.22)'}`, color: confirmDel ? '#ff4444' : 'rgba(255,68,68,0.55)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 8px', cursor: 'pointer', borderRadius: '2px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {confirmDel ? '¿OK?' : 'BORRAR'}
              </button>
            </>
          )}
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 8px', cursor: 'pointer', borderRadius: '2px' }}>✕</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', position: 'relative', zIndex: 3 }}>
        {/* Imagen holo */}
        <div style={{ marginBottom: '4px' }}>
          <HoloImage src={planet.imagen} nombre={planet.nombre} />
        </div>

        {/* Nombre */}
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(0,220,255,0.95)', textShadow: '0 0 18px rgba(0,212,255,0.5)', marginBottom: '10px', lineHeight: 1.3, textAlign: 'center' }}>
          {planet.nombre}
        </div>

        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center', marginBottom: '12px' }}>
          <span style={{ padding: '2px 10px', borderRadius: '2px', border: `1px solid ${sitColor}66`, background: `${sitColor}12`, color: sitColor, fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
            ◆ {planet.situacion}
          </span>
          {tipoColor && (
            <span style={{ padding: '2px 10px', borderRadius: '2px', border: `1px solid ${tipoColor}55`, background: `${tipoColor}10`, color: tipoColor, fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', letterSpacing: '0.08em' }}>
              {planet.tipo}
            </span>
          )}
        </div>

        {/* Coordenadas */}
        <div style={{ textAlign: 'center', fontFamily: 'Orbitron, monospace', fontSize: '0.48rem', color: 'rgba(0,212,255,0.3)', marginBottom: '12px', letterSpacing: '0.1em' }}>
          X: {(planet.posX || 0).toFixed(1)}% · Y: {(planet.posY || 0).toFixed(1)}%
        </div>

        {/* Divisor */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(0,212,255,0.45), rgba(0,212,255,0.1), transparent)', marginBottom: '12px' }} />

        {/* Descripción */}
        {planet.descripcion ? (
          <div style={{ color: 'rgba(180,225,255,0.82)', fontSize: '0.85rem', lineHeight: 1.7, fontFamily: 'Rajdhani, sans-serif', whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
            {planet.descripcion}
          </div>
        ) : (
          <div style={{ color: 'rgba(0,212,255,0.22)', fontSize: '0.75rem', fontStyle: 'italic', fontFamily: 'Rajdhani, sans-serif', marginBottom: '14px' }}>
            Sin descripción registrada.
          </div>
        )}

        {/* Eventos vinculados */}
        {linkedEvents.length > 0 && (
          <>
            <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(0,212,255,0.3), transparent)', marginBottom: '10px' }} />
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.38)', marginBottom: '7px' }}>
              EVENTOS VINCULADOS ({linkedEvents.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {linkedEvents.map(ev => (
                <button key={ev.id} onClick={() => onNavigateToEvent(ev.id)} style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '2px', padding: '5px 9px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: ev.nivel === 'legendario' ? '#ffd700' : 'rgba(0,212,255,0.7)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', color: 'rgba(0,212,255,0.75)', letterSpacing: '0.04em', flex: 1 }}>{ev.nombre}</span>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.48rem', color: 'rgba(0,212,255,0.35)' }}>→</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function PlanetCatalog({ isEditor, planets, timelineEvents, onAdd, onUpdate, onDelete, onNavigateToEvent, onBack, initialSelectedId }) {
  const [selectedId,  setSelectedId]  = useState(initialSelectedId || null);
  const [hoveredId,   setHoveredId]   = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [editingPl,   setEditingPl]   = useState(null);
  const [tooltip,     setTooltip]     = useState({ visible: false, x: 0, y: 0, name: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [filterZone,  setFilterZone]  = useState(null);
  const [filterTipo,  setFilterTipo]  = useState(null);

  const selectedPlanet  = selectedId ? planets.find(p => p.id === selectedId) ?? null : null;
  const activeFilters   = (filterZone ? 1 : 0) + (filterTipo ? 1 : 0);
  const visiblePlanets  = planets.filter(p => {
    const zf = !filterZone || p.situacion === filterZone;
    const tf = !filterTipo  || p.tipo      === filterTipo;
    return zf && tf;
  });

  const openAdd  = () => { setEditingPl({ nombre: '', descripcion: '', situacion: 'Desconocido', tipo: null, imagen: null, posX: 50, posY: 50 }); setShowModal(true); };
  const openEdit = (pl) => { setEditingPl({ ...pl }); setShowModal(true); };

  const handleSave = (data) => {
    if (editingPl.id) onUpdate(editingPl.id, data);
    else onAdd(data);
    setShowModal(false);
    setEditingPl(null);
  };

  const handleDelete = () => {
    onDelete(selectedId);
    setSelectedId(null);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>

      {/* ══ CABECERA ══════════════════════════════════════════════════════ */}
      <div style={{ flexShrink: 0, padding: '0 18px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>

        {/* Fila 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px', paddingBottom: '10px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.58)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '5px 11px', cursor: 'pointer', letterSpacing: '0.08em', flexShrink: 0, borderRadius: '2px' }}>
            ← VOLVER
          </button>
          <span style={{ color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', flexShrink: 0 }}>
            MESA HOLOGRÁFICA — MAPA GALÁCTICO
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', color: 'rgba(0,212,255,0.35)', letterSpacing: '0.08em', flexShrink: 0 }}>
            {visiblePlanets.length}/{planets.length} PLANETA{planets.length !== 1 ? 'S' : ''}
          </span>
          <button onClick={() => setShowFilters(v => !v)} style={{ padding: '4px 11px', borderRadius: '2px', cursor: 'pointer', background: showFilters ? 'rgba(0,212,255,0.1)' : 'transparent', border: `1px solid ${activeFilters > 0 ? 'rgba(0,212,255,0.55)' : showFilters ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.28)'}`, color: activeFilters > 0 ? 'rgba(0,212,255,0.9)' : showFilters ? 'rgba(0,212,255,0.75)' : 'rgba(0,212,255,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            FILTROS{activeFilters > 0 ? ` (${activeFilters})` : ''}&nbsp;<span style={{ fontSize: '0.45rem', opacity: 0.7 }}>{showFilters ? '▲' : '▼'}</span>
          </button>
          {isEditor && (
            <button onClick={openAdd} className="cyber-btn" style={{ padding: '5px 14px', fontSize: '0.58rem', letterSpacing: '0.1em', flexShrink: 0 }}>
              + NUEVO
            </button>
          )}
        </div>

        {/* Fila 2: filtros colapsables */}
        {showFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '9px', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em', flexShrink: 0 }}>ZONA:</span>
            {SITUACIONES.map(s => {
              const col = SITUACION_COLOR[s] || '#aaa';
              const sel = filterZone === s;
              return (
                <button key={s} onClick={() => setFilterZone(sel ? null : s)} style={{ padding: '2px 9px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'cc' : col + '33'}`, background: sel ? `${col}18` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.05em' }}>
                  {s}
                </button>
              );
            })}
            <div style={{ width: '1px', height: '14px', background: 'rgba(0,212,255,0.14)', flexShrink: 0 }} />
            <span style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em', flexShrink: 0 }}>TIPO:</span>
            {TIPOS_PLANETA.map(t => {
              const col = TIPO_COLOR[t] || '#aaa';
              const sel = filterTipo === t;
              return (
                <button key={t} onClick={() => setFilterTipo(sel ? null : t)} style={{ padding: '2px 9px', borderRadius: '2px', cursor: 'pointer', border: `1px solid ${sel ? col + 'cc' : col + '33'}`, background: sel ? `${col}18` : 'transparent', color: sel ? col : `${col}66`, fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.06em' }}>
                  {t}
                </button>
              );
            })}
            {activeFilters > 0 && (
              <button onClick={() => { setFilterZone(null); setFilterTipo(null); }} style={{ padding: '2px 7px', background: 'transparent', border: '1px solid rgba(0,212,255,0.18)', color: 'rgba(0,212,255,0.38)', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', cursor: 'pointer', borderRadius: '2px' }}>
                ✕ LIMPIAR
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══ MAPA HOLOGRÁFICO ════════════════════════════════════════════ */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Fondo del mapa */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,25,60,1) 0%, rgba(0,8,25,1) 55%, rgba(0,2,10,1) 100%)' }} />

        {/* Cuadrícula holográfica */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)', backgroundSize: '5% 5%', pointerEvents: 'none' }} />

        {/* Scanlines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.015) 3px, rgba(0,212,255,0.015) 4px)', pointerEvents: 'none' }} />

        {/* Contenedor cuadrado centrado para las zonas concéntricas */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ position: 'relative', width: 'min(100%, 100vh)', aspectRatio: '1' }}>
            {/* Zona Desconocido: área exterior, solo borde del Borde Exterior */}
            {/* Borde Exterior */}
            <div style={{ position: 'absolute', width: `${ZONE_RADII.bordeExterior * 2}%`, height: `${ZONE_RADII.bordeExterior * 2}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid rgba(91,200,232,0.35)', background: 'rgba(91,200,232,0.03)', boxShadow: '0 0 30px rgba(91,200,232,0.12), inset 0 0 30px rgba(91,200,232,0.05)' }} />
            {/* Borde Medio */}
            <div style={{ position: 'absolute', width: `${ZONE_RADII.bordeMedio * 2}%`, height: `${ZONE_RADII.bordeMedio * 2}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid rgba(0,180,255,0.5)', background: 'rgba(0,180,255,0.04)', boxShadow: '0 0 25px rgba(0,180,255,0.2), inset 0 0 20px rgba(0,180,255,0.06)' }} />
            {/* Núcleo */}
            <div style={{ position: 'absolute', width: `${ZONE_RADII.nucleo * 2}%`, height: `${ZONE_RADII.nucleo * 2}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.06)', boxShadow: '0 0 30px rgba(255,255,255,0.25), inset 0 0 15px rgba(255,255,255,0.1)' }} />
            {/* Punto central */}
            <div style={{ position: 'absolute', width: '6px', height: '6px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.3)', animation: 'holo-proj-pulse 2.5s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Planetas */}
        {visiblePlanets.map(pl => {
          const isSelected = selectedId === pl.id;
          const isHovered  = hoveredId  === pl.id;
          const sitColor   = SITUACION_COLOR[pl.situacion] || '#00d4ff';
          const tipoColor  = pl.tipo ? (TIPO_COLOR[pl.tipo] || '#00d4ff') : sitColor;

          return (
            <div
              key={pl.id}
              style={{
                position: 'absolute',
                left: `${pl.posX}%`,
                top: `${pl.posY}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 8 : isHovered ? 7 : 6,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                setHoveredId(pl.id);
                setTooltip({ visible: true, x: e.clientX, y: e.clientY, name: pl.nombre });
              }}
              onMouseMove={(e) => setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
              onMouseLeave={() => { setHoveredId(null); setTooltip(t => ({ ...t, visible: false })); }}
              onClick={() => setSelectedId(isSelected ? null : pl.id)}
            >
              {/* Esfera holográfica */}
              <div style={{
                width: isSelected ? '22px' : isHovered ? '18px' : '14px',
                height: isSelected ? '22px' : isHovered ? '18px' : '14px',
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${tipoColor}cc, ${tipoColor}55 60%, ${tipoColor}22)`,
                border: `1.5px solid ${tipoColor}`,
                boxShadow: isSelected
                  ? `0 0 20px ${tipoColor}, 0 0 40px ${tipoColor}66`
                  : `0 0 10px ${tipoColor}88, 0 0 20px ${tipoColor}33`,
                transition: 'all 0.2s',
                animation: 'holo-proj-pulse 3s ease-in-out infinite',
              }} />
            </div>
          );
        })}

        {/* Tooltip */}
        {tooltip.visible && createPortal(
          <div style={{ position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 28, zIndex: 9999, background: 'rgba(0,5,18,0.92)', border: '1px solid rgba(0,212,255,0.5)', borderRadius: '2px', padding: '4px 10px', fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', color: 'rgba(0,212,255,0.9)', letterSpacing: '0.08em', pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 0 14px rgba(0,212,255,0.3)' }}>
            {tooltip.name}
          </div>,
          document.body
        )}

        {/* Panel de detalle del planeta seleccionado (overlay sobre el mapa) */}
        {selectedPlanet && (
          <PlanetDetailPanel
            planet={selectedPlanet}
            isEditor={isEditor}
            timelineEvents={timelineEvents}
            onEdit={() => openEdit(selectedPlanet)}
            onDelete={handleDelete}
            onNavigateToEvent={onNavigateToEvent}
            onClose={() => setSelectedId(null)}
          />
        )}

        {/* Instrucción cuando no hay planetas */}
        {planets.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(0,212,255,0.22)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', marginBottom: '8px' }}>
                NO HAY PLANETAS CARTOGRAFIADOS
              </div>
              {isEditor && (
                <div style={{ color: 'rgba(0,212,255,0.15)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em' }}>
                  USA EL BOTÓN + NUEVO PARA AÑADIR
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && editingPl && (
        <PlanetModal planet={editingPl} onSave={handleSave} onClose={() => { setShowModal(false); setEditingPl(null); }} />
      )}
    </div>
  );
}
