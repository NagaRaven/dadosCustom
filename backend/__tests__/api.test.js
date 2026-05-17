const request = require('supertest');
const { app } = require('../server');

// El servidor no se inicia con listen() en tests — supertest crea su propio puerto temporal

describe('POST /api/login', () => {
  test('200 con credenciales válidas de Master', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'Master', password: 'Nx7@kP2m' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.username).toBe('Master');
  });

  test('200 con credenciales válidas de Nivare', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'Nivare', password: 'qR5#vL9w' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('200 con credenciales válidas de Luz-Ya', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'Luz-Ya', password: 'bW8!cK4n' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('401 con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'Master', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });

  test('401 con usuario desconocido', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'Intruso', password: 'cualquiera' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('400 sin body', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('400 sin contraseña', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'Master' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('no revela si el usuario existe en un 401', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'Master', password: 'mal' });
    expect(res.body.username).toBeUndefined();
  });
});
