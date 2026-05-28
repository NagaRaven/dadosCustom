export default function LocationRegistry({ onBack }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <div className="glass-panel rounded-sm flex-1 flex items-center justify-center" style={{ border: '1px solid rgba(0,212,255,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.15))' }} />
          <span
            className="font-orbitron font-black tracking-widest"
            style={{ fontSize: '0.65rem', color: 'rgba(0,212,255,0.18)', letterSpacing: '0.3em', whiteSpace: 'nowrap' }}
          >
            REGISTRO DE UBICACIONES
          </span>
          <span className="font-mono" style={{ fontSize: '0.6rem', color: 'rgba(0,212,255,0.1)', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
            — EN CONSTRUCCIÓN —
          </span>
          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,212,255,0.15))' }} />
        </div>
      </div>
    </div>
  );
}
