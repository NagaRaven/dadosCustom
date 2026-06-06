import { useState, useRef, useEffect } from 'react';

// ── Constantes ────────────────────────────────────────────────────────────

const PRESET_TAGS = ['batalla', 'diplomacia', 'traición', 'muerte', 'descubrimiento'];
const TAG_COLORS = {
  batalla:        '#ff4444',
  diplomacia:     '#00d4ff',
  traición:       '#c084fc',
  muerte:         '#888',
  descubrimiento: '#ffd700',
};
const TEMPORADA_COLORS = { 1: '#5bc8e8', 2: '#ffd700', 3: '#ff7043' };

const tagColor  = (t) => TAG_COLORS[t] || '#a0b0c0';
const tempColor = (t) => TEMPORADA_COLORS[t] || '#aaa';

// ── Compresión de imagen ──────────────────────────────────────────────────

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

// ── Dropdown de tags ──────────────────────────────────────────────────────

function TagsDropdown({ allTags, filterTags, onToggle, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const active = filterTags.length > 0;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
        border: `1px solid ${active ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.28)'}`,
        color: active ? 'rgba(0,212,255,0.9)' : 'rgba(0,212,255,0.5)',
        fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em',
        padding: '4px 11px', cursor: 'pointer', borderRadius: '2px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        TAGS{active ? ` (${filterTags.length})` : ''}&nbsp;
        <span style={{ fontSize: '0.45rem', opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          background: '#0d0d18', border: '1px solid rgba(0,212,255,0.28)',
          borderRadius: '3px', padding: '8px', minWidth: '170px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column', gap: '3px',
        }}>
          {allTags.length === 0 && (
            <div style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', padding: '4px 8px' }}>Sin tags disponibles</div>
          )}
          {allTags.map(t => (
            <button key={t} onClick={() => onToggle(t)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: filterTags.includes(t) ? `${tagColor(t)}15` : 'transparent',
              border: `1px solid ${filterTags.includes(t) ? tagColor(t) + '44' : 'transparent'}`,
              color: filterTags.includes(t) ? tagColor(t) : 'rgba(0,212,255,0.6)',
              padding: '5px 8px', borderRadius: '2px', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', letterSpacing: '0.06em',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tagColor(t), flexShrink: 0 }} />
              {t}
              {filterTags.includes(t) && <span style={{ marginLeft: 'auto', fontSize: '0.55rem', opacity: 0.7 }}>✓</span>}
            </button>
          ))}
          {active && (
            <button onClick={() => { onClear(); setOpen(false); }} style={{
              marginTop: '4px', padding: '4px 8px', background: 'transparent',
              border: '1px solid rgba(0,212,255,0.18)', color: 'rgba(0,212,255,0.4)',
              fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', cursor: 'pointer', borderRadius: '2px',
            }}>
              ✕ Limpiar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────

function EventModal({ event, onSave, onClose }) {
  const [nombre,       setNombre]       = useState(event.nombre || '');
  const [descripcion,  setDescripcion]  = useState(event.descripcion || '');
  const [tags,         setTags]         = useState(event.tags || []);
  const [customTag,    setCustomTag]    = useState('');
  const [temporada,    setTemporada]    = useState(event.temporada ?? null);
  const [imagen,       setImagen]       = useState(event.imagen || null);
  const [imgLoading,   setImgLoading]   = useState(false);
  const fileRef = useRef(null);

  const toggleTag = (t) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const addCustom = () => {
    const t = customTag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setCustomTag('');
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
    onSave({ nombre: nombre.trim(), descripcion: descripcion.trim(), tags, temporada, imagen });
  };

  const lbl = { display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.48)', marginBottom: '6px' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0d0d14', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '4px', padding: '24px', width: '100%', maxWidth: '560px', boxShadow: '0 0 40px rgba(0,212,255,0.12)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.8)', marginBottom: '20px' }}>
          {event.id ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Nombre */}
          <div>
            <label style={lbl}>NOMBRE *</label>
            <input className="cyber-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del evento..." autoFocus />
          </div>

          {/* Temporada */}
          <div>
            <label style={lbl}>TEMPORADA</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[null, 1, 2, 3].map(v => (
                <button key={String(v)} type="button" onClick={() => setTemporada(temporada === v ? null : v)}
                  style={{
                    padding: '5px 14px', borderRadius: '2px',
                    border: `1px solid ${v ? tempColor(v) + (temporada === v ? 'cc' : '44') : 'rgba(0,212,255,0.3)'}`,
                    background: temporada === v ? (v ? `${tempColor(v)}22` : 'rgba(0,212,255,0.08)') : 'transparent',
                    color: temporada === v ? (v ? tempColor(v) : 'rgba(0,212,255,0.8)') : (v ? `${tempColor(v)}66` : 'rgba(0,212,255,0.38)'),
                    fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', cursor: 'pointer',
                  }}>
                  {v === null ? 'NINGUNA' : `T${v}`}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={lbl}>DESCRIPCIÓN</label>
            <textarea className="cyber-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción del evento..." rows={4} style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>

          {/* Tags */}
          <div>
            <label style={lbl}>TAGS</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {PRESET_TAGS.map(t => (
                <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                  padding: '3px 10px', borderRadius: '2px',
                  border: `1px solid ${tagColor(t)}${tags.includes(t) ? 'cc' : '44'}`,
                  background: tags.includes(t) ? `${tagColor(t)}20` : 'transparent',
                  color: tags.includes(t) ? tagColor(t) : `${tagColor(t)}77`,
                  fontSize: '0.6rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.07em', cursor: 'pointer',
                }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
              {tags.filter(t => !PRESET_TAGS.includes(t)).map(t => (
                <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                  padding: '2px 8px', borderRadius: '2px', border: `1px solid ${tagColor(t)}44`,
                  background: `${tagColor(t)}15`, color: tagColor(t), fontSize: '0.6rem',
                  fontFamily: 'Orbitron, monospace', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {t} <span style={{ opacity: 0.55 }}>×</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="cyber-input" value={customTag} onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                placeholder="Tag personalizado…" style={{ fontSize: '0.8rem', padding: '5px 10px' }} />
              <button type="button" onClick={addCustom} className="cyber-btn" style={{ padding: '5px 14px', fontSize: '0.6rem', whiteSpace: 'nowrap' }}>+ ADD</button>
            </div>
          </div>

          {/* Imagen */}
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
              <button type="button" onClick={() => fileRef.current?.click()} disabled={imgLoading}
                style={{ background: 'rgba(0,212,255,0.03)', border: '1px dashed rgba(0,212,255,0.28)', color: 'rgba(0,212,255,0.48)', fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', padding: '12px 20px', cursor: 'pointer', width: '100%', borderRadius: '2px' }}>
                {imgLoading ? 'PROCESANDO…' : '+ SUBIR IMAGEN'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} className="cyber-btn" style={{ padding: '6px 18px', fontSize: '0.6rem', borderColor: 'rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.5)' }}>CANCELAR</button>
            <button type="submit" className="cyber-btn" style={{ padding: '6px 22px', fontSize: '0.6rem' }}>{event.id ? 'GUARDAR' : 'CREAR'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Panel de detalle holográfico ──────────────────────────────────────────

function DetailPanel({ event, isEditor, onClose, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDel = () => {
    if (confirmDel) { onDelete(); }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000); }
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
      background: 'linear-gradient(175deg, rgba(0,10,22,0.98) 0%, rgba(0,5,14,0.99) 100%)',
      border: '1px solid rgba(0,212,255,0.55)',
      boxShadow: '0 0 40px rgba(0,212,255,0.14), inset 0 0 60px rgba(0,140,255,0.04)',
      overflow: 'hidden',
      animation: 'holo-flicker 9s ease-in-out infinite',
    }}>
      {/* scan lines overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.008) 3px, rgba(0,212,255,0.008) 4px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* HUD corners */}
      <div className="hud-corners-full" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

      {/* Moving scan line */}
      <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent 5%, rgba(0,212,255,0.35) 40%, rgba(0,212,255,0.35) 60%, transparent 95%)', animation: 'holo-scan-panel 6s linear infinite', pointerEvents: 'none', zIndex: 2 }} />

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(0,212,255,0.1)', flexShrink: 0, zIndex: 3, position: 'relative' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(0,212,255,0.38)' }}>
          ◈ ARCHIVO HOLOGRÁFICO
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          {isEditor && (
            <>
              <button onClick={onEdit} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.25)', color: 'rgba(0,212,255,0.6)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 10px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.08em' }}>EDITAR</button>
              <button onClick={handleDel} style={{
                background: confirmDel ? 'rgba(255,68,68,0.12)' : 'transparent',
                border: `1px solid ${confirmDel ? 'rgba(255,68,68,0.55)' : 'rgba(255,68,68,0.22)'}`,
                color: confirmDel ? '#ff4444' : 'rgba(255,68,68,0.55)',
                fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 10px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.07em', transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                {confirmDel ? '¿CONFIRMAR?' : 'ELIMINAR'}
              </button>
            </>
          )}
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '3px 10px', cursor: 'pointer', borderRadius: '2px', letterSpacing: '0.07em' }}>✕</button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 24px', position: 'relative', zIndex: 3 }}>

        {/* Imagen */}
        {event.imagen && (
          <div style={{ position: 'relative', marginBottom: '18px', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 20px rgba(0,212,255,0.08)' }}>
            <img src={event.imagen} alt={event.nombre} style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' }} />
            {/* hologram tint */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,60,160,0.1)', mixBlendMode: 'screen', pointerEvents: 'none' }} />
          </div>
        )}

        {/* Título */}
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1rem', fontWeight: 700, color: 'rgba(0,220,255,0.95)', letterSpacing: '0.1em', lineHeight: 1.35, marginBottom: '14px', textShadow: '0 0 18px rgba(0,212,255,0.5), 0 0 40px rgba(0,212,255,0.2)' }}>
          {event.nombre}
        </div>

        {/* Meta: temporada + tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          {event.temporada && (
            <span style={{
              padding: '3px 11px', borderRadius: '2px',
              border: `1px solid ${tempColor(event.temporada)}77`,
              background: `${tempColor(event.temporada)}15`,
              color: tempColor(event.temporada),
              fontFamily: 'Orbitron, monospace', fontSize: '0.63rem', letterSpacing: '0.14em',
              textShadow: `0 0 10px ${tempColor(event.temporada)}55`,
            }}>
              TEMPORADA {event.temporada}
            </span>
          )}
          {event.tags?.map(t => (
            <span key={t} style={{
              padding: '2px 9px', borderRadius: '2px',
              border: `1px solid ${tagColor(t)}44`, background: `${tagColor(t)}15`,
              color: tagColor(t), fontSize: '0.59rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.07em',
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Divisor */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(0,212,255,0.45), rgba(0,212,255,0.1), transparent)', marginBottom: '16px' }} />

        {/* Descripción */}
        {event.descripcion ? (
          <div style={{ color: 'rgba(180,225,255,0.82)', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: 'Rajdhani, sans-serif', whiteSpace: 'pre-wrap' }}>
            {event.descripcion}
          </div>
        ) : (
          <div style={{ color: 'rgba(0,212,255,0.22)', fontSize: '0.78rem', fontStyle: 'italic', fontFamily: 'Rajdhani, sans-serif' }}>
            Sin descripción registrada.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tarjeta en la línea ───────────────────────────────────────────────────

function TimelineCard({ event, isSelected, isEditor, draggingId, onSelect, onEdit, onDragStart, onDragEnd }) {
  const isDragging = draggingId === event.id;
  return (
    <div
      draggable={isEditor}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      style={{
        background: isSelected ? 'rgba(0,212,255,0.07)' : 'rgba(13,17,23,0.92)',
        border: `1px solid ${isSelected ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.17)'}`,
        borderRadius: '3px', padding: '8px 11px',
        width: '100%', maxWidth: '220px',
        cursor: isEditor ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        transition: 'all 0.22s',
        boxShadow: isSelected ? '0 0 16px rgba(0,212,255,0.15)' : 'none',
        userSelect: 'none', opacity: isDragging ? 0.3 : 1,
      }}
    >
      {/* Miniatura */}
      {event.imagen && (
        <div style={{ marginBottom: '6px', borderRadius: '2px', overflow: 'hidden', height: '44px', border: '1px solid rgba(0,212,255,0.18)' }}>
          <img src={event.imagen} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Nombre + botón editar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color: isSelected ? 'rgba(0,212,255,1)' : 'rgba(0,212,255,0.85)', wordBreak: 'break-word', lineHeight: 1.4, flex: 1 }}>
          {event.nombre}
        </div>
        {isEditor && (
          <button onClick={e => { e.stopPropagation(); onEdit(); }} title="Editar"
            style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.48)', borderRadius: '2px', width: '17px', height: '17px', cursor: 'pointer', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ✎
          </button>
        )}
      </div>

      {/* Badges: temporada + tags */}
      {(event.temporada || event.tags?.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '5px' }}>
          {event.temporada && (
            <span style={{ padding: '1px 5px', borderRadius: '2px', border: `1px solid ${tempColor(event.temporada)}44`, background: `${tempColor(event.temporada)}12`, color: tempColor(event.temporada), fontSize: '0.52rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em' }}>
              T{event.temporada}
            </span>
          )}
          {event.tags?.map(t => (
            <span key={t} style={{ padding: '1px 5px', borderRadius: '2px', border: `1px solid ${tagColor(t)}28`, background: `${tagColor(t)}0e`, color: tagColor(t), fontSize: '0.5rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.04em' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Gap row ───────────────────────────────────────────────────────────────

function GapRow({ gapKey, isEditor, hoverGap, dragOverGap, draggingId, onMouseEnter, onMouseLeave, onAdd, onDragOver, onDrop }) {
  const isOver  = dragOverGap === gapKey && !!draggingId;
  const isHover = hoverGap === gapKey && !draggingId;
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={e => { e.preventDefault(); onDrop(); }}
      style={{ position: 'relative', height: isOver ? '44px' : isHover ? '30px' : '12px', transition: 'height 0.14s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isOver && <div style={{ position: 'absolute', left: '5%', right: '5%', top: '50%', height: '2px', background: 'rgba(0,212,255,0.7)', boxShadow: '0 0 8px rgba(0,212,255,0.5)', borderRadius: '1px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
      {isEditor && isHover && (
        <button onClick={onAdd} style={{ position: 'relative', zIndex: 3, width: '22px', height: '22px', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.6)', background: 'rgba(0,212,255,0.1)', color: 'rgba(0,212,255,0.9)', fontSize: '16px', lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,212,255,0.3)' }}>
          +
        </button>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function Timeline({ isEditor, events, onAdd, onUpdate, onDelete, onReorder, onBack }) {
  const [selectedId,      setSelectedId]      = useState(null);
  const [filterName,      setFilterName]      = useState('');
  const [filterTags,      setFilterTags]      = useState([]);
  const [filterTemporada, setFilterTemporada] = useState([]);
  const [showModal,       setShowModal]       = useState(false);
  const [editingEvent,    setEditingEvent]    = useState(null);
  const [insertPosition,  setInsertPosition]  = useState(null);
  const [hoverGap,        setHoverGap]        = useState(null);
  const [draggingId,      setDraggingId]      = useState(null);
  const [dragOverGap,     setDragOverGap]     = useState(null);

  const sorted = [...events].sort((a, b) => b.orden - a.orden);
  const allTags = [...new Set(events.flatMap(e => e.tags || []))].sort();
  const selectedEvent = selectedId ? events.find(e => e.id === selectedId) ?? null : null;

  const isMatch = (ev) => {
    const nm = !filterName || ev.nombre.toLowerCase().includes(filterName.toLowerCase());
    const tm = filterTags.length === 0 || filterTags.some(t => (ev.tags || []).includes(t));
    const sm = filterTemporada.length === 0 || filterTemporada.includes(ev.temporada);
    return nm && tm && sm;
  };

  const toggleFilterTag  = (t) => setFilterTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleFilterTemp = (t) => setFilterTemporada(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const openAddModal  = (pos) => { if (!isEditor) return; setEditingEvent({ nombre: '', descripcion: '', tags: [], temporada: null, imagen: null }); setInsertPosition(pos); setShowModal(true); };
  const openEditModal = (ev)  => { if (!isEditor) return; setEditingEvent({ ...ev }); setInsertPosition(null); setShowModal(true); };

  const handleSave = (data) => {
    if (editingEvent.id) {
      onUpdate(editingEvent.id, data);
    } else {
      let orden;
      if (sorted.length === 0) { orden = 1000; }
      else if (insertPosition === 'top') { orden = sorted[0].orden + 1000; }
      else if (insertPosition === 'bottom') { orden = sorted[sorted.length - 1].orden - 1000; }
      else {
        const ai = sorted.findIndex(e => e.id === insertPosition);
        const ab = sorted[ai], bel = sorted[ai + 1];
        orden = bel ? (ab.orden + bel.orden) / 2 : ab.orden - 1000;
      }
      onAdd({ ...data, orden });
    }
    setShowModal(false); setEditingEvent(null);
  };

  const handleDragStart = (id) => { if (!isEditor) return; setDraggingId(id); setSelectedId(null); };

  const handleDrop = (gapKey) => {
    if (!draggingId) return;
    const wo = sorted.filter(e => e.id !== draggingId);
    let newOrden;
    if (gapKey === 'top')    { newOrden = (wo[0]?.orden ?? 0) + 1000; }
    else if (gapKey === 'bottom') { newOrden = (wo[wo.length - 1]?.orden ?? 1000) - 1000; }
    else {
      const ai = wo.findIndex(e => e.id === gapKey);
      const ab = wo[ai], bel = wo[ai + 1];
      if (!ab)       newOrden = (bel?.orden ?? 0) + 1000;
      else if (!bel) newOrden = ab.orden - 1000;
      else           newOrden = (ab.orden + bel.orden) / 2;
    }
    onReorder(draggingId, newOrden);
    setDraggingId(null); setDragOverGap(null);
  };

  const hasFilters = filterTags.length > 0 || filterTemporada.length > 0;

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* ══ CABECERA ══════════════════════════════════════════════════════ */}
      <div style={{ flexShrink: 0, padding: '0 18px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>

        {/* Fila 1: volver · título · buscador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0 7px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.58)', fontFamily: 'Orbitron, monospace', fontSize: '0.54rem', padding: '5px 11px', cursor: 'pointer', letterSpacing: '0.08em', flexShrink: 0, borderRadius: '2px' }}>
            ← VOLVER
          </button>
          <span style={{ color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', flexShrink: 0 }}>
            LÍNEA CRONOLÓGICA
          </span>
          <div style={{ flex: 1 }}>
            <input className="cyber-input" value={filterName} onChange={e => setFilterName(e.target.value)}
              placeholder="Buscar por nombre…" style={{ fontSize: '0.75rem', padding: '4px 10px' }} />
          </div>
        </div>

        {/* Fila 2: filtros temporada · separador · tags dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(0,212,255,0.3)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', letterSpacing: '0.1em', flexShrink: 0 }}>FILTRAR:</span>
          {[1, 2, 3].map(t => (
            <button key={t} onClick={() => toggleFilterTemp(t)} style={{
              padding: '3px 10px', borderRadius: '2px',
              border: `1px solid ${tempColor(t)}${filterTemporada.includes(t) ? 'aa' : '38'}`,
              background: filterTemporada.includes(t) ? `${tempColor(t)}1e` : 'transparent',
              color: filterTemporada.includes(t) ? tempColor(t) : `${tempColor(t)}66`,
              fontFamily: 'Orbitron, monospace', fontSize: '0.57rem', letterSpacing: '0.1em', cursor: 'pointer',
            }}>
              T{t}
            </button>
          ))}
          <div style={{ width: '1px', height: '14px', background: 'rgba(0,212,255,0.14)', flexShrink: 0 }} />
          <TagsDropdown allTags={allTags} filterTags={filterTags} onToggle={toggleFilterTag} onClear={() => setFilterTags([])} />
          {hasFilters && (
            <button onClick={() => { setFilterTags([]); setFilterTemporada([]); }}
              style={{ padding: '3px 8px', background: 'transparent', border: '1px solid rgba(0,212,255,0.18)', color: 'rgba(0,212,255,0.38)', fontFamily: 'Orbitron, monospace', fontSize: '0.52rem', cursor: 'pointer', borderRadius: '2px' }}>
              ✕ TODO
            </button>
          )}
        </div>
      </div>

      {/* ══ CONTENIDO: timeline + panel detalle ══════════════════════════ */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

        {/* ── Columna timeline ─────────────────────────────────────────── */}
        <div style={{
          flexShrink: 0,
          width: selectedEvent ? '42%' : '100%',
          transition: 'width 0.35s ease',
          overflow: 'hidden',
          borderRight: selectedEvent ? '1px solid rgba(0,212,255,0.1)' : 'none',
        }}>
          <div style={{ height: '100%', overflowY: 'auto', position: 'relative' }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { setDraggingId(null); setDragOverGap(null); }}
          >
            {/* eje holográfico */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', transform: 'translateX(-50%)', background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.12) 4%, rgba(0,212,255,0.32) 18%, rgba(0,212,255,0.32) 82%, rgba(0,212,255,0.12) 96%, transparent)', boxShadow: '0 0 10px rgba(0,212,255,0.22), 0 0 30px rgba(0,212,255,0.07)', pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ padding: '12px 0 40px' }}>
              {sorted.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                  {isEditor ? (
                    <button onClick={() => openAddModal('top')} style={{ background: 'transparent', border: '1px dashed rgba(0,212,255,0.32)', color: 'rgba(0,212,255,0.48)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', padding: '18px 36px', cursor: 'pointer', borderRadius: '4px' }}>
                      + AÑADIR PRIMER EVENTO
                    </button>
                  ) : (
                    <span style={{ color: 'rgba(0,212,255,0.22)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.12em' }}>NO HAY EVENTOS REGISTRADOS</span>
                  )}
                </div>
              ) : (
                <>
                  <GapRow gapKey="top" isEditor={isEditor} hoverGap={hoverGap} dragOverGap={dragOverGap} draggingId={draggingId}
                    onMouseEnter={() => setHoverGap('top')} onMouseLeave={() => setHoverGap(null)}
                    onAdd={() => openAddModal('top')} onDragOver={() => setDragOverGap('top')} onDrop={() => handleDrop('top')} />

                  {sorted.map((ev, i) => {
                    const isLeft  = i % 2 === 0;
                    const matched = isMatch(ev);
                    const isSel   = selectedId === ev.id;

                    const node = (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, position: 'relative' }}>
                        <div style={{
                          width: isSel ? '14px' : '10px', height: isSel ? '14px' : '10px',
                          borderRadius: '50%', flexShrink: 0,
                          background: isSel ? '#00d4ff' : (ev.temporada ? tempColor(ev.temporada) + 'aa' : 'rgba(0,212,255,0.65)'),
                          border: `2px solid ${isSel ? '#00d4ff' : (ev.temporada ? tempColor(ev.temporada) : 'rgba(0,212,255,0.55)')}`,
                          boxShadow: isSel ? '0 0 12px rgba(0,212,255,0.9), 0 0 26px rgba(0,212,255,0.4)' : '0 0 6px rgba(0,212,255,0.38)',
                          transition: 'all 0.22s',
                        }} />
                      </div>
                    );

                    const connector = (
                      <div style={{ width: '30px', height: '1px', flexShrink: 0, background: `linear-gradient(${isLeft ? 'to right' : 'to left'}, rgba(0,212,255,0.04), rgba(0,212,255,0.32))`, ...(isLeft ? { marginRight: '-10px' } : { marginLeft: '-10px' }) }} />
                    );

                    return (
                      <div key={ev.id}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', alignItems: 'center', padding: '4px 14px', opacity: matched ? 1 : 0.2, transition: 'opacity 0.2s' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {isLeft && (<>
                              <TimelineCard event={ev} isSelected={isSel} isEditor={isEditor} draggingId={draggingId}
                                onSelect={() => setSelectedId(isSel ? null : ev.id)}
                                onEdit={() => openEditModal(ev)}
                                onDragStart={() => handleDragStart(ev.id)}
                                onDragEnd={() => { setDraggingId(null); setDragOverGap(null); }} />
                              {connector}
                            </>)}
                          </div>
                          {node}
                          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                            {!isLeft && (<>
                              {connector}
                              <TimelineCard event={ev} isSelected={isSel} isEditor={isEditor} draggingId={draggingId}
                                onSelect={() => setSelectedId(isSel ? null : ev.id)}
                                onEdit={() => openEditModal(ev)}
                                onDragStart={() => handleDragStart(ev.id)}
                                onDragEnd={() => { setDraggingId(null); setDragOverGap(null); }} />
                            </>)}
                          </div>
                        </div>

                        <GapRow gapKey={ev.id} isEditor={isEditor} hoverGap={hoverGap} dragOverGap={dragOverGap} draggingId={draggingId}
                          onMouseEnter={() => setHoverGap(ev.id)} onMouseLeave={() => setHoverGap(null)}
                          onAdd={() => openAddModal(ev.id)}
                          onDragOver={() => setDragOverGap(ev.id)}
                          onDrop={() => handleDrop(ev.id)} />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Panel detalle holográfico ─────────────────────────────────── */}
        {selectedEvent && (
          <div style={{ flex: 1, minWidth: 0, padding: '10px', animation: 'tl-detail-in 0.3s ease-out' }}>
            <DetailPanel
              event={selectedEvent}
              isEditor={isEditor}
              onClose={() => setSelectedId(null)}
              onEdit={() => openEditModal(selectedEvent)}
              onDelete={() => { onDelete(selectedId); setSelectedId(null); }}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && editingEvent && (
        <EventModal event={editingEvent} onSave={handleSave} onClose={() => { setShowModal(false); setEditingEvent(null); }} />
      )}
    </div>
  );
}
