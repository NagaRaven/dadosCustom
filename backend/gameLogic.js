// Cuentas predefinidas del sistema — no modificar sin actualizar contraseñas
const ACCOUNTS = {
  Master:       'Nx7@kP2m',
  Desarrollador:'Zx4#rN8q',
  Nivare:       'qR5#vL9w',
  Xalithra:     'mT3$hJ6z',
  'Luz-Ya':     'bW8!cK4n',
  Mireya:       'pD1%gY7s',
  Kang:         'fV6^uA3x',
};

const MAX_HISTORY = 20;

function validateLogin(username, password) {
  if (!username || !password) return false;
  return ACCOUNTS[username] === password;
}

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

// Aplica resultado forzado (crítico/pifia) si está activo; de lo contrario tira normal.
// Devuelve el roll y resetea el forzado (siempre se consume).
function processRoll(username, forcedResult) {
  let result;
  if (forcedResult === 'critical') {
    result = 20;
  } else if (forcedResult === 'fumble') {
    result = 1;
  } else if (typeof forcedResult === 'number' && forcedResult >= 1 && forcedResult <= 20) {
    result = forcedResult;
  } else {
    result = rollD20();
  }

  const roll = {
    id: Date.now() + Math.random(), // evitar colisiones en tiradas rápidas
    username,
    result,
    timestamp: new Date().toISOString(),
  };

  return { roll, nextForced: null };
}

function limitHistory(history, maxItems = MAX_HISTORY) {
  if (history.length <= maxItems) return history;
  return history.slice(history.length - maxItems);
}

const FORCE_PLAYERS = ['Nivare', 'Xalithra', 'Luz-Ya', 'Mireya', 'Kang'];

module.exports = { ACCOUNTS, MAX_HISTORY, FORCE_PLAYERS, validateLogin, rollD20, processRoll, limitHistory };
