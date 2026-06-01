import { useState, useEffect } from 'react';
import { CHAR_STATE_COLOR } from './constants';

export default function HouseModal({ house, isMaster, onEdit, onDelete, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleDelete() {
    if (window.confirm(`¿Eliminar la Casa ${house.name}? Esta acción no se puede deshacer.`)) {
      onDelete(house.id);
    }
  }

  const chars = house.characters || [];
  const ciudadanos = chars.filter(c => c.type !== 'esclavo').sort((a, b) => (b.isLord ? 1 : 0) - (a.isLord ? 1 : 0));
  const esclavos   = chars.filter(c => c.type === 'esclavo');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: visible ? 'rgba(0,0,8,0.88)' : 'rgba(0,0,8,0)',
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
          maxWidth: '700px', width: '100%',
          maxHeight: '88vh', overflowY: 'auto',
          boxShadow: '0 0 50px rgba(0,212,255,0.1), 0 0 120px rgba(0,0,0,0.85)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)' }} />

        {/* Cabecera */}
        <div style={{ padding: '28px 28px 20px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Emblema */}
          <div style={{
            width: '108px', height: '108px', flexShrink: 0, borderRadius: '50%',
            border: '2px solid rgba(0,212,255,0.3)',
            background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, rgba(0,212,255,0.02) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 24px rgba(0,212,255,0.15), 0 0 48px rgba(0,212,255,0.06)',
          }}>
            {house.emblem
              ? <img src={house.emblem} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '42px', color: 'rgba(0,212,255,0.2)' }}>⚜</span>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.5rem', color: 'rgba(0,212,255,0.35)', fontFamily: 'Orbitron, monospace', letterSpacing: '0.25em', marginBottom: '6px' }}>
              CASA NOBLE ZYGERRIANA
            </div>
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '1.05rem', fontWeight: 900,
              color: 'rgba(0,212,255,0.9)', letterSpacing: '0.07em', marginBottom: '12px',
              textShadow: '0 0 14px rgba(0,212,255,0.3)', lineHeight: 1.25,
            }}>
              {house.name}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(0,212,255,0.45)', fontFamily: 'monospace', marginBottom: '6px' }}>
              ◈ {house.territory || 'Territorio desconocido'}
            </div>
            <div style={{ fontSize: '0.54rem', color: 'rgba(0,212,255,0.3)', fontFamily: 'monospace', display: 'flex', gap: '10px' }}>
              {ciudadanos.length > 0 && <span>◆ {ciudadanos.length} ciudadano{ciudadanos.length !== 1 ? 's' : ''}</span>}
              {esclavos.length > 0   && <span style={{ color: 'rgba(220,130,40,0.5)' }}>⛓ {esclavos.length} esclavo{esclavos.length !== 1 ? 's' : ''}</span>}
            </div>
          </div>

          {/* Cerrar */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(0,212,255,0.18)',
              color: 'rgba(0,212,255,0.4)', width: '30px', height: '30px',
              cursor: 'pointer', fontSize: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(0,212,255,0.5)'; e.currentTarget.style.color = '#00d4ff'; }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(0,212,255,0.18)'; e.currentTarget.style.color = 'rgba(0,212,255,0.4)'; }}
          >✕</button>
        </div>

        <Divider />

        {/* Historia */}
        {house.description && (
          <div style={{ padding: '20px 28px' }}>
            <SectionLabel>HISTORIA</SectionLabel>
            <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', lineHeight: '1.75' }}>
              {house.description}
            </div>
          </div>
        )}

        {/* Ciudadanos */}
        {ciudadanos.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '20px 28px' }}>
              <SectionLabel>CIUDADANOS</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {ciudadanos.map((char, i) => <CharacterRow key={i} char={char} />)}
              </div>
            </div>
          </>
        )}

        {/* Esclavos */}
        {esclavos.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '20px 28px' }}>
              <SectionLabel color="rgba(220,130,40,0.5)">ESCLAVOS</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {esclavos.map((char, i) => <CharacterRow key={i} char={char} />)}
              </div>
            </div>
          </>
        )}

        {/* Acciones Master */}
        {isMaster && (
          <>
            <Divider />
            <div style={{ padding: '16px 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <ActionBtn danger onClick={handleDelete}>ELIMINAR</ActionBtn>
              <ActionBtn onClick={() => onEdit(house)}>EDITAR</ActionBtn>
            </div>
          </>
        )}

        <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)' }} />
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.15), transparent)', margin: '0 28px' }} />;
}

function SectionLabel({ children, color }) {
  return (
    <div style={{ fontSize: '0.5rem', color: color || 'rgba(0,212,255,0.45)', fontFamily: 'Orbitron, monospace', letterSpacing: '0.15em', marginBottom: '12px' }}>
      {children}
    </div>
  );
}

function CharacterRow({ char }) {
  const stateColor = CHAR_STATE_COLOR[char.state] || '#777';
  const isLord = !!char.isLord;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '8px 12px',
      background: isLord ? 'rgba(212,168,80,0.05)' : 'rgba(0,212,255,0.03)',
      border: isLord ? '1px solid rgba(212,168,80,0.28)' : '1px solid rgba(0,212,255,0.08)',
      boxShadow: isLord ? '0 0 14px rgba(212,168,80,0.12)' : 'none',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
        border: isLord ? '1px solid rgba(212,168,80,0.45)' : '1px solid rgba(0,212,255,0.22)',
        background: 'rgba(0,212,255,0.04)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {char.avatar
          ? <img src={char.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '13px', color: 'rgba(0,212,255,0.22)' }}>◈</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ fontSize: '0.6rem', color: isLord ? '#d4a850' : 'rgba(0,212,255,0.85)', fontFamily: 'Orbitron, monospace', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {char.name}
          </div>
          {isLord && (
            <div style={{ fontSize: '0.36rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em', color: '#d4a850', padding: '1px 4px', border: '1px solid rgba(212,168,80,0.35)', background: 'rgba(212,168,80,0.08)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              SEÑOR
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '0.5rem', color: 'rgba(0,212,255,0.4)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {char.role}
          </div>
          <div style={{
            fontSize: '0.4rem', fontFamily: 'Orbitron, monospace', letterSpacing: '0.04em',
            color: stateColor, padding: '1px 5px',
            border: `1px solid ${stateColor}44`,
            background: `${stateColor}11`,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {char.state}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, danger }) {
  const base = danger
    ? { bg: 'rgba(139,0,0,0.1)', border: 'rgba(180,30,30,0.45)', color: '#cc4444', hover: 'rgba(139,0,0,0.22)' }
    : { bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.4)', color: '#00d4ff', hover: 'rgba(0,212,255,0.14)' };
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
