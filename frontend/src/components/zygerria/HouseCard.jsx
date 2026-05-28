import { STATUS_STYLE } from './constants';

export default function HouseCard({ house, onClick }) {
  const st = STATUS_STYLE[house.status] || STATUS_STYLE['Neutral'];
  const charCount = house.characters?.length || 0;

  return (
    <button
      onClick={() => onClick(house)}
      style={{
        background: 'linear-gradient(160deg, rgba(10,10,18,0.98) 0%, rgba(13,13,22,0.95) 100%)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: '2px',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = '1px solid rgba(0,212,255,0.45)';
        e.currentTarget.style.boxShadow = '0 0 22px rgba(0,212,255,0.12), 0 4px 20px rgba(0,0,0,0.5)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid rgba(0,212,255,0.15)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Línea de color de estado */}
      <div style={{ height: '2px', background: `linear-gradient(to right, transparent, ${st.color}, transparent)` }} />

      <div style={{ padding: '18px 18px 16px' }}>
        {/* Emblema */}
        <div style={{
          width: '62px', height: '62px', borderRadius: '50%',
          border: '2px solid rgba(0,212,255,0.25)',
          background: 'rgba(0,212,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '13px', overflow: 'hidden',
          boxShadow: '0 0 12px rgba(0,212,255,0.1)',
          flexShrink: 0,
        }}>
          {house.emblem
            ? <img src={house.emblem} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '22px', color: 'rgba(0,212,255,0.25)' }}>⚜</span>
          }
        </div>

        {/* Nombre */}
        <div style={{
          fontFamily: 'Orbitron, monospace', fontSize: '0.72rem', fontWeight: 900,
          color: 'rgba(0,212,255,0.85)', letterSpacing: '0.05em', marginBottom: '8px',
          textShadow: '0 0 8px rgba(0,212,255,0.2)', lineHeight: 1.3,
        }}>
          {house.name}
        </div>

        {/* Estado */}
        <div style={{
          display: 'inline-block', padding: '2px 8px', marginBottom: '9px',
          background: st.bg, border: `1px solid ${st.border}`,
          color: st.color, fontSize: '0.47rem',
          fontFamily: 'Orbitron, monospace', letterSpacing: '0.08em',
          boxShadow: st.glow, borderRadius: '1px',
        }}>
          {house.status}
        </div>

        {/* Territorio */}
        <div style={{ fontSize: '0.58rem', color: 'rgba(0,212,255,0.38)', fontFamily: 'monospace', marginBottom: '7px' }}>
          ◈ {house.territory || 'Territorio desconocido'}
        </div>

        {/* Personajes */}
        <div style={{ fontSize: '0.52rem', color: 'rgba(0,212,255,0.3)', fontFamily: 'monospace' }}>
          ◆ {charCount} personaje{charCount !== 1 ? 's' : ''} vinculado{charCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Esquina decorativa */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: '22px', height: '22px',
        borderTop: '1px solid rgba(0,212,255,0.12)',
        borderLeft: '1px solid rgba(0,212,255,0.12)',
      }} />
    </button>
  );
}
