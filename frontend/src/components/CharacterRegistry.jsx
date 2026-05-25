export default function CharacterRegistry({ onBack }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      <div className="glass-panel rounded-sm flex-1 flex flex-col items-center justify-center" style={{ border: '1px solid rgba(0,212,255,0.12)' }}>
        <span
          className="font-orbitron font-black tracking-widest"
          style={{ fontSize: '0.65rem', color: 'rgba(0,212,255,0.18)', letterSpacing: '0.3em' }}
        >
          REGISTRO DE PERSONAJES
        </span>
        <div style={{ marginTop: '12px', width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.15), transparent)' }} />
        <span
          className="font-mono"
          style={{ marginTop: '10px', fontSize: '0.6rem', color: 'rgba(0,212,255,0.1)', letterSpacing: '0.15em' }}
        >
          — EN CONSTRUCCIÓN —
        </span>
      </div>
    </div>
  );
}
