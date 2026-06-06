import { useState } from 'react';

const PRESET_TAGS = ['batalla', 'diplomacia', 'traición', 'muerte', 'descubrimiento'];
const TAG_COLORS = {
  batalla:      '#ff4444',
  diplomacia:   '#00d4ff',
  traición:     '#c084fc',
  muerte:       '#888',
  descubrimiento: '#ffd700',
};

function tagColor(tag) {
  return TAG_COLORS[tag] || '#a0b0c0';
}

// ── Modal añadir / editar ──────────────────────────────────────────────────

function EventModal({ event, onSave, onClose }) {
  const [nombre, setNombre]           = useState(event.nombre || '');
  const [descripcion, setDescripcion] = useState(event.descripcion || '');
  const [tags, setTags]               = useState(event.tags || []);
  const [customTag, setCustomTag]     = useState('');

  const toggleTag = (t) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const addCustom = () => {
    const t = customTag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setCustomTag('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave({ nombre: nombre.trim(), descripcion: descripcion.trim(), tags });
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#0d0d14', border: '1px solid rgba(0,212,255,0.4)', borderRadius: '4px', padding: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 0 40px rgba(0,212,255,0.12)' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.8)', marginBottom: '20px' }}>
          {event.id ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.5)', marginBottom: '6px' }}>NOMBRE *</label>
            <input className="cyber-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del evento..." autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.5)', marginBottom: '6px' }}>DESCRIPCIÓN</label>
            <textarea className="cyber-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción del evento..." rows={4} style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.5)', marginBottom: '8px' }}>TAGS</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {PRESET_TAGS.map(t => (
                <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                  padding: '3px 10px', borderRadius: '2px',
                  border: `1px solid ${tagColor(t)}${tags.includes(t) ? '' : '55'}`,
                  background: tags.includes(t) ? `${tagColor(t)}22` : 'transparent',
                  color: tags.includes(t) ? tagColor(t) : `${tagColor(t)}88`,
                  fontSize: '0.6rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.08em',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
              {tags.filter(t => !PRESET_TAGS.includes(t)).map(t => (
                <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                  padding: '2px 8px', borderRadius: '2px',
                  border: `1px solid ${tagColor(t)}55`, background: `${tagColor(t)}18`,
                  color: tagColor(t), fontSize: '0.6rem', fontFamily: 'Orbitron, monospace',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {t} <span style={{ opacity: 0.6 }}>×</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="cyber-input" value={customTag} onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                placeholder="Tag personalizado…" style={{ fontSize: '0.8rem', padding: '5px 10px' }} />
              <button type="button" onClick={addCustom} className="cyber-btn" style={{ padding: '5px 14px', fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                + ADD
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} className="cyber-btn" style={{ padding: '6px 18px', fontSize: '0.6rem', borderColor: 'rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.5)' }}>
              CANCELAR
            </button>
            <button type="submit" className="cyber-btn" style={{ padding: '6px 22px', fontSize: '0.6rem' }}>
              {event.id ? 'GUARDAR' : 'CREAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tarjeta de evento ─────────────────────────────────────────────────────

function EventCard({ event, isLeft, isSelected, isEditor, draggingId, onSelect, onEdit, onDelete, onDragStart, onDragEnd }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDragging = draggingId === event.id;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      draggable={isEditor}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      style={{
        background: isSelected ? 'rgba(0,212,255,0.07)' : 'rgba(13,17,23,0.92)',
        border: `1px solid ${isSelected ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.18)'}`,
        borderRadius: '3px',
        padding: isSelected ? '14px' : '10px 14px',
        maxWidth: '280px',
        width: '100%',
        cursor: isEditor ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        transition: 'border-color 0.2s, padding 0.25s, background 0.2s, box-shadow 0.2s',
        boxShadow: isSelected ? '0 0 18px rgba(0,212,255,0.12)' : 'none',
        userSelect: 'none',
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(0,212,255,0.9)', wordBreak: 'break-word', lineHeight: 1.4 }}>
          {event.nombre}
        </div>
        {isEditor && (
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button onClick={e => { e.stopPropagation(); onEdit(); }} title="Editar"
              style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.22)', color: 'rgba(0,212,255,0.55)', borderRadius: '2px', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              ✎
            </button>
            <button onClick={handleDelete} title={confirmDelete ? 'Confirmar' : 'Eliminar'}
              style={{ background: confirmDelete ? 'rgba(255,68,68,0.15)' : 'transparent', border: `1px solid ${confirmDelete ? 'rgba(255,68,68,0.7)' : 'rgba(255,68,68,0.22)'}`, color: confirmDelete ? '#ff4444' : 'rgba(255,68,68,0.55)', borderRadius: '2px', width: confirmDelete ? '52px' : '20px', height: '20px', cursor: 'pointer', fontSize: '0.55rem', fontFamily: 'Orbitron, monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap', padding: '0 4px' }}>
              {confirmDelete ? '¿OK?' : '×'}
            </button>
          </div>
        )}
      </div>

      {event.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '7px' }}>
          {event.tags.map(t => (
            <span key={t} style={{
              padding: '1px 7px', borderRadius: '2px',
              border: `1px solid ${tagColor(t)}40`,
              background: `${tagColor(t)}14`,
              color: tagColor(t),
              fontSize: '0.55rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.06em',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {isSelected && event.descripcion && (
        <div style={{
          marginTop: '10px', paddingTop: '10px',
          borderTop: '1px solid rgba(0,212,255,0.15)',
          color: '#c8d0e0', fontSize: '0.82rem', lineHeight: 1.55,
          animation: 'tl-expand 0.22s ease-out',
        }}>
          {event.descripcion}
        </div>
      )}

      {isSelected && !event.descripcion && (
        <div style={{ marginTop: '8px', color: 'rgba(0,212,255,0.25)', fontSize: '0.7rem', fontStyle: 'italic' }}>
          Sin descripción.
        </div>
      )}
    </div>
  );
}

// ── Fila de hueco (gap) ──────────────────────────────────────────────────

function GapRow({ gapKey, isEditor, hoverGap, dragOverGap, draggingId, onMouseEnter, onMouseLeave, onAdd, onDragOver, onDrop }) {
  const isOver  = dragOverGap === gapKey && !!draggingId;
  const isHover = hoverGap === gapKey && !draggingId;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={e => { e.preventDefault(); onDrop(); }}
      style={{ position: 'relative', height: isOver ? '48px' : isHover ? '36px' : '14px', transition: 'height 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {isOver && (
        <div style={{ position: 'absolute', left: '5%', right: '5%', top: '50%', height: '2px', background: 'rgba(0,212,255,0.75)', boxShadow: '0 0 8px rgba(0,212,255,0.6)', borderRadius: '1px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      )}
      {isEditor && isHover && (
        <button
          onClick={onAdd}
          style={{
            position: 'relative', zIndex: 3,
            width: '24px', height: '24px', borderRadius: '50%',
            border: '1px solid rgba(0,212,255,0.65)',
            background: 'rgba(0,212,255,0.12)',
            color: 'rgba(0,212,255,0.9)',
            fontSize: '16px', lineHeight: 1, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,212,255,0.35)',
          }}
        >
          +
        </button>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function Timeline({ isEditor, events, onAdd, onUpdate, onDelete, onReorder, onBack }) {
  const [selectedId,     setSelectedId]     = useState(null);
  const [filterName,     setFilterName]     = useState('');
  const [filterTags,     setFilterTags]     = useState([]);
  const [showModal,      setShowModal]      = useState(false);
  const [editingEvent,   setEditingEvent]   = useState(null);
  const [insertPosition, setInsertPosition] = useState(null);
  const [hoverGap,       setHoverGap]       = useState(null);
  const [draggingId,     setDraggingId]     = useState(null);
  const [dragOverGap,    setDragOverGap]    = useState(null);

  const sorted = [...events].sort((a, b) => b.orden - a.orden);

  const allTags = [...new Set(events.flatMap(e => e.tags || []))].sort();

  const isMatch = (ev) => {
    const nm = !filterName || ev.nombre.toLowerCase().includes(filterName.toLowerCase());
    const tm = filterTags.length === 0 || filterTags.some(t => (ev.tags || []).includes(t));
    return nm && tm;
  };

  const toggleFilterTag = (t) => setFilterTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const openAddModal = (position) => {
    if (!isEditor) return;
    setEditingEvent({ nombre: '', descripcion: '', tags: [] });
    setInsertPosition(position);
    setShowModal(true);
  };

  const openEditModal = (ev) => {
    if (!isEditor) return;
    setEditingEvent({ ...ev });
    setInsertPosition(null);
    setShowModal(true);
  };

  const handleSave = (data) => {
    if (editingEvent.id) {
      onUpdate(editingEvent.id, data);
    } else {
      let orden;
      if (sorted.length === 0) {
        orden = 1000;
      } else if (insertPosition === 'top') {
        orden = sorted[0].orden + 1000;
      } else if (insertPosition === 'bottom') {
        orden = sorted[sorted.length - 1].orden - 1000;
      } else {
        // insertPosition = id of event above the gap
        const aboveIdx = sorted.findIndex(e => e.id === insertPosition);
        const above = sorted[aboveIdx];
        const below = sorted[aboveIdx + 1];
        orden = below ? (above.orden + below.orden) / 2 : above.orden - 1000;
      }
      onAdd({ ...data, orden });
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleDragStart = (id) => {
    if (!isEditor) return;
    setDraggingId(id);
    setSelectedId(null);
  };

  const handleDrop = (gapKey) => {
    if (!draggingId) return;
    const withoutDragged = sorted.filter(e => e.id !== draggingId);
    let newOrden;
    if (gapKey === 'top') {
      newOrden = (withoutDragged[0]?.orden ?? 0) + 1000;
    } else if (gapKey === 'bottom') {
      newOrden = (withoutDragged[withoutDragged.length - 1]?.orden ?? 1000) - 1000;
    } else {
      const aboveIdx = withoutDragged.findIndex(e => e.id === gapKey);
      const above = withoutDragged[aboveIdx];
      const below = withoutDragged[aboveIdx + 1];
      if (!above)       newOrden = (below?.orden ?? 0) + 1000;
      else if (!below)  newOrden = above.orden - 1000;
      else              newOrden = (above.orden + below.orden) / 2;
    }
    onReorder(draggingId, newOrden);
    setDraggingId(null);
    setDragOverGap(null);
  };

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* ── Cabecera ──────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,212,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.3)', color: 'rgba(0,212,255,0.6)', fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.08em', flexShrink: 0 }}>
          ← VOLVER
        </button>
        <div style={{ color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', flex: '0 0 auto' }}>
          LÍNEA CRONOLÓGICA
        </div>
        <div style={{ flex: '1 1 160px', maxWidth: '240px' }}>
          <input className="cyber-input" value={filterName} onChange={e => setFilterName(e.target.value)}
            placeholder="Buscar por nombre…" style={{ fontSize: '0.75rem', padding: '4px 10px' }} />
        </div>
        {allTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
            {allTags.map(t => (
              <button key={t} onClick={() => toggleFilterTag(t)} style={{
                padding: '2px 9px', borderRadius: '2px',
                border: `1px solid ${tagColor(t)}${filterTags.includes(t) ? '' : '44'}`,
                background: filterTags.includes(t) ? `${tagColor(t)}20` : 'transparent',
                color: filterTags.includes(t) ? tagColor(t) : `${tagColor(t)}77`,
                fontSize: '0.58rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.06em', cursor: 'pointer',
              }}>
                {t}
              </button>
            ))}
            {filterTags.length > 0 && (
              <button onClick={() => setFilterTags([])} style={{ padding: '2px 7px', borderRadius: '2px', border: '1px solid rgba(0,212,255,0.2)', background: 'transparent', color: 'rgba(0,212,255,0.4)', fontSize: '0.55rem', fontFamily: 'Orbitron, monospace', cursor: 'pointer' }}>
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Timeline scrollable ────────────────────────────────────────── */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '12px 0 40px', position: 'relative' }}
        onDragOver={e => e.preventDefault()}
        onDrop={() => { setDraggingId(null); setDragOverGap(null); }}
      >
        {/* eje holográfico */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.12) 4%, rgba(0,212,255,0.32) 18%, rgba(0,212,255,0.32) 82%, rgba(0,212,255,0.12) 96%, transparent)',
          boxShadow: '0 0 10px rgba(0,212,255,0.25), 0 0 30px rgba(0,212,255,0.08)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            {isEditor ? (
              <button onClick={() => openAddModal('top')}
                style={{ background: 'transparent', border: '1px dashed rgba(0,212,255,0.35)', color: 'rgba(0,212,255,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', padding: '18px 36px', cursor: 'pointer', borderRadius: '4px' }}>
                + AÑADIR PRIMER EVENTO
              </button>
            ) : (
              <span style={{ color: 'rgba(0,212,255,0.25)', fontFamily: 'Orbitron, monospace', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
                NO HAY EVENTOS REGISTRADOS
              </span>
            )}
          </div>
        ) : (
          <div>
            {/* Gap inicial */}
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
                    background: isSel ? '#00d4ff' : 'rgba(0,212,255,0.65)',
                    border: `2px solid ${isSel ? '#00d4ff' : 'rgba(0,212,255,0.55)'}`,
                    boxShadow: isSel ? '0 0 12px rgba(0,212,255,0.9), 0 0 28px rgba(0,212,255,0.45)' : '0 0 6px rgba(0,212,255,0.5)',
                    transition: 'all 0.22s',
                  }} />
                </div>
              );

              const connector = (
                <div style={{
                  width: '30px', height: '1px', flexShrink: 0,
                  background: `linear-gradient(${isLeft ? 'to right' : 'to left'}, rgba(0,212,255,0.05), rgba(0,212,255,0.35))`,
                  ...(isLeft ? { marginRight: '-10px' } : { marginLeft: '-10px' }),
                }} />
              );

              return (
                <div key={ev.id}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 20px 1fr',
                    alignItems: 'center', padding: '4px 16px',
                    opacity: matched ? 1 : 0.22, transition: 'opacity 0.2s',
                  }}>
                    {/* celda izquierda */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {isLeft && (
                        <>
                          <EventCard event={ev} isLeft isSelected={isSel} isEditor={isEditor} draggingId={draggingId}
                            onSelect={() => setSelectedId(isSel ? null : ev.id)}
                            onEdit={() => openEditModal(ev)}
                            onDelete={() => onDelete(ev.id)}
                            onDragStart={() => handleDragStart(ev.id)}
                            onDragEnd={() => { setDraggingId(null); setDragOverGap(null); }} />
                          {connector}
                        </>
                      )}
                    </div>
                    {/* nodo central */}
                    {node}
                    {/* celda derecha */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                      {!isLeft && (
                        <>
                          {connector}
                          <EventCard event={ev} isLeft={false} isSelected={isSel} isEditor={isEditor} draggingId={draggingId}
                            onSelect={() => setSelectedId(isSel ? null : ev.id)}
                            onEdit={() => openEditModal(ev)}
                            onDelete={() => onDelete(ev.id)}
                            onDragStart={() => handleDragStart(ev.id)}
                            onDragEnd={() => { setDraggingId(null); setDragOverGap(null); }} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Gap entre eventos */}
                  <GapRow
                    gapKey={ev.id}
                    isEditor={isEditor} hoverGap={hoverGap} dragOverGap={dragOverGap} draggingId={draggingId}
                    onMouseEnter={() => setHoverGap(ev.id)} onMouseLeave={() => setHoverGap(null)}
                    onAdd={() => openAddModal(ev.id)}
                    onDragOver={() => setDragOverGap(ev.id)}
                    onDrop={() => handleDrop(ev.id)}
                  />
                </div>
              );
            })}

            {/* El último gap ya se renderiza dentro del map */}
          </div>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      {showModal && editingEvent && (
        <EventModal event={editingEvent} onSave={handleSave} onClose={() => { setShowModal(false); setEditingEvent(null); }} />
      )}
    </div>
  );
}
