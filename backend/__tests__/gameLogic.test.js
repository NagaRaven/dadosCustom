const { validateLogin, rollD20, processRoll, limitHistory, ACCOUNTS } = require('../gameLogic');

describe('validateLogin', () => {
  test('acepta credenciales válidas de Master', () => {
    expect(validateLogin('Master', ACCOUNTS['Master'])).toBe(true);
  });

  test('acepta credenciales válidas de Nivare', () => {
    expect(validateLogin('Nivare', ACCOUNTS['Nivare'])).toBe(true);
  });

  test('acepta credenciales válidas de Luz-Ya (nombre con guion)', () => {
    expect(validateLogin('Luz-Ya', ACCOUNTS['Luz-Ya'])).toBe(true);
  });

  test('rechaza contraseña incorrecta', () => {
    expect(validateLogin('Master', 'contraseña-incorrecta')).toBe(false);
  });

  test('rechaza usuario desconocido', () => {
    expect(validateLogin('Hacker', ACCOUNTS['Master'])).toBe(false);
  });

  test('rechaza usuario vacío', () => {
    expect(validateLogin('', '')).toBe(false);
  });

  test('rechaza null/undefined', () => {
    expect(validateLogin(null, null)).toBe(false);
    expect(validateLogin(undefined, undefined)).toBe(false);
  });

  test('es sensible a mayúsculas', () => {
    expect(validateLogin('master', ACCOUNTS['Master'])).toBe(false);
    expect(validateLogin('MASTER', ACCOUNTS['Master'])).toBe(false);
  });
});

describe('rollD20', () => {
  test('devuelve un valor entero entre 1 y 20', () => {
    for (let i = 0; i < 200; i++) {
      const result = rollD20();
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });
});

describe('processRoll', () => {
  test('produce un roll con los campos requeridos', () => {
    const { roll } = processRoll('TestUser', null);
    expect(roll.username).toBe('TestUser');
    expect(roll.result).toBeGreaterThanOrEqual(1);
    expect(roll.result).toBeLessThanOrEqual(20);
    expect(roll.id).toBeDefined();
    expect(roll.timestamp).toBeDefined();
  });

  test('fuerza resultado 20 con forcedResult=critical', () => {
    const { roll } = processRoll('TestUser', 'critical');
    expect(roll.result).toBe(20);
  });

  test('fuerza resultado 1 con forcedResult=fumble', () => {
    const { roll } = processRoll('TestUser', 'fumble');
    expect(roll.result).toBe(1);
  });

  test('fuerza un número específico entre 1 y 20', () => {
    expect(processRoll('TestUser', 15).roll.result).toBe(15);
    expect(processRoll('TestUser', 7).roll.result).toBe(7);
  });

  test('fuerza los valores en los límites (1 y 20)', () => {
    expect(processRoll('TestUser', 1).roll.result).toBe(1);
    expect(processRoll('TestUser', 20).roll.result).toBe(20);
  });

  test('tira normal si el número forzado está fuera de rango', () => {
    // El servidor valida antes de llegar aquí, pero la función es robusta
    const { roll: r1 } = processRoll('TestUser', 0);
    expect(r1.result).toBeGreaterThanOrEqual(1);
    const { roll: r2 } = processRoll('TestUser', 21);
    expect(r2.result).toBeGreaterThanOrEqual(1);
  });

  test('consume el resultado forzado (nextForced es null)', () => {
    const { nextForced } = processRoll('TestUser', 'critical');
    expect(nextForced).toBeNull();
  });

  test('nextForced es null también para tiradas normales', () => {
    const { nextForced } = processRoll('TestUser', null);
    expect(nextForced).toBeNull();
  });

  test('el timestamp es una fecha ISO válida', () => {
    const { roll } = processRoll('TestUser', null);
    expect(() => new Date(roll.timestamp)).not.toThrow();
    expect(new Date(roll.timestamp).getTime()).toBeGreaterThan(0);
  });
});

describe('limitHistory', () => {
  test('no modifica historiales con 20 items o menos', () => {
    const history = Array.from({ length: 15 }, (_, i) => ({ id: i }));
    expect(limitHistory(history)).toHaveLength(15);
  });

  test('limita exactamente a 20 items', () => {
    const history = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    expect(limitHistory(history)).toHaveLength(20);
  });

  test('conserva los items más recientes cuando supera el límite', () => {
    const history = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const limited = limitHistory(history);
    expect(limited[0].id).toBe(5);
    expect(limited[19].id).toBe(24);
  });

  test('acepta un límite personalizado', () => {
    const history = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    expect(limitHistory(history, 5)).toHaveLength(5);
  });

  test('devuelve array vacío intacto', () => {
    expect(limitHistory([])).toHaveLength(0);
  });
});
