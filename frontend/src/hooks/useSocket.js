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
  const [characters, setCharacters]         = useState({});
  const [theme, setThemeState]              = useState('blue');
  const [fortalezasCatalog, setFortalezasCatalog] = useState([]);
  const [archiveImage, setArchiveImageState]       = useState(null);

  useEffect(() => {
    if (!username) return;

    socketRef.current = io(SERVER_URL, { transports: ['polling', 'websocket'] });

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
    socketRef.current.on('fortalezas_catalog_update', (cat) => setFortalezasCatalog(cat));
    socketRef.current.on('archive_image_update', (img) => setArchiveImageState(img));

    socketRef.current.on('theme_update', (t) => {
      setThemeState(t);
      document.documentElement.classList.remove('theme-yellow', 'theme-red', 'theme-orange');
      if (t !== 'blue') document.documentElement.classList.add(`theme-${t}`);
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

  const updateNotes = (targetUser, notas) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('update_notes', { targetUser, notas });
  };

  const setPlayerStatus = (targetPlayer, status) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('set_player_status', { targetPlayer, status });
  };

  const updateFortalezasCatalog = (catalog) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('update_fortalezas_catalog', catalog);
  };

  const setArchiveImage = (imageData) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('set_archive_image', imageData);
  };

  return { history, lastRoll, connectedUsers, forceStatus, forcePowers, isConnected, characters, theme, fortalezasCatalog, archiveImage, rollDice, forceResult, addForcePoint, updateCharacter, setTheme, updateNotes, setPlayerStatus, updateFortalezasCatalog, setArchiveImage };
}
