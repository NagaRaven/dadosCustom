import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// En dev usa la variable de entorno; en producción conecta al mismo origen
const SERVER_URL = import.meta.env.VITE_API_URL || window.location.origin;

export function useSocket(username) {
  const socketRef = useRef(null);
  const [history, setHistory]           = useState([]);
  const [lastRoll, setLastRoll]         = useState(null);
  const [connectedUsers, setConnected]  = useState([]);
  const [forceStatus, setForceStatus]   = useState(null);
  const [forcePowers, setForcePowers]   = useState({});
  const [isConnected, setIsConnected]   = useState(false);
  const [characters, setCharacters]     = useState({});
  const [theme, setThemeState]          = useState('blue');

  useEffect(() => {
    if (!username) return;

    socketRef.current = io(SERVER_URL, { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join', username);
    });

    socketRef.current.on('disconnect', () => setIsConnected(false));

    socketRef.current.on('history', (rolls) => setHistory(rolls));

    socketRef.current.on('new_roll', (roll) => {
      setLastRoll(roll);
      // Si llegó una tirada y había un forzado activo, se consumió
      setForceStatus(null);
    });

    socketRef.current.on('users_update', (users) => setConnected(users));
    socketRef.current.on('force_powers_update', (powers) => setForcePowers(powers));
    socketRef.current.on('characters_update', (chars) => setCharacters(chars));
    socketRef.current.on('theme_update', (t) => {
      setThemeState(t);
      document.documentElement.classList.toggle('theme-yellow', t === 'yellow');
    });

    // Solo el Master recibe este evento — confirmación privada
    // forceStatus: 'critical' | 'fumble' | número (1-20)
    socketRef.current.on('force_confirmed', ({ type, value }) => {
      setForceStatus(type === 'custom' ? value : type);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [username]);

  const rollDice = (usedForce = false) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('roll_dice', { username, usedForce });
  };

  const forceResult = (type, value) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('force_result', { type, value });
  };

  const addForcePoint = (targetUsername) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('add_force_point', { targetUsername });
  };

  const updateCharacter = (username, data) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('update_character', { username, data });
  };

  const setTheme = (t) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('set_theme', t);
  };

  return { history, lastRoll, connectedUsers, forceStatus, forcePowers, isConnected, characters, theme, rollDice, forceResult, addForcePoint, updateCharacter, setTheme };
}
