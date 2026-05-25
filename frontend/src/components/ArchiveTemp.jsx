import { useState } from 'react';

export default function ArchiveTemp({ isMaster, archiveImage, onSetImage }) {
  const [isDragOver, setIsDragOver] = useState(false);

  function loadFile(file) {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => onSetImage(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  }

  return (
    <div
      className="glass-panel-bright rounded-sm hud-corners-full"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* Cabecera */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(0,212,255,0.15)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,transparent,rgba(0,212,255,0.3))' }} />
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(0,212,255,0.65)', textShadow: '0 0 10px rgba(0,212,255,0.4)', whiteSpace: 'nowrap' }}>
            ARCHIVO TEMPORAL
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left,transparent,rgba(0,212,255,0.3))' }} />
        </div>
        {isMaster && archiveImage && (
          <button
            onClick={() => onSetImage(null)}
            style={{ marginLeft: '12px', background: 'transparent', border: '1px solid rgba(255,68,68,0.4)', color: 'rgba(255,68,68,0.7)', fontFamily: 'Orbitron,monospace', fontSize: '0.42rem', letterSpacing: '0.1em', padding: '2px 8px', cursor: 'pointer', borderRadius: '1px', flexShrink: 0 }}
          >× BORRAR</button>
        )}
      </div>

      {/* Cuerpo */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}
        onDrop={isMaster ? handleDrop : undefined}
        onDragOver={isMaster ? e => { e.preventDefault(); setIsDragOver(true); } : undefined}
        onDragLeave={isMaster ? () => setIsDragOver(false) : undefined}
      >
        {archiveImage ? (
          <img
            src={archiveImage}
            alt="Archivo temporal"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', padding: '12px' }}>
            {isMaster ? (
              <>
                <span style={{ fontSize: '22px', color: 'rgba(0,212,255,0.15)', lineHeight: 1 }}>⇪</span>
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.42rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.28)', textAlign: 'center' }}>
                  ARRASTRA UNA IMAGEN
                </span>
              </>
            ) : (
              <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: '12px', color: 'rgba(0,212,255,0.2)' }}>Sin imagen</span>
            )}
          </div>
        )}

        {/* Overlay al arrastrar */}
        {isDragOver && isMaster && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,212,255,0.1)', border: '2px dashed rgba(0,212,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'var(--cyan)' }}>SOLTAR IMAGEN</span>
          </div>
        )}
      </div>
    </div>
  );
}
