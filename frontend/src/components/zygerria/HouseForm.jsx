import { useState, useRef, useEffect } from 'react';
import { STATUSES, CHAR_STATES } from './constants';

const EMPTY_CHAR = () => ({ id: String(Date.now() + Math.random()), name: '', role: '', state: 'Vivo', avatar: null });

const inputStyle = {
  background: 'rgba(201,162,39,0.04)',
  border: '1px solid rgba(201,162,39,0.22)',
  color: '#e8d5a3',
  fontFamily: 'monospace',
  fontSize: '0.7rem',
  padding: '8px 12px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.48rem',
  color: 'rgba(201,162,39,0.52)',
  fontFamily: 'Orbitron, monospace',
  letterSpacing: '0.14em',
  marginBottom: '5px',
};

export default function HouseForm({ house, onSave, onCancel }) {
  const isEdit = !!house?.id;
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    name:        house?.name        || '',
    status:      house?.status      || 'Activa',
    territory:   house?.territory   || '',
    description: house?.description || '',
    emblem:      house?.emblem      || null,
    characters:  house?.characters ? house.characters.map(c => ({ ...c })) : [],
  });
  const emblemRef = useRef(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  function handleEmblemUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('emblem', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function addCharacter() {
    setForm(f => ({ ...f, characters: [...f.characters, EMPTY_CHAR()] }));
  }

  function removeCharacter(idx) {
    setForm(f => ({ ...f, characters: f.characters.filter((_, i) => i !== idx) }));
  }

  function updateChar(idx, key, value) {
    setForm(f => ({ ...f, characters: f.characters.map((c, i) => i === idx ? { ...c, [key]: value } : c) }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave(form);
  }

  const canSave = form.name.trim().length > 0;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: visible ? 'rgba(4,1,1,0.9)' : 'rgba(4,1,1,0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        padding: '20px',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0f0804 0%, #170b07 50%, #0f0804 100%)',
          border: '1px solid rgba(201,162,39,0.32)',
          borderRadius: '2px',
          maxWidth: '580px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 0 60px rgba(201,162,39,0.12), 0 0 140px rgba(0,0,0,0.85)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, #c9a227, transparent)' }} />

        <div style={{ padding: '24px 26px 26px' }}>
          {/* Título */}
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', fontWeight: 900,
            color: '#c9a227', letterSpacing: '0.16em', marginBottom: '22px',
            textShadow: '0 0 10px rgba(201,162,39,0.35)',
          }}>
            {isEdit ? 'EDITAR CASA NOBLE' : 'REGISTRAR NUEVA CASA'}
          </div>

          {/* Emblema */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              onClick={() => emblemRef.current?.click()}
              style={{
                width: '76px', height: '76px', borderRadius: '50%', flexShrink: 0,
                border: '2px dashed rgba(201,162,39,0.28)',
                background: 'rgba(201,162,39,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,162,39,0.55)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,162,39,0.28)'}
            >
              {form.emblem
                ? <img src={form.emblem} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '26px', color: 'rgba(201,162,39,0.28)' }}>⚜</span>
              }
            </div>
            <input ref={emblemRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleEmblemUpload} />
            <div>
              <div style={labelStyle}>ESCUDO / EMBLEMA</div>
              <button onClick={() => emblemRef.current?.click()} style={smallBtnStyle}>
                SUBIR IMAGEN
              </button>
              {form.emblem && (
                <button onClick={() => set('emblem', null)} style={{ ...smallBtnStyle, marginLeft: '8px', borderColor: 'rgba(204,68,68,0.35)', color: 'rgba(204,68,68,0.6)' }}>
                  ELIMINAR
                </button>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>NOMBRE DE LA CASA *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Casa Valorian..."
              style={{ ...inputStyle, borderColor: form.name.trim() ? 'rgba(201,162,39,0.22)' : 'rgba(204,50,50,0.4)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.5)'}
              onBlur={e => e.target.style.borderColor = form.name.trim() ? 'rgba(201,162,39,0.22)' : 'rgba(204,50,50,0.4)'}
            />
          </div>

          {/* Estado */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>ESTADO</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inputStyle }}>
              {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0f0804', color: '#e8d5a3' }}>{s}</option>)}
            </select>
          </div>

          {/* Territorio */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>TERRITORIO</label>
            <input
              value={form.territory}
              onChange={e => set('territory', e.target.value)}
              placeholder="Zygerria Prime..."
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(201,162,39,0.22)'}
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>HISTORIA / DESCRIPCIÓN</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="La historia de esta noble casa..."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.65' }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(201,162,39,0.22)'}
            />
          </div>

          {/* Personajes */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>PERSONAJES VINCULADOS</label>
              <button onClick={addCharacter} style={smallBtnStyle}>+ AÑADIR</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {form.characters.map((char, i) => (
                <CharacterEntry
                  key={char.id || i}
                  char={char}
                  index={i}
                  onUpdate={updateChar}
                  onRemove={removeCharacter}
                />
              ))}
              {form.characters.length === 0 && (
                <div style={{ fontSize: '0.58rem', color: 'rgba(201,162,39,0.25)', fontFamily: 'monospace', padding: '10px', textAlign: 'center', border: '1px dashed rgba(201,162,39,0.12)' }}>
                  Sin personajes añadidos
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(201,162,39,0.1)' }}>
            <button
              onClick={onCancel}
              style={{ background: 'transparent', border: '1px solid rgba(201,162,39,0.2)', color: 'rgba(201,162,39,0.5)', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.1em', padding: '8px 16px', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.45)'; e.currentTarget.style.color = 'rgba(201,162,39,0.8)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)'; e.currentTarget.style.color = 'rgba(201,162,39,0.5)'; }}
            >CANCELAR</button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                background: canSave ? 'rgba(201,162,39,0.12)' : 'rgba(201,162,39,0.03)',
                border: `1px solid ${canSave ? 'rgba(201,162,39,0.58)' : 'rgba(201,162,39,0.14)'}`,
                color: canSave ? '#c9a227' : 'rgba(201,162,39,0.28)',
                fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.1em',
                padding: '8px 18px', cursor: canSave ? 'pointer' : 'not-allowed',
                boxShadow: canSave ? '0 0 12px rgba(201,162,39,0.18)' : 'none',
                fontWeight: 700, transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (canSave) e.currentTarget.style.background = 'rgba(201,162,39,0.2)'; }}
              onMouseLeave={e => { if (canSave) e.currentTarget.style.background = 'rgba(201,162,39,0.12)'; }}
            >GUARDAR</button>
          </div>
        </div>

        <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, #c9a227, transparent)' }} />
      </div>
    </div>
  );
}

function CharacterEntry({ char, index, onUpdate, onRemove }) {
  const avatarRef = useRef(null);

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpdate(index, 'avatar', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div style={{
      background: 'rgba(201,162,39,0.03)', border: '1px solid rgba(201,162,39,0.1)',
      padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div
        onClick={() => avatarRef.current?.click()}
        style={{
          width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
          border: '1px dashed rgba(201,162,39,0.28)',
          background: 'rgba(201,162,39,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,162,39,0.55)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,162,39,0.28)'}
      >
        {char.avatar
          ? <img src={char.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '14px', color: 'rgba(201,162,39,0.28)' }}>◈</span>
        }
      </div>
      <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />

      {/* Campos */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input
          value={char.name}
          onChange={e => onUpdate(index, 'name', e.target.value)}
          placeholder="Nombre del personaje"
          style={{ ...charInputStyle }}
        />
        <input
          value={char.role}
          onChange={e => onUpdate(index, 'role', e.target.value)}
          placeholder="Título / Rol (ej. Reina, Comandante)"
          style={{ ...charInputStyle }}
        />
        <select
          value={char.state}
          onChange={e => onUpdate(index, 'state', e.target.value)}
          style={{ ...charInputStyle }}
        >
          {CHAR_STATES.map(s => <option key={s} value={s} style={{ background: '#0f0804', color: '#e8d5a3' }}>{s}</option>)}
        </select>
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(index)}
        style={{ background: 'transparent', border: 'none', color: 'rgba(204,68,68,0.45)', cursor: 'pointer', fontSize: '15px', flexShrink: 0, padding: '2px', lineHeight: 1, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#cc4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(204,68,68,0.45)'}
      >✕</button>
    </div>
  );
}

const charInputStyle = {
  background: 'rgba(201,162,39,0.04)',
  border: '1px solid rgba(201,162,39,0.18)',
  color: '#e8d5a3',
  fontFamily: 'monospace',
  fontSize: '0.65rem',
  padding: '5px 9px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

const smallBtnStyle = {
  background: 'rgba(201,162,39,0.07)',
  border: '1px solid rgba(201,162,39,0.3)',
  color: 'rgba(201,162,39,0.75)',
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.45rem',
  letterSpacing: '0.1em',
  padding: '4px 9px',
  cursor: 'pointer',
};
