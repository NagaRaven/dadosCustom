const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { validateLogin, processRoll, limitHistory, FORCE_PLAYERS, TIMELINE_EDITORS } = require('./gameLogic');

// Railway siempre inyecta RAILWAY_ENVIRONMENT; también acepta NODE_ENV=production
const isProd = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;

const app = express();
const server = http.createServer(app);

// En producción el frontend se sirve desde el mismo servidor, no hay CORS
const corsOrigin = isProd ? false : ['http://localhost:5173', 'http://localhost:4173'];

const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
  maxHttpBufferSize: 10 * 1024 * 1024, // 10 MB — suficiente para imágenes arrastradas
});

if (!isProd) {
  app.use(cors({ origin: corsOrigin }));
}
app.use(express.json());

// ── Persistencia del historial ───────────────────────────────────────────────
const HISTORY_FILE     = path.join(__dirname, 'data', 'history.json');
const CHARACTERS_FILE  = path.join(__dirname, 'data', 'characters.json');
const FORTALEZAS_FILE  = path.join(__dirname, 'data', 'fortalezas.json');
const ZYGERRIA_FILE    = path.join(__dirname, 'data', 'zygerria.json');
const TIMELINE_FILE              = path.join(__dirname, 'data', 'timeline.json');
const CATALOG_CHARACTERS_FILE   = path.join(__dirname, 'data', 'catalog_characters.json');
const PLANETS_FILE               = path.join(__dirname, 'data', 'planets.json');
const MAPA_POIS_FILE             = path.join(__dirname, 'data', 'mapazygerria.json');

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
    nombre: '', raza: '', clase: '',
    profesion: '', afiliacion: '',
    puntosDeFuerza: 2,
    creditos: { enPosesion: '', enElBanco: '' },
    realesDeAOcho: { enPosesion: '', enElBanco: '' },
    inventario: [],
    posesiones: [],
    habilidadesEspeciales: [],
    dolencias: [],
    fortalezas: [],
    notas: '',
    estado: 'Intacto',
  };
}

function loadCharacters() {
  try {
    if (fs.existsSync(CHARACTERS_FILE)) {
      const saved = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
      return Object.fromEntries(FORCE_PLAYERS.map(p => [p, { ...makeDefaultCharacter(), ...(saved[p] || {}) }]));
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

// ── Persistencia de casas nobles Zygerrianas ─────────────────────────────────
function loadZygerriaHouses() {
  try {
    if (fs.existsSync(ZYGERRIA_FILE)) {
      const houses = JSON.parse(fs.readFileSync(ZYGERRIA_FILE, 'utf8'));
      // Eliminar campo status si existía en datos anteriores
      return houses.map(({ status, ...rest }) => rest);
    }
  } catch {}
  return [];
}

function saveZygerriaHouses(houses) {
  try {
    fs.mkdirSync(path.dirname(ZYGERRIA_FILE), { recursive: true });
    fs.writeFileSync(ZYGERRIA_FILE, JSON.stringify(houses, null, 2));
  } catch {}
}

const VALID_TIMELINE_PLAYERS = ['Nivare', 'Dana', 'Bor Ashla', 'Khan', 'Ace', 'Xalithra', 'Mireya', "Luz'ya"];

// ── Persistencia de la línea cronológica ─────────────────────────────────────
function loadTimeline() {
  try {
    if (fs.existsSync(TIMELINE_FILE)) {
      return JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function saveTimeline(events) {
  try {
    fs.mkdirSync(path.dirname(TIMELINE_FILE), { recursive: true });
    fs.writeFileSync(TIMELINE_FILE, JSON.stringify(events, null, 2));
  } catch {}
}

// ── Persistencia del catálogo de personajes del mundo ───────────────────────
function loadCatalogCharacters() {
  try {
    if (fs.existsSync(CATALOG_CHARACTERS_FILE)) {
      return JSON.parse(fs.readFileSync(CATALOG_CHARACTERS_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function saveCatalogCharacters(chars) {
  try {
    fs.mkdirSync(path.dirname(CATALOG_CHARACTERS_FILE), { recursive: true });
    fs.writeFileSync(CATALOG_CHARACTERS_FILE, JSON.stringify(chars, null, 2));
  } catch {}
}

// ── Persistencia del catálogo de planetas ───────────────────────────────────
function loadPlanets() {
  try {
    if (fs.existsSync(PLANETS_FILE)) {
      return JSON.parse(fs.readFileSync(PLANETS_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function savePlanets(pl) {
  try {
    fs.mkdirSync(path.dirname(PLANETS_FILE), { recursive: true });
    fs.writeFileSync(PLANETS_FILE, JSON.stringify(pl, null, 2));
  } catch {}
}

// ── Persistencia del mapa de Zygerria (puntos de interés) ───────────────────
function loadMapaPois() {
  try {
    if (fs.existsSync(MAPA_POIS_FILE)) {
      return JSON.parse(fs.readFileSync(MAPA_POIS_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function saveMapaPois(pois) {
  try {
    fs.mkdirSync(path.dirname(MAPA_POIS_FILE), { recursive: true });
    fs.writeFileSync(MAPA_POIS_FILE, JSON.stringify(pois, null, 2));
  } catch {}
}

function reindexTimeline(events) {
  const sorted = [...events].sort((a, b) => b.orden - a.orden);
  const minGap = sorted.length < 2 ? Infinity : sorted.reduce((min, e, i) => {
    if (i === 0) return min;
    return Math.min(min, sorted[i - 1].orden - e.orden);
  }, Infinity);
  if (minGap < 0.01) {
    sorted.forEach((e, i) => { e.orden = (sorted.length - i) * 1000; });
  }
}


let fortalezasCatalog    = loadFortalezas();
let zygerriaHouses       = loadZygerriaHouses();
let timelineEvents       = loadTimeline();
let characters           = loadCharacters();
let catalogCharacters    = loadCatalogCharacters();
let planets              = loadPlanets();
let mapaPois             = loadMapaPois();
let archiveImage = null; // temporal — no se persiste

const isAdmin = (u) => u === 'Master' || u === 'Desarrollador';

// Estado compartido del servidor
let rollHistory = loadHistory();  // persiste entre reinicios
let forcedResult = null;          // null | 'critical' | 'fumble' | number
let connectedUsers = {};          // socketId -> username
let currentTheme  = 'blue';      // 'blue' | 'yellow' | 'red' | 'orange'

// ── HTTP ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Descarga completa de la BD — solo para uso del Master
app.get('/api/export-db', (_req, res) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    history: rollHistory,
    characters,
    fortalezasCatalog,
    zygerriaHouses,
    timelineEvents,
    catalogCharacters,
    planets,
    mapaPois,
  };
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  res.setHeader('Content-Disposition', `attachment; filename="d20-backup-${ts}.json"`);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(exportData);
});


// Importar BD — reemplaza todos los datos con el fichero de backup
app.post('/api/import-db', (req, res) => {
  const { history, characters: importedChars, fortalezasCatalog: importedFortalezas, zygerriaHouses: importedZyg, timelineEvents: importedTimeline, catalogCharacters: importedCatalogChars, planets: importedPlanets, mapaPois: importedMapaPois } = req.body || {};
  if (!importedChars || typeof importedChars !== 'object') {
    return res.status(400).json({ success: false, message: 'Fichero inválido: falta characters' });
  }
  if (Array.isArray(importedFortalezas)) {
    fortalezasCatalog = importedFortalezas;
    saveFortalezas(fortalezasCatalog);
    io.emit('fortalezas_catalog_update', fortalezasCatalog);
  }
  if (Array.isArray(history)) {
    rollHistory = history;
    saveHistory(rollHistory);
    io.emit('history', rollHistory);
  }
  characters = Object.fromEntries(
    FORCE_PLAYERS.map(p => [p, importedChars[p] || makeDefaultCharacter()])
  );
  saveCharacters(characters);
  io.emit('characters_update', characters);
  if (Array.isArray(importedZyg)) {
    zygerriaHouses = importedZyg;
    saveZygerriaHouses(zygerriaHouses);
    io.emit('zygerria_houses_update', zygerriaHouses);
  }
  if (Array.isArray(importedTimeline)) {
    timelineEvents = importedTimeline;
    saveTimeline(timelineEvents);
    io.emit('timeline_events_update', timelineEvents);
  }
  if (Array.isArray(importedCatalogChars)) {
    catalogCharacters = importedCatalogChars;
    saveCatalogCharacters(catalogCharacters);
    io.emit('catalog_characters_update', catalogCharacters);
  }
  if (Array.isArray(importedPlanets)) {
    planets = importedPlanets;
    savePlanets(planets);
    io.emit('planets_update', planets);
  }
  if (Array.isArray(importedMapaPois)) {
    mapaPois = importedMapaPois;
    saveMapaPois(mapaPois);
    io.emit('mapa_pois_update', mapaPois);
  }
  res.json({ success: true });
});

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
  socket.emit('characters_update', characters);
  socket.emit('theme_update', currentTheme);
  socket.emit('fortalezas_catalog_update', fortalezasCatalog);
  socket.emit('archive_image_update', archiveImage);
  socket.emit('zygerria_houses_update', zygerriaHouses);
  socket.emit('mapa_pois_update', mapaPois);
  socket.emit('timeline_events_update', timelineEvents);
  socket.emit('catalog_characters_update', catalogCharacters);
  socket.emit('planets_update', planets);

  socket.on('join', (username) => {
    connectedUsers[socket.id] = username;
    io.emit('users_update', [...new Set(Object.values(connectedUsers))]);
  });

  socket.on('roll_dice', ({ username, usedForce }) => {
    // Consumir punto de Fuerza si el jugador lo ha activado y tiene puntos
    let forceUsed = false;
    if (usedForce && (characters[username]?.puntosDeFuerza ?? 0) > 0) {
      characters[username].puntosDeFuerza--;
      forceUsed = true;
      saveCharacters(characters);
      io.emit('characters_update', characters);
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

  // Master/Desarrollador: añadir un punto de Fuerza a un jugador
  socket.on('add_force_point', ({ targetUsername }) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender)) return;
    if (!FORCE_PLAYERS.includes(targetUsername)) return;
    characters[targetUsername].puntosDeFuerza = (characters[targetUsername].puntosDeFuerza ?? 0) + 1;
    saveCharacters(characters);
    io.emit('characters_update', characters);
  });

  // Master/Desarrollador: restar un punto de Fuerza a un jugador (mínimo 0)
  socket.on('subtract_force_point', ({ targetUsername }) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender)) return;
    if (!FORCE_PLAYERS.includes(targetUsername)) return;
    const current = characters[targetUsername].puntosDeFuerza ?? 0;
    if (current > 0) characters[targetUsername].puntosDeFuerza = current - 1;
    saveCharacters(characters);
    io.emit('characters_update', characters);
  });

  // Master/Desarrollador: cambiar tema de color de la aplicación
  socket.on('set_theme', (theme) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender)) return;
    if (!['blue', 'yellow', 'red', 'orange'].includes(theme)) return;
    currentTheme = theme;
    io.emit('theme_update', theme);
  });

  // Master/Desarrollador: actualizar ficha de personaje de un jugador
  socket.on('update_character', ({ username, data }) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender)) return;
    if (!FORCE_PLAYERS.includes(username)) return;
    const puntosDeFuerza = characters[username]?.puntosDeFuerza ?? 2;
    characters[username] = { ...makeDefaultCharacter(), ...data, puntosDeFuerza };
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

  // Master/Desarrollador: actualizar catálogo global de fortalezas
  socket.on('update_fortalezas_catalog', (catalog) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender)) return;
    if (!Array.isArray(catalog)) return;
    fortalezasCatalog = catalog.filter(f => f && typeof f.nombre === 'string' && f.nombre.trim());
    saveFortalezas(fortalezasCatalog);
    io.emit('fortalezas_catalog_update', fortalezasCatalog);
  });

  // Master/Desarrollador: cambiar el estado de un jugador
  socket.on('set_player_status', ({ targetPlayer, status }) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender)) return;
    if (!FORCE_PLAYERS.includes(targetPlayer)) return;
    const VALID = ['Intacto','Herido leve','Herido grave','Enfermo','Aturdido','Lesionado','Heridas críticas'];
    if (!VALID.includes(status)) return;
    characters[targetPlayer] = { ...characters[targetPlayer], estado: status };
    saveCharacters(characters);
    io.emit('characters_update', characters);
  });

  // Jugador, Master o Desarrollador pueden actualizar las notas de un personaje
  socket.on('update_notes', ({ targetUser, notas }) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender) && sender !== targetUser) return;
    if (!FORCE_PLAYERS.includes(targetUser)) return;
    if (typeof notas !== 'string') return;
    characters[targetUser] = { ...characters[targetUser], notas };
    saveCharacters(characters);
    io.emit('characters_update', characters);
  });

  // Master/Desarrollador: imagen temporal (no se persiste, solo vive en memoria)
  socket.on('set_archive_image', (imageData) => {
    const sender = connectedUsers[socket.id];
    if (!isAdmin(sender)) return;
    if (imageData !== null && typeof imageData !== 'string') return;
    archiveImage = imageData;
    io.emit('archive_image_update', archiveImage);
  });

  // Master/Desarrollador: CRUD de casas nobles Zygerrianas
  socket.on('add_zygerria_house', (house) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    const newHouse = { id: String(Date.now()), ...house };
    zygerriaHouses.push(newHouse);
    saveZygerriaHouses(zygerriaHouses);
    io.emit('zygerria_houses_update', zygerriaHouses);
  });

  socket.on('update_zygerria_house', ({ id, data }) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    const idx = zygerriaHouses.findIndex(h => h.id === id);
    if (idx === -1) return;
    zygerriaHouses[idx] = { ...zygerriaHouses[idx], ...data };
    saveZygerriaHouses(zygerriaHouses);
    io.emit('zygerria_houses_update', zygerriaHouses);
  });

  socket.on('delete_zygerria_house', (id) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    zygerriaHouses = zygerriaHouses.filter(h => h.id !== id);
    saveZygerriaHouses(zygerriaHouses);
    io.emit('zygerria_houses_update', zygerriaHouses);
  });

  // Editores de timeline: añadir evento
  socket.on('timeline_add_event', (data) => {
    if (!TIMELINE_EDITORS.includes(connectedUsers[socket.id])) return;
    const imagen = typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000
      ? data.imagen : null;
    const ev = {
      id: String(Date.now()),
      nombre: String(data.nombre || '').slice(0, 200).trim(),
      descripcion: String(data.descripcion || '').slice(0, 2000).trim(),
      tags: Array.isArray(data.tags) ? data.tags.map(t => String(t).slice(0, 50)).slice(0, 10) : [],
      orden: typeof data.orden === 'number' && isFinite(data.orden) ? data.orden : 1000,
      temporada: [1, 2, 3].includes(data.temporada) ? data.temporada : null,
      jugadores: Array.isArray(data.jugadores) ? data.jugadores.filter(j => VALID_TIMELINE_PLAYERS.includes(j)) : [],
      nivel: ['casual', 'importante', 'legendario'].includes(data.nivel) ? data.nivel : 'casual',
      imagen,
      linkedCharacters: Array.isArray(data.linkedCharacters)
        ? data.linkedCharacters.filter(id => typeof id === 'string' && catalogCharacters.some(c => c.id === id))
        : [],
      linkedPlanets: Array.isArray(data.linkedPlanets)
        ? data.linkedPlanets.filter(id => typeof id === 'string' && planets.some(p => p.id === id))
        : [],
    };
    if (!ev.nombre) return;
    timelineEvents.push(ev);
    saveTimeline(timelineEvents);
    io.emit('timeline_events_update', timelineEvents);
  });

  // Editores de timeline: editar evento
  socket.on('timeline_update_event', ({ id, data }) => {
    if (!TIMELINE_EDITORS.includes(connectedUsers[socket.id])) return;
    const idx = timelineEvents.findIndex(e => e.id === id);
    if (idx === -1) return;
    const allowed = {};
    if (typeof data.nombre === 'string' && data.nombre.trim()) allowed.nombre = data.nombre.trim().slice(0, 200);
    if (typeof data.descripcion === 'string') allowed.descripcion = data.descripcion.trim().slice(0, 2000);
    if (Array.isArray(data.tags)) allowed.tags = data.tags.map(t => String(t).slice(0, 50)).slice(0, 10);
    if ([1, 2, 3, null].includes(data.temporada)) allowed.temporada = data.temporada;
    if (Array.isArray(data.jugadores)) allowed.jugadores = data.jugadores.filter(j => VALID_TIMELINE_PLAYERS.includes(j));
    if (['casual', 'importante', 'legendario'].includes(data.nivel)) allowed.nivel = data.nivel;
    if (Array.isArray(data.linkedCharacters)) allowed.linkedCharacters = data.linkedCharacters.filter(id => typeof id === 'string' && catalogCharacters.some(c => c.id === id));
    if (Array.isArray(data.linkedPlanets)) allowed.linkedPlanets = data.linkedPlanets.filter(id => typeof id === 'string' && planets.some(p => p.id === id));
    if (data.imagen === null) {
      allowed.imagen = null;
    } else if (typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000) {
      allowed.imagen = data.imagen;
    }
    timelineEvents[idx] = { ...timelineEvents[idx], ...allowed };
    saveTimeline(timelineEvents);
    io.emit('timeline_events_update', timelineEvents);
  });

  // Editores de timeline: eliminar evento
  socket.on('timeline_delete_event', (id) => {
    if (!TIMELINE_EDITORS.includes(connectedUsers[socket.id])) return;
    timelineEvents = timelineEvents.filter(e => e.id !== id);
    saveTimeline(timelineEvents);
    io.emit('timeline_events_update', timelineEvents);
  });

  // Master/Desarrollador: CRUD catálogo de personajes
  const VALID_FACCIONES = ['Imperio Sith', 'Imperio Infinito', 'República', 'Otros'];
  const VALID_ESTADOS_CHAR = ['Vivo', 'Muerto', 'Desaparecido'];

  socket.on('catalog_character_add', (data) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    if (!data || typeof data.nombre !== 'string' || !data.nombre.trim()) return;
    const imagen = typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000 ? data.imagen : null;
    const ch = {
      id: String(Date.now()),
      nombre: data.nombre.trim().slice(0, 200),
      titulo: typeof data.titulo === 'string' ? data.titulo.trim().slice(0, 200) : '',
      raza: typeof data.raza === 'string' ? data.raza.trim().slice(0, 100) : '',
      descripcion: typeof data.descripcion === 'string' ? data.descripcion.trim().slice(0, 2000) : '',
      faccion: VALID_FACCIONES.includes(data.faccion) ? data.faccion : null,
      estado: VALID_ESTADOS_CHAR.includes(data.estado) ? data.estado : null,
      imagen,
    };
    catalogCharacters.push(ch);
    saveCatalogCharacters(catalogCharacters);
    io.emit('catalog_characters_update', catalogCharacters);
  });

  socket.on('catalog_character_update', ({ id, data }) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    const idx = catalogCharacters.findIndex(c => c.id === id);
    if (idx === -1) return;
    const allowed = {};
    if (typeof data.nombre === 'string' && data.nombre.trim()) allowed.nombre = data.nombre.trim().slice(0, 200);
    if (typeof data.titulo === 'string') allowed.titulo = data.titulo.trim().slice(0, 200);
    if (typeof data.raza === 'string') allowed.raza = data.raza.trim().slice(0, 100);
    if (typeof data.descripcion === 'string') allowed.descripcion = data.descripcion.trim().slice(0, 2000);
    if (VALID_FACCIONES.includes(data.faccion) || data.faccion === null) allowed.faccion = data.faccion;
    if (VALID_ESTADOS_CHAR.includes(data.estado) || data.estado === null) allowed.estado = data.estado;
    if (data.imagen === null) allowed.imagen = null;
    else if (typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000) allowed.imagen = data.imagen;
    catalogCharacters[idx] = { ...catalogCharacters[idx], ...allowed };
    saveCatalogCharacters(catalogCharacters);
    io.emit('catalog_characters_update', catalogCharacters);
  });

  socket.on('catalog_character_delete', (id) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    catalogCharacters = catalogCharacters.filter(c => c.id !== id);
    saveCatalogCharacters(catalogCharacters);
    io.emit('catalog_characters_update', catalogCharacters);
  });

  // Master/Desarrollador: CRUD catálogo de planetas
  const VALID_SITUACIONES = ['Núcleo', 'Borde Medio', 'Borde Exterior', 'Desconocido'];
  const VALID_TIPOS_PLANETA = ['mundo helado', 'desierto', 'selva', 'urbano', 'estación espacial'];

  socket.on('planet_add', (data) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    if (!data || typeof data.nombre !== 'string' || !data.nombre.trim()) return;
    if (typeof data.posX !== 'number' || typeof data.posY !== 'number') return;
    const imagen = typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000 ? data.imagen : null;
    const pl = {
      id: String(Date.now()),
      nombre: data.nombre.trim().slice(0, 200),
      situacion: VALID_SITUACIONES.includes(data.situacion) ? data.situacion : 'Desconocido',
      descripcion: typeof data.descripcion === 'string' ? data.descripcion.trim().slice(0, 2000) : '',
      imagen,
      posX: Math.max(0, Math.min(100, data.posX)),
      posY: Math.max(0, Math.min(100, data.posY)),
      tipo: VALID_TIPOS_PLANETA.includes(data.tipo) ? data.tipo : null,
    };
    planets.push(pl);
    savePlanets(planets);
    io.emit('planets_update', planets);
  });

  socket.on('planet_update', ({ id, data }) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    const idx = planets.findIndex(p => p.id === id);
    if (idx === -1) return;
    const allowed = {};
    if (typeof data.nombre === 'string' && data.nombre.trim()) allowed.nombre = data.nombre.trim().slice(0, 200);
    if (VALID_SITUACIONES.includes(data.situacion)) allowed.situacion = data.situacion;
    if (typeof data.descripcion === 'string') allowed.descripcion = data.descripcion.trim().slice(0, 2000);
    if (data.imagen === null) allowed.imagen = null;
    else if (typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000) allowed.imagen = data.imagen;
    if (typeof data.posX === 'number') allowed.posX = Math.max(0, Math.min(100, data.posX));
    if (typeof data.posY === 'number') allowed.posY = Math.max(0, Math.min(100, data.posY));
    if (VALID_TIPOS_PLANETA.includes(data.tipo) || data.tipo === null) allowed.tipo = data.tipo;
    planets[idx] = { ...planets[idx], ...allowed };
    savePlanets(planets);
    io.emit('planets_update', planets);
  });

  socket.on('planet_delete', (id) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    planets = planets.filter(p => p.id !== id);
    savePlanets(planets);
    io.emit('planets_update', planets);
  });

  // Master/Desarrollador: CRUD de puntos de interés del Mapa de Zygerria
  const clampPct = (v) => Math.max(0, Math.min(100, v));

  socket.on('mapa_poi_add', (data) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    if (!data || typeof data.nombre !== 'string' || !data.nombre.trim()) return;
    if (typeof data.x !== 'number' || typeof data.y !== 'number') return;
    const imagen = typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000 ? data.imagen : null;
    const poi = {
      id: String(Date.now()),
      nombre: data.nombre.trim().slice(0, 200),
      descripcion: typeof data.descripcion === 'string' ? data.descripcion.trim().slice(0, 2000) : '',
      faccion: typeof data.faccion === 'string' && data.faccion.trim() ? data.faccion.trim().slice(0, 120) : null,
      recompensas: typeof data.recompensas === 'string' ? data.recompensas.trim().slice(0, 300) : '',
      color: typeof data.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(data.color) ? data.color : null,
      x: clampPct(data.x),
      y: clampPct(data.y),
      imagen,
      createdAt: new Date().toISOString(),
    };
    mapaPois.push(poi);
    saveMapaPois(mapaPois);
    io.emit('mapa_pois_update', mapaPois);
  });

  socket.on('mapa_poi_update', ({ id, data }) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    const idx = mapaPois.findIndex(p => p.id === id);
    if (idx === -1 || !data) return;
    const allowed = {};
    if (typeof data.nombre === 'string' && data.nombre.trim()) allowed.nombre = data.nombre.trim().slice(0, 200);
    if (typeof data.descripcion === 'string') allowed.descripcion = data.descripcion.trim().slice(0, 2000);
    if (typeof data.faccion === 'string') allowed.faccion = data.faccion.trim() ? data.faccion.trim().slice(0, 120) : null;
    else if (data.faccion === null) allowed.faccion = null;
    if (typeof data.recompensas === 'string') allowed.recompensas = data.recompensas.trim().slice(0, 300);
    if (typeof data.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(data.color)) allowed.color = data.color;
    else if (data.color === null) allowed.color = null;
    if (typeof data.x === 'number') allowed.x = clampPct(data.x);
    if (typeof data.y === 'number') allowed.y = clampPct(data.y);
    if (data.imagen === null) allowed.imagen = null;
    else if (typeof data.imagen === 'string' && data.imagen.startsWith('data:image/') && data.imagen.length <= 3_000_000) allowed.imagen = data.imagen;
    mapaPois[idx] = { ...mapaPois[idx], ...allowed };
    saveMapaPois(mapaPois);
    io.emit('mapa_pois_update', mapaPois);
  });

  socket.on('mapa_poi_delete', (id) => {
    if (!isAdmin(connectedUsers[socket.id])) return;
    mapaPois = mapaPois.filter(p => p.id !== id);
    saveMapaPois(mapaPois);
    io.emit('mapa_pois_update', mapaPois);
  });

  // Editores de timeline: reordenar evento (drag & drop)
  socket.on('timeline_reorder_event', ({ id, newOrden }) => {
    if (!TIMELINE_EDITORS.includes(connectedUsers[socket.id])) return;
    if (typeof newOrden !== 'number' || !isFinite(newOrden)) return;
    const idx = timelineEvents.findIndex(e => e.id === id);
    if (idx === -1) return;
    timelineEvents[idx].orden = newOrden;
    reindexTimeline(timelineEvents);
    saveTimeline(timelineEvents);
    io.emit('timeline_events_update', timelineEvents);
  });

  socket.on('disconnect', () => {
    delete connectedUsers[socket.id];
    io.emit('users_update', [...new Set(Object.values(connectedUsers))]);
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
