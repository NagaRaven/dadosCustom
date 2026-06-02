import { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
import { useSocket } from '../hooks/useSocket';
import DiceRoller from './DiceRoller';
import RollHistory from './RollHistory';
import MasterControls from './MasterControls';
import ForcePanel from './ForcePanel';
import CharacterSheet from './CharacterSheet';
import ArchiveTemp from './ArchiveTemp';
import CharacterRegistry from './CharacterRegistry';
import LocationRegistry from './LocationRegistry';
import Zygerria from './Zygerria';

const isMaster = (u) => u === 'Master';

export default function Dashboard({ username, onLogout }) {
  const {
    history, lastRoll, connectedUsers,
    forceStatus, forcePowers, isConnected,
    characters, theme, fortalezasCatalog, archiveImage, zygerriaHouses,
    rollDice, forceResult, addForcePoint, subtractForcePoint, updateCharacter, setTheme,
    updateNotes, setPlayerStatus, updateFortalezasCatalog, setArchiveImage,
    addZygerriaHouse, updateZygerriaHouse, deleteZygerriaHouse,
  } = useSocket(username);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [menuOpen, setMenuOpen] = useState(false);
  const importInputRef = useRef(null);

  function handleImportDB(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const res = await fetch(`${API_URL}/api/import-db`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) alert('Error al importar: ' + json.message);
      } catch {
        alert('Fichero inválido o error de red.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="scan-line" />

      {/* ── Barra superior ──────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(var(--cyan-rgb),0.12)' }}
      >
        <div className="flex items-center gap-3">
          {/* Menú hamburguesa — sustituye al octógono */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              title="Menú"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: menuOpen ? 'rgba(0,212,255,0.12)' : 'transparent',
                border: '1px solid rgba(var(--cyan-rgb),0.5)',
                boxShadow: '0 0 10px rgba(var(--cyan-rgb),0.3)',
                color: 'rgba(0,212,255,0.85)',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1,
              }}
            >
              ☰
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 50,
                  background: '#0d0d14',
                  border: '1px solid rgba(0,212,255,0.25)',
                  borderRadius: '3px',
                  minWidth: '230px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                }}
              >
                <button
                  onClick={() => { setCurrentView('main'); setMenuOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid rgba(0,212,255,0.08)',
                    color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace',
                    fontSize: '0.6rem', letterSpacing: '0.1em',
                    padding: '10px 14px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  ⌂ HOME
                </button>
                <button
                  onClick={() => { setCurrentView('registry'); setMenuOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid rgba(0,212,255,0.08)',
                    color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace',
                    fontSize: '0.6rem', letterSpacing: '0.1em',
                    padding: '10px 14px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  REGISTRO DE PERSONAJES
                </button>
                <button
                  onClick={() => { setCurrentView('locations'); setMenuOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid rgba(0,212,255,0.08)',
                    color: 'rgba(0,212,255,0.75)', fontFamily: 'Orbitron, monospace',
                    fontSize: '0.6rem', letterSpacing: '0.1em',
                    padding: '10px 14px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  REGISTRO DE UBICACIONES
                </button>
                <button
                  onClick={() => { setCurrentView('zygerria'); setMenuOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'rgba(217,168,74,0.07)', border: 'none',
                    color: '#d9a84a', fontFamily: 'Orbitron, monospace',
                    fontSize: '0.65rem', fontWeight: 900,
                    letterSpacing: '0.18em', padding: '12px 14px', cursor: 'pointer',
                    textShadow: '0 0 10px rgba(217,168,74,0.4)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,168,74,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,168,74,0.07)'}
                >
                  ✦ ZYGERRIA
                </button>
              </div>
            )}
          </div>
          <span
            className="font-orbitron font-black tracking-wider text-xs hidden sm:block"
            style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(var(--cyan-rgb),0.5)', cursor: 'pointer' }}
            onClick={() => setCurrentView('main')}
            title="Ir a la pantalla principal"
          >
            STAR WARS — LA TIERRA PROMETIDA
          </span>
        </div>

        {/* Usuarios online */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {connectedUsers.map((u) => (
            <span
              key={u}
              className="font-mono text-xs px-2 py-0.5 rounded-sm"
              style={{
                background: u === username ? 'rgba(var(--cyan-rgb),0.12)' : 'rgba(var(--cyan-rgb),0.04)',
                border: `1px solid ${u === username ? 'rgba(var(--cyan-rgb),0.5)' : 'rgba(var(--cyan-rgb),0.15)'}`,
                color: u === username ? 'var(--cyan)' : 'rgba(var(--cyan-rgb),0.5)',
              }}
            >
              {u}
            </span>
          ))}
        </div>

        {/* Estado + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isConnected ? '#00ff88' : '#ff4444',
                boxShadow: isConnected ? '0 0 6px #00ff88' : '0 0 6px #ff4444',
              }}
            />
            <span
              className="font-orbitron text-xs tracking-widest hidden sm:block"
              style={{ color: isConnected ? '#00ff88' : '#ff4444' }}
            >
              {username}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="cyber-btn py-1.5 px-3"
            style={{ fontSize: '0.6rem', borderColor: 'rgba(var(--cyan-rgb),0.4)', color: 'rgba(var(--cyan-rgb),0.6)' }}
          >
            SALIR
          </button>
        </div>
      </header>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      {currentView === 'registry' ? (
        <main className="flex-1 flex flex-col min-h-0">
          <CharacterRegistry onBack={() => setCurrentView('main')} />
        </main>
      ) : currentView === 'locations' ? (
        <main className="flex-1 flex flex-col min-h-0">
          <LocationRegistry onBack={() => setCurrentView('main')} />
        </main>
      ) : currentView === 'zygerria' ? (
        <main className="flex-1 flex flex-col min-h-0">
          <Zygerria
            isMaster={isMaster(username)}
            houses={zygerriaHouses}
            onAddHouse={addZygerriaHouse}
            onUpdateHouse={updateZygerriaHouse}
            onDeleteHouse={deleteZygerriaHouse}
          />
        </main>
      ) : (
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 min-h-0">

        {/* ── Columna izquierda ─────────────────────────────────────────────
            · md–xl : historial (arriba flex-1) + dados/master (abajo)  40%
            · xl+   : solo dados/master — ancho fijo 320px (360px en 2xl) */}
        <div className="flex flex-col gap-4 shrink-0 min-h-0 md:w-[40%] xl:w-[320px] 2xl:w-[360px]">

          {/* Dados */}
          <div className="glass-panel-bright rounded-sm p-4 shrink-0">
            <div
              className="font-orbitron text-xs tracking-widest mb-4"
              style={{ color: 'rgba(0,212,255,0.5)', borderBottom: '1px solid rgba(0,212,255,0.1)', paddingBottom: '8px' }}
            >
              TIRADA DE DADOS
            </div>
            <DiceRoller
              username={username}
              lastRoll={lastRoll}
              onRoll={rollDice}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationEnd={() => setIsAnimating(false)}
              myForcePower={forcePowers[username]}
              isMaster={isMaster(username)}
            />
          </div>

          {/* Paneles exclusivos del Master */}
          {isMaster(username) && (
            <>
              <MasterControls onForce={forceResult} forceStatus={forceStatus} theme={theme} onSetTheme={setTheme} connectedUsers={connectedUsers} characters={characters} onSetStatus={setPlayerStatus} />
              <ForcePanel
                connectedUsers={connectedUsers}
                forcePowers={forcePowers}
                onAddForce={addForcePoint}
                onSubtractForce={subtractForcePoint}
                fortalezasCatalog={fortalezasCatalog}
                onUpdateCatalog={updateFortalezasCatalog}
              />
            </>
          )}

          {/* Historial + Archivo Temporal — tablet (oculto en escritorio xl+) */}
          <div className="flex-1 min-h-0 xl:hidden flex flex-col gap-4" style={{ minHeight: '200px' }}>
            <div className="shrink-0">
              <RollHistory history={history} currentUser={username} isAnimating={isAnimating} />
            </div>
            <div className="flex-1 min-h-0">
              <ArchiveTemp isMaster={isMaster(username)} archiveImage={archiveImage} onSetImage={setArchiveImage} />
            </div>
          </div>

          <div
            className="glass-panel rounded-sm px-4 py-3 font-mono text-xs shrink-0"
            style={{ color: 'rgba(0,212,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
{isMaster(username) && (
              <>
                <input ref={importInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportDB} />
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = `${API_URL}/api/export-db`;
                    a.click();
                  }}
                  title="Exportar base de datos"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.35)',
                    color: 'rgba(0,212,255,0.75)',
                    borderRadius: '2px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                  }}
                >
                  ↓ EXPORTAR BD
                </button>
                <button
                  onClick={() => importInputRef.current?.click()}
                  title="Importar base de datos"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.35)',
                    color: 'rgba(0,212,255,0.75)',
                    borderRadius: '2px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                  }}
                >
                  ↑ IMPORTAR BD
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Historial + Archivo Temporal — solo escritorio xl+ ──────────── */}
        <div className="hidden xl:flex flex-col flex-1 min-h-0 gap-4" style={{ minHeight: '400px' }}>
          <div className="shrink-0">
            <RollHistory history={history} currentUser={username} isAnimating={isAnimating} />
          </div>
          <div className="flex-1 min-h-0">
            <ArchiveTemp isMaster={isMaster(username)} archiveImage={archiveImage} onSetImage={setArchiveImage} />
          </div>
        </div>

        {/* ── Ficha de personaje ────────────────────────────────────────────
            · Tablet (md–xl) : flex-1, toma el resto (>55% de pantalla)
            · Escritorio xl+ : 700px fijo  (792px en 2xl)                 */}
        <div className="md:flex-1 xl:flex-none xl:w-[700px] 2xl:w-[792px] shrink-0 min-h-0" style={{ minHeight: '400px' }}>
          <CharacterSheet
            username={username}
            isMaster={isMaster(username)}
            characters={characters}
            onUpdate={updateCharacter}
            onUpdateNotes={updateNotes}
            fortalezasCatalog={fortalezasCatalog}
          />
        </div>
      </main>
      )}
    </div>
  );
}
