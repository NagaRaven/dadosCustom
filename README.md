# D20 Protocol — Sistema de Tiradas en Tiempo Real

Aplicación web de rol con estética cyberpunk/sci-fi para tiradas de d20 compartidas en tiempo real.

---

## Credenciales de acceso

| Operador   | Código de acceso |
|------------|-----------------|
| Master     | `Nx7@kP2m`      |
| Nivare     | `qR5#vL9w`      |
| Xalithra   | `mT3$hJ6z`      |
| Luz-Ya     | `bW8!cK4n`      |
| Mireya     | `pD1%gY7s`      |
| Kang       | `fV6^uA3x`      |

> El Master tiene acceso exclusivo a los botones "Forzar crítico" y "Forzar pifia".

---

## Instalación y ejecución

### Requisitos

- Node.js 18 o superior
- npm 9 o superior

### 1. Backend

```bash
cd backend
npm install
npm run dev        # modo desarrollo (nodemon)
# o
npm start          # producción
```

El servidor escucha en **http://localhost:3001**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación abre en **http://localhost:5173**

### 3. Abrir la aplicación

Abre varias pestañas o navegadores distintos en `http://localhost:5173`,
inicia sesión con distintos usuarios y observa cómo las tiradas aparecen
en tiempo real para todos los conectados.

---

## Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

---

## Arquitectura

```
tema_custom/
├── backend/
│   ├── gameLogic.js      # Lógica pura: login, tiradas, historial
│   ├── server.js         # Express + Socket.IO (exporta app/server)
│   ├── index.js          # Punto de entrada (arranca el servidor)
│   └── __tests__/
│       ├── gameLogic.test.js
│       └── api.test.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx         # Pantalla de acceso
    │   │   ├── Dashboard.jsx     # Panel principal
    │   │   ├── DiceRoller.jsx    # Botón + animación del dado
    │   │   ├── RollHistory.jsx   # Registro global de tiradas
    │   │   └── MasterControls.jsx # Panel exclusivo del Master
    │   ├── hooks/
    │   │   └── useSocket.js      # Gestión de la conexión Socket.IO
    │   └── tests/
    │       ├── Login.test.jsx
    │       └── RollHistory.test.jsx
    └── ...config files
```

### Flujo de una tirada

1. El jugador pulsa **TIRAR d20** → se emite `roll_dice` al servidor.
2. El servidor aplica el resultado forzado del Master (si existe) o genera uno aleatorio.
3. El forzado se consume y se resetea a `null`.
4. El servidor emite `new_roll` e `history` a **todos** los clientes conectados.
5. El cliente del jugador que tiró muestra la animación; todos ven el resultado en el historial.

### Seguridad del "forzado"

- La lógica de forzado vive **exclusivamente en el servidor**.
- El evento `force_confirmed` solo se emite al socket del Master.
- Los jugadores reciben `new_roll` con el resultado final; no hay indicador de que fue forzado.
