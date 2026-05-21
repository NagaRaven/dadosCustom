const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { validateLogin, processRoll, limitHistory, FORCE_PLAYERS } = require('./gameLogic');

// Railway siempre inyecta RAILWAY_ENVIRONMENT; también acepta NODE_ENV=production
const isProd = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;

const app = express();
const server = http.createServer(app);

// En producción el frontend se sirve desde el mismo servidor, no hay CORS
const corsOrigin = isProd ? false : ['http://localhost:5173', 'http://localhost:4173'];

const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
});

if (!isProd) {
  app.use(cors({ origin: corsOrigin }));
}
app.use(express.json());

// ── Persistencia del historial ───────────────────────────────────────────────
const HISTORY_FILE    = path.join(__dirname, 'data', 'history.json');
const CHARACTERS_FILE = path.join(__dirname, 'data', 'characters.json');
const FORTALEZAS_FILE = path.join(__dirname, 'data', 'fortalezas.json');

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function saveHistory(history) {
  try {
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
  } catch {}
}

// ── Persistencia de fichas de personaje ─────────────────────────────────────
function makeDefaultCharacter() {
  return {
    avatar: null,
    nombre: '', apellidos: '', raza: '', clase: '',
    profesion: '', afiliacion: '', px: '',
    creditos: { enPosesion: '', enElBanco: '' },
    realesDeAOcho: { enPosesion: '', enElBanco: '' },
    inventario: [],
    habilidadesEspeciales: [],
    fortalezas: [],
    notas: '',
    estado: 'Intacto',
  };
}

function loadCharacters() {
  try {
    if (fs.existsSync(CHARACTERS_FILE)) {
      const saved = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
      return Object.fromEntries(FORCE_PLAYERS.map(p => [p, saved[p] || makeDefaultCharacter()]));
    }
  } catch {}
  return Object.fromEntries(FORCE_PLAYERS.map(p => [p, makeDefaultCharacter()]));
}

function saveCharacters(chars) {
  try {
    fs.mkdirSync(path.dirname(CHARACTERS_FILE), { recursive: true });
    fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(chars, null, 2));
  } catch {}
}

// ── Persistencia del catálogo de fortalezas ─────────────────────────────────
function loadFortalezas() {
  try {
    if (fs.existsSync(FORTALEZAS_FILE)) {
      return JSON.parse(fs.readFileSync(FORTALEZAS_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function saveFortalezas(catalog) {
  try {
    fs.mkdirSync(path.dirname(FORTALEZAS_FILE), { recursive: true });
    fs.writeFileSync(FORTALEZAS_FILE, JSON.stringify(catalog, null, 2));
  } catch {}
}

let fortalezasCatalog = loadFortalezas();
let characters = loadCharacters();
let archiveImage = null; // temporal — no se persiste

// Puntos de Fuerza — inicializados a 2 por jugador (el Master no tiene)
let forcePowers = Object.fromEntries(FORCE_PLAYERS.map(p => [p, 2]));

// Estado compartido del servidor
let rollHistory = loadHistory();  // persiste entre reinicios
let forcedResult = null;          // null | 'critical' | 'fumble' | number
let connectedUsers = {};          // socketId -> username
let currentTheme  = 'blue';      // 'blue' | 'yellow' | 'red' | 'orange'

// ── HTTP ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok' }));


app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
  }

  if (validateLogin(username, password)) {
    return res.json({ success: true, username });
  }

  return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
});

// ── Socket.IO ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  socket.emit('history', rollHistory);
  socket.emit('force_powers_update', forcePowers);
  socket.emit('characters_update', characters);
  socket.emit('theme_update', currentTheme);
  socket.emit('fortalezas_catalog_update', fortalezasCatalog);
  socket.emit('archive_image_update', archiveImage);

  socket.on('join', (username) => {
    connectedUsers[socket.id] = username;
    io.emit('users_update', Object.values(connectedUsers));
  });

  socket.on('roll_dice', ({ username, usedForce }) => {
    // Consumir punto de Fuerza si el jugador lo ha activado y tiene puntos
    let forceUsed = false;
    if (usedForce && forcePowers[username] !== undefined && forcePowers[username] > 0) {
      forcePowers[username]--;
      forceUsed = true;
      io.emit('force_powers_update', forcePowers);
    }

    const { roll, nextForced } = processRoll(username, forcedResult);
    forcedResult = nextForced;
    roll.usedForce = forceUsed;

    rollHistory.push(roll);
    rollHistory = limitHistory(rollHistory);
    saveHistory(rollHistory);

    io.emit('new_roll', roll);
    io.emit('history', rollHistory);
  });

  // Master: añadir un punto de Fuerza a un jugador
  socket.on('add_force_point', ({ targetUsername }) => {
    const sender = connectedUsers[socket.id];
    if (sender !== 'Master') return;
    if (!FORCE_PLAYERS.includes(targetUsername)) return;
    forcePowers[targetUsername]++;
    io.emit('force_powers_update', forcePowers);
  });

  // Master: cambiar tema de color de la aplicación
  socket.on('set_theme', (theme) => {
    const sender = connectedUsers[socket.id];
    if (sender !== 'Master') return;
    if (!['blue', 'yellow', 'red', 'orange'].includes(theme)) return;
    currentTheme = theme;
    io.emit('theme_update', theme);
  });

  // Master: actualizar ficha de personaje de un jugador
  socket.on('update_character', ({ username, data }) => {
    const sender = connectedUsers[socket.id];
    if (sender !== 'Master') return;
    if (!FORCE_PLAYERS.includes(username)) return;
    characters[username] = { ...makeDefaultCharacter(), ...data };
    saveCharacters(characters);
    io.emit('characters_update', characters);
  });

  // Solo el Master puede armar resultados forzados — verificado server-side
  socket.on('force_result', ({ type, value }) => {
    const username = connectedUsers[socket.id];
    if (username !== 'Master') return;

    if (type === 'custom') {
      const num = parseInt(value, 10);
      if (!Number.isInteger(num) || num < 1 || num > 20) return;
      forcedResult = num;
    } else if (type === 'critical' || type === 'fumble') {
      forcedResult = type;
    } else {
      return;
    }

    socket.emit('force_confirmed', { type, value: forcedResult });
  });

  // Master: actualizar catálogo global de fortalezas
  socket.on('update_fortalezas_catalog', (catalog) => {
    const sender = connectedUsers[socket.id];
    if (sender !== 'Master') return;
    if (!Array.isArray(catalog)) return;
    fortalezasCatalog = catalog.filter(f => f && typeof f.nombre === 'string' && f.nombre.trim());
    saveFortalezas(fortalezasCatalog);
    io.emit('fortalezas_catalog_update', fortalezasCatalog);
  });

  // Master: cambiar el estado de un jugador
  socket.on('set_player_status', ({ targetPlayer, status }) => {
    const sender = connectedUsers[socket.id];
    if (sender !== 'Master') return;
    if (!FORCE_PLAYERS.includes(targetPlayer)) return;
    const VALID = ['Intacto','Herido leve','Herido grave','Enfermo','Aturdido','Lesionado','Heridas críticas'];
    if (!VALID.includes(status)) return;
    characters[targetPlayer] = { ...characters[targetPlayer], estado: status };
    saveCharacters(characters);
    io.emit('characters_update', characters);
  });

  // Jugador o Master pueden actualizar las notas de un personaje
  socket.on('update_notes', ({ targetUser, notas }) => {
    const sender = connectedUsers[socket.id];
    if (sender !== 'Master' && sender !== targetUser) return;
    if (!FORCE_PLAYERS.includes(targetUser)) return;
    if (typeof notas !== 'string') return;
    characters[targetUser] = { ...characters[targetUser], notas };
    saveCharacters(characters);
    io.emit('characters_update', characters);
  });

  // Master: imagen temporal (no se persiste, solo vive en memoria)
  socket.on('set_archive_image', (imageData) => {
    const sender = connectedUsers[socket.id];
    if (sender !== 'Master') return;
    if (imageData !== null && typeof imageData !== 'string') return;
    archiveImage = imageData;
    io.emit('archive_image_update', archiveImage);
  });

  socket.on('disconnect', () => {
    delete connectedUsers[socket.id];
    io.emit('users_update', Object.values(connectedUsers));
  });
});

// ── Producción: servir el frontend compilado ─────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  const indexHtml = path.join(distPath, 'index.html');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      res.status(503).json({ error: 'Frontend no compilado' });
    }
  });
}

module.exports = { app, server, io };
