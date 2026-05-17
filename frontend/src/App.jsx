import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [username, setUsername] = useState(null);

  return username ? (
    <Dashboard username={username} onLogout={() => setUsername(null)} />
  ) : (
    <Login onLogin={setUsername} />
  );
}
