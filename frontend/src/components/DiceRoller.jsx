import { useState, useEffect, useRef } from 'react';

const CYCLE_SPEED_MS = 55;
const CYCLE_STEPS    = 18;

function getResultClass(val) {
  if (val === 20) return 'dice-result-crit';
  if (val === 1)  return 'dice-result-fumble';
  return 'dice-result-normal';
}

function getResultLabel(val) {
  if (val === 20) return { text: '— CRÍTICO NATURAL —', color: '#ffd700' };
  if (val === 1)  return { text: '— PIFIA NATURAL —',   color: '#ff4444' };
  return null;
}

export default function DiceRoller({ username, lastRoll, onRoll, onAnimationStart, onAnimationEnd }) {
  const [displayValue, setDisplayValue] = useState(null);
  const [resultValue,  setResultValue]  = useState(null);
  const [isRolling,    setIsRolling]    = useState(false);
  const [animKey,      setAnimKey]      = useState(0);
  const intervalRef = useRef(null);

  // Dispara animación cuando llega una tirada propia
  useEffect(() => {
    if (!lastRoll || lastRoll.username !== username) return;

    clearInterval(intervalRef.current);
    setIsRolling(true);
    setResultValue(null);
    onAnimationStart?.();

    let steps = 0;
    intervalRef.current = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 20) + 1);
      steps++;
      if (steps >= CYCLE_STEPS) {
        clearInterval(intervalRef.current);
        setDisplayValue(lastRoll.result);
        setResultValue(lastRoll.result);
        setAnimKey((k) => k + 1);
        setIsRolling(false);
        onAnimationEnd?.();
      }
    }, CYCLE_SPEED_MS);

    return () => clearInterval(intervalRef.current);
  }, [lastRoll, username]);

  const handleRoll = () => {
    if (isRolling) return;
    onRoll();
  };

  const label = resultValue !== null ? getResultLabel(resultValue) : null;

  return (
    <div className="flex flex-col items-center gap-6 py-4">

      {/* Pantalla de resultado */}
      <div
        className="relative hud-corners-full glass-panel rounded-sm flex flex-col items-center justify-center"
        style={{ width: '100%', minHeight: '200px' }}
      >
        {/* Indicador de estado */}
        <div
          className="absolute top-3 left-4 font-mono text-xs tracking-widest"
          style={{ color: 'rgba(0,212,255,0.4)' }}
        >
          1d20
        </div>
        <div
          className="absolute top-3 right-4 font-mono text-xs"
          style={{ color: isRolling ? '#ffd700' : 'rgba(0,212,255,0.3)' }}
        >
          {isRolling ? '● TIRANDO' : '○ EN ESPERA'}
        </div>

        {/* Número principal */}
        {displayValue !== null ? (
          <div key={animKey} style={{ animation: isRolling ? 'none' : 'result-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
            <span
              className={`font-orbitron font-black select-none ${isRolling ? 'dice-result-cycle' : getResultClass(resultValue)}`}
              style={{ fontSize: 'clamp(5rem, 15vw, 8rem)', lineHeight: 1, display: 'block' }}
            >
              {displayValue}
            </span>
          </div>
        ) : (
          <span
            className="font-orbitron font-black select-none"
            style={{ fontSize: 'clamp(4rem, 12vw, 6rem)', color: 'rgba(0,212,255,0.15)', lineHeight: 1 }}
          >
            ?
          </span>
        )}

        {/* Etiqueta crítico/pifia */}
        {label && !isRolling && (
          <div
            className="font-orbitron text-xs tracking-widest mt-2"
            style={{ color: label.color, textShadow: `0 0 10px ${label.color}` }}
          >
            {label.text}
          </div>
        )}
      </div>

      {/* Botón principal de tirada */}
      <button
        onClick={handleRoll}
        disabled={isRolling}
        className="relative select-none"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: isRolling
            ? 'rgba(0,212,255,0.04)'
            : 'radial-gradient(ellipse at center, rgba(0,212,255,0.12) 0%, rgba(0,0,0,0) 70%)',
          border: `2px solid ${isRolling ? 'rgba(0,212,255,0.3)' : '#00d4ff'}`,
          boxShadow: isRolling
            ? 'none'
            : '0 0 30px rgba(0,212,255,0.35), 0 0 60px rgba(0,212,255,0.15), inset 0 0 30px rgba(0,212,255,0.08)',
          cursor: isRolling ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          animation: isRolling ? 'none' : 'glow-pulse 2s ease-in-out infinite',
        }}
      >
        {/* Anillos decorativos */}
        <div
          style={{
            position: 'absolute', inset: '12px',
            borderRadius: '50%',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: '24px',
            borderRadius: '50%',
            border: '1px dashed rgba(0,212,255,0.1)',
          }}
        />

        {/* Texto del botón */}
        <div className="flex flex-col items-center justify-center h-full">
          <span
            className="font-orbitron font-black tracking-widest"
            style={{
              fontSize: '1rem',
              color: isRolling ? 'rgba(0,212,255,0.4)' : '#00d4ff',
              display: 'block',
            }}
          >
            {isRolling ? 'TIRANDO' : 'TIRAR'}
          </span>
          <span
            className="font-orbitron font-black"
            style={{
              fontSize: '2rem',
              color: isRolling ? 'rgba(0,212,255,0.4)' : '#00d4ff',
              lineHeight: 1.1,
            }}
          >
            d20
          </span>
          {!isRolling && (
            <div
              style={{
                width: '40px', height: '1px', marginTop: '8px',
                background: 'linear-gradient(to right, transparent, #00d4ff, transparent)',
              }}
            />
          )}
        </div>
      </button>
    </div>
  );
}
