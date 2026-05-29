import { useState, useRef, useEffect } from 'react';
import { CHAR_STATES, CHAR_TYPES } from './constants';

const EMPTY_CHAR = () => ({ id: String(Date.now() + Math.random()), name: '', role: '', state: 'Vivo', type: 'ciudadano', isLord: false, avatar: null });

function sortChars(chars) {
  const rank = c => c.isLord ? 0 : c.type === 'esclavo' ? 2 : 1;
  return [...chars].sort((a, b) => rank(a) - rank(b));
}

const inputStyle = {
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.18)',
  color: 'rgba(255,255,255,0.8)',
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
  color: 'rgba(0,212,255,0.5)',
  fontFamily: 'Orbitron, monospace',
  letterSpacing: '0.14em',
  marginBottom: '5px',
};

const smallBtnStyle = {
  background: 'rgba(0,212,255,0.06)',
  border: '1px solid rgba(0,212,255,0.28)',
  color: 'rgba(0,212,255,0.7)',
  fontFamily: 'Orbitron, monospace',
  fontSize: '0.45rem',
  letterSpacing: '0.1em',
  padding: '4px 9px',
  cursor: 'pointer',
};

export default function HouseForm({ house, onSave, onCancel }) {
  const isEdit = !!house?.id;
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    name:        house?.name        || '',
    rank:        house?.rank        || 'mayor',
    territory:   house?.territory   || '',
    description: house?.description || '',
    emblem:      house?.emblem      || null,
    characters:  house?.characters ? house.characters.map(c => ({ type: 'ciudadano', isLord: false, ...c })) : [],
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
        background: visible ? 'rgba(0,0,8,0.9)' : 'rgba(0,0,8,0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        padding: '20px',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0a0a0f 0%, #0d0d16 50%, #0a0a0f 100%)',
          border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: '2px',
          maxWidth: '580px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 0 50px rgba(0,212,255,0.1), 0 0 120px rgba(0,0,0,0.85)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)' }} />

        <div style={{ padding: '24px 26px 26px' }}>
          {/* Título */}
          <div style={{
            fontFamily: 'Orbitron, monospace', fontSize: '0.68rem', fontWeight: 900,
            color: '#00d4ff', letterSpacing: '0.16em', marginBottom: '22px',
            textShadow: '0 0 10px rgba(0,212,255,0.4)',
          }}>
            {isEdit ? 'EDITAR CASA NOBLE' : 'REGISTRAR NUEVA CASA'}
          </div>

          {/* Emblema */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              onClick={() => emblemRef.current?.click()}
              style={{
                width: '76px', height: '76px', borderRadius: '50%', flexShrink: 0,
                border: '2px dashed rgba(0,212,255,0.24)',
                background: 'rgba(0,212,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.24)'}
            >
              {form.emblem
                ? <img src={form.emblem} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '26px', color: 'rgba(0,212,255,0.22)' }}>⚜</span>
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
              placeholder="Casa..."
              style={{ ...inputStyle, borderColor: form.name.trim() ? 'rgba(0,212,255,0.18)' : 'rgba(204,50,50,0.4)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = form.name.trim() ? 'rgba(0,212,255,0.18)' : 'rgba(204,50,50,0.4)'}
            />
          </div>

          {/* Rango */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>RANGO DE LA CASA</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['mayor', 'menor'].map(r => {
                const active = form.rank === r;
                return (
                  <button
                    key={r}
                    onClick={() => set('rank', r)}
                    style={{
                      flex: 1,
                      background: active ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.03)',
                      border: `1px solid ${active ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.15)'}`,
                      color: active ? '#00d4ff' : 'rgba(0,212,255,0.35)',
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '0.48rem',
                      letterSpacing: '0.14em',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontWeight: active ? 700 : 400,
                      boxShadow: active ? '0 0 8px rgba(0,212,255,0.12)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {r === 'mayor' ? '⚜ CASA MAYOR' : '◈ CASA MENOR'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Territorio */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>TERRITORIO</label>
            <input
              value={form.territory}
              onChange={e => set('territory', e.target.value)}
              placeholder="Zygerria Prime..."
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.18)'}
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
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.18)'}
            />
          </div>

          {/* Personajes */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>PERSONAJES VINCULADOS</label>
              <button onClick={addCharacter} style={smallBtnStyle}>+ AÑADIR</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortChars(form.characters).map((char) => {
                const i = form.characters.findIndex(c => c.id === char.id);
                return <CharacterEntry key={char.id} char={char} index={i} onUpdate={updateChar} onRemove={removeCharacter} />;
              })}
              {form.characters.length === 0 && (
                <div style={{ fontSize: '0.58rem', color: 'rgba(0,212,255,0.2)', fontFamily: 'monospace', padding: '10px', textAlign: 'center', border: '1px dashed rgba(0,212,255,0.1)' }}>
                  Sin personajes añadidos
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(0,212,255,0.08)' }}>
            <button
              onClick={onCancel}
              style={{ background: 'transparent', border: '1px solid rgba(0,212,255,0.18)', color: 'rgba(0,212,255,0.45)', fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.1em', padding: '8px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.color = 'rgba(0,212,255,0.75)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.18)'; e.currentTarget.style.color = 'rgba(0,212,255,0.45)'; }}
            >CANCELAR</button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                background: canSave ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.03)',
                border: `1px solid ${canSave ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.12)'}`,
                color: canSave ? '#00d4ff' : 'rgba(0,212,255,0.25)',
                fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', letterSpacing: '0.1em',
                padding: '8px 18px', cursor: canSave ? 'pointer' : 'not-allowed',
                boxShadow: canSave ? '0 0 10px rgba(0,212,255,0.15)' : 'none',
                fontWeight: 700, transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (canSave) e.currentTarget.style.background = 'rgba(0,212,255,0.18)'; }}
              onMouseLeave={e => { if (canSave) e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; }}
            >GUARDAR</button>
          </div>
        </div>

        <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)' }} />
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

  const charInput = {
    background: 'rgba(0,212,255,0.04)',
    border: '1px solid rgba(0,212,255,0.14)',
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'monospace', fontSize: '0.65rem',
    padding: '5px 9px', width: '100%', outline: 'none', boxSizing: 'border-box',
  };

  const lordColor = 'rgba(212,168,80,';

  return (
    <div style={{
      background: char.isLord ? 'rgba(212,168,80,0.04)' : 'rgba(0,212,255,0.02)',
      border: `1px solid ${char.isLord ? lordColor + '0.3)' : 'rgba(0,212,255,0.08)'}`,
      boxShadow: char.isLord ? `0 0 12px ${lordColor}0.1)` : 'none',
      padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start',
      transition: 'all 0.2s',
    }}>
      <div
        onClick={() => avatarRef.current?.click()}
        style={{
          width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
          border: `1px dashed ${char.isLord ? lordColor + '0.4)' : 'rgba(0,212,255,0.24)'}`,
          background: 'rgba(0,212,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = char.isLord ? lordColor + '0.7)' : 'rgba(0,212,255,0.5)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = char.isLord ? lordColor + '0.4)' : 'rgba(0,212,255,0.24)'}
      >
        {char.avatar
          ? <img src={char.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '14px', color: 'rgba(0,212,255,0.24)' }}>◈</span>
        }
      </div>
      <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input value={char.name} onChange={e => onUpdate(index, 'name', e.target.value)} placeholder="Nombre del personaje" style={charInput} />
        <input value={char.role} onChange={e => onUpdate(index, 'role', e.target.value)} placeholder="Título / Rol" style={charInput} />

        {/* Tipo: ciudadano / esclavo */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {CHAR_TYPES.map(t => {
            const active = char.type === t;
            return (
              <button key={t} onClick={() => onUpdate(index, 'type', t)} style={{
                flex: 1,
                background: active ? (t === 'ciudadano' ? 'rgba(15,50,130,0.75)' : 'rgba(180,60,60,0.1)') : 'rgba(0,212,255,0.02)',
                border: `1px solid ${active ? (t === 'ciudadano' ? 'rgba(60,120,220,0.6)' : 'rgba(180,60,60,0.4)') : 'rgba(0,212,255,0.1)'}`,
                color: active ? (t === 'ciudadano' ? 'rgba(200,225,255,0.95)' : 'rgba(220,80,80,0.9)') : 'rgba(0,212,255,0.3)',
                fontFamily: 'Orbitron, monospace', fontSize: '0.38rem', letterSpacing: '0.1em',
                padding: '4px 6px', cursor: 'pointer', fontWeight: active ? 700 : 400,
                transition: 'all 0.15s',
              }}>
                {t === 'ciudadano' ? '◈ CIUDADANO' : '⛓ ESCLAVO'}
              </button>
            );
          })}
        </div>

        <select value={char.state} onChange={e => onUpdate(index, 'state', e.target.value)} style={charInput}>
          {CHAR_STATES.map(s => <option key={s} value={s} style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.8)' }}>{s}</option>)}
        </select>

        {/* Señor de la Casa */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={!!char.isLord}
            onChange={e => onUpdate(index, 'isLord', e.target.checked)}
            style={{ accentColor: '#d4a850', width: '12px', height: '12px', cursor: 'pointer' }}
          />
          <span style={{
            fontFamily: 'Orbitron, monospace', fontSize: '0.38rem', letterSpacing: '0.12em',
            color: char.isLord ? '#d4a850' : 'rgba(212,168,80,0.35)',
            transition: 'color 0.15s',
          }}>
            SEÑOR DE LA CASA
          </span>
        </label>
      </div>

      <button
        onClick={() => onRemove(index)}
        style={{ background: 'transparent', border: 'none', color: 'rgba(204,68,68,0.45)', cursor: 'pointer', fontSize: '15px', flexShrink: 0, padding: '2px', lineHeight: 1, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#cc4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(204,68,68,0.45)'}
      >✕</button>
    </div>
  );
}
