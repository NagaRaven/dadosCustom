import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import DiceRoller from './DiceRoller';
import RollHistory from './RollHistory';
import MasterControls from './MasterControls';
import ForcePanel from './ForcePanel';
import CharacterSheet from './CharacterSheet';

const isMaster = (u) => u === 'Master';

export default function Dashboard({ username, onLogout }) {
  const {
    history, lastRoll, connectedUsers,
    forceStatus, forcePowers, isConnected,
    characters, theme, rollDice, forceResult, addForcePoint, updateCharacter, setTheme, updateNotes, setPlayerStatus,
  } = useSocket(username);
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="min-h-screen grid-bg flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="scan-line" />

      {/* ── Barra superior ──────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(var(--cyan-rgb),0.12)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ border: '1px solid rgba(var(--cyan-rgb),0.5)', boxShadow: '0 0 10px rgba(var(--cyan-rgb),0.3)' }}
          >
            ⬡
          </div>
          <span
            className="font-orbitron font-black tracking-wider text-xs hidden sm:block"
            style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(var(--cyan-rgb),0.5)' }}
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
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">

        {/* Columna izquierda — Dados */}
        <div className="flex flex-col gap-4 lg:w-[360px] shrink-0">
          <div className="glass-panel-bright rounded-sm p-4">
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
              />
            </>
          )}

          <div
            className="glass-panel rounded-sm px-4 py-3 font-mono text-xs text-center"
            style={{ color: 'rgba(0,212,255,0.35)' }}
          >
            Dado activo: d20 · Rango 1–20 · Historial máx. 20 tiradas
          </div>
        </div>

        {/* Columna central — Historial */}
        <div className="flex-1 min-h-0" style={{ minHeight: '400px' }}>
          <RollHistory history={history} currentUser={username} isAnimating={isAnimating} />
        </div>

        {/* Columna derecha — Ficha de personaje */}
        <div className="lg:w-[792px] shrink-0 min-h-0" style={{ minHeight: '400px' }}>
          <CharacterSheet
            username={username}
            isMaster={isMaster(username)}
            characters={characters}
            onUpdate={updateCharacter}
            onUpdateNotes={updateNotes}
          />
        </div>
      </main>
    </div>
  );
}
