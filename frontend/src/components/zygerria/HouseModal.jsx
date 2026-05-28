import { useState, useEffect } from 'react';
import { STATUS_STYLE, CHAR_STATE_COLOR } from './constants';

export default function HouseModal({ house, isMaster, onEdit, onDelete, onClose }) {
  const st = STATUS_STYLE[house.status] || STATUS_STYLE['Neutral'];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleDelete() {
    if (window.confirm(`¿Eliminar la Casa ${house.name}? Esta acción no se puede deshacer.`)) {
      onDelete(house.id);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: visible ? 'rgba(4,1,1,0.88)' : 'rgba(4,1,1,0)',
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
          maxWidth: '700px', width: '100%',
          maxHeight: '88vh', overflowY: 'auto',
          boxShadow: '0 0 60px rgba(201,162,39,0.12), 0 0 140px rgba(0,0,0,0.85)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        {/* Línea superior de color */}
        <div style={{ height: '2px', background: `linear-gradient(to right, transparent, ${st.color}, transparent)` }} />

        {/* Cabecera */}
        <div style={{ padding: '28px 28px 20px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Emblema grande con efecto holográfico */}
          <div style={{
            width: '108px', height: '108px', flexShrink: 0, borderRadius: '50%',
            border: `2px solid rgba(201,162,39,0.45)`,
            background: 'radial-gradient(circle, rgba(201,162,39,0.08) 0%, rgba(201,162,39,0.02) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: `0 0 28px rgba(201,162,39,0.22), 0 0 56px rgba(201,162,39,0.08), inset 0 0 20px rgba(201,162,39,0.06)`,
          }}>
            {house.emblem
              ? <img src={house.emblem} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '42px', color: 'rgba(201,162,39,0.28)' }}>⚜</span>
            }
          </div>

          {/* Info principal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.5rem', color: 'rgba(201,162,39,0.38)', fontFamily: 'Orbitron, monospace', letterSpacing: '0.25em', marginBottom: '6px' }}>
              CASA NOBLE ZYGERRIANA
            </div>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '1.05rem', fontWeight: 900,
              color: '#e8d5a3', letterSpacing: '0.07em', marginBottom: '12px',
              textShadow: '0 0 16px rgba(201,162,39,0.32)', lineHeight: 1.25,
            }}>
              {house.name}
            </div>

            <div style={{
              display: 'inline-block', padding: '3px 10px', marginBottom: '12px',
              background: st.bg, border: `1px solid ${st.border}`,
              color: st.color, fontSize: '0.5rem',
              fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em',
              boxShadow: st.glow, borderRadius: '1px',
            }}>
              {house.status}
            </div>

            <div style={{ fontSize: '0.62rem', color: 'rgba(232,213,163,0.5)', fontFamily: 'monospace', marginBottom: '6px' }}>
              ◈ {house.territory || 'Territorio desconocido'}
            </div>
            <div style={{ fontSize: '0.54rem', color: 'rgba(201,162,39,0.38)', fontFamily: 'monospace' }}>
              ◆ {house.characters?.length || 0} personaje{(house.characters?.length || 0) !== 1 ? 's' : ''} vinculado{(house.characters?.length || 0) !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Cerrar */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(201,162,39,0.2)',
              color: 'rgba(201,162,39,0.45)', width: '30px', height: '30px',
              cursor: 'pointer', fontSize: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(201,162,39,0.55)'; e.currentTarget.style.color = '#c9a227'; }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(201,162,39,0.2)'; e.currentTarget.style.color = 'rgba(201,162,39,0.45)'; }}
          >✕</button>
        </div>

        <Divider />

        {/* Historia */}
        {house.description && (
          <div style={{ padding: '20px 28px' }}>
            <SectionLabel>HISTORIA</SectionLabel>
            <div style={{ fontSize: '0.67rem', color: 'rgba(232,213,163,0.68)', fontFamily: 'monospace', lineHeight: '1.75' }}>
              {house.description}
            </div>
          </div>
        )}

        {/* Personajes vinculados */}
        {house.characters?.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '20px 28px' }}>
              <SectionLabel>PERSONAJES VINCULADOS</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {house.characters.map((char, i) => (
                  <CharacterRow key={i} char={char} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Acciones del Master */}
        {isMaster && (
          <>
            <Divider />
            <div style={{ padding: '16px 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <ActionBtn danger onClick={handleDelete}>ELIMINAR</ActionBtn>
              <ActionBtn onClick={() => onEdit(house)}>EDITAR</ActionBtn>
            </div>
          </>
        )}

        <div style={{ height: '2px', background: `linear-gradient(to right, transparent, ${st.color}, transparent)` }} />
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,162,39,0.18), transparent)', margin: '0 28px' }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '0.5rem', color: 'rgba(201,162,39,0.48)', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', marginBottom: '12px' }}>
      {children}
    </div>
  );
}

function CharacterRow({ char }) {
  const stateColor = CHAR_STATE_COLOR[char.state] || '#777';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '10px 14px',
      background: 'rgba(201,162,39,0.03)',
      border: '1px solid rgba(201,162,39,0.1)',
    }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
        border: '1px solid rgba(201,162,39,0.28)',
        background: 'rgba(201,162,39,0.05)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {char.avatar
          ? <img src={char.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '15px', color: 'rgba(201,162,39,0.28)' }}>◈</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.64rem', color: '#e8d5a3', fontFamily: 'Orbitron, monospace', fontWeight: 700, marginBottom: '3px' }}>
          {char.name}
        </div>
        <div style={{ fontSize: '0.54rem', color: 'rgba(232,213,163,0.48)', fontFamily: 'monospace' }}>
          {char.role}
        </div>
      </div>
      <div style={{
        fontSize: '0.46rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.06em',
        color: stateColor, padding: '2px 7px',
        border: `1px solid ${stateColor}44`,
        background: `${stateColor}11`,
        whiteSpace: 'nowrap',
      }}>
        {char.state}
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, danger }) {
  const base = danger
    ? { bg: 'rgba(139,0,0,0.1)', border: 'rgba(180,30,30,0.45)', color: '#cc4444', hover: 'rgba(139,0,0,0.22)' }
    : { bg: 'rgba(201,162,39,0.08)', border: 'rgba(201,162,39,0.45)', color: '#c9a227', hover: 'rgba(201,162,39,0.18)' };
  return (
    <button
      onClick={onClick}
      style={{
        background: base.bg, border: `1px solid ${base.border}`,
        color: base.color, fontFamily: 'Orbitron, monospace',
        fontSize: '0.5rem', letterSpacing: '0.1em', padding: '8px 16px', cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = base.hover}
      onMouseLeave={e => e.currentTarget.style.background = base.bg}
    >
      {children}
    </button>
  );
}
