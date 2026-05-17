/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-black':  '#0a0a0f',
        'cyber-dark':   '#0d1117',
        'cyber-panel':  '#1a1a2e',
        'cyber-cyan':   '#00d4ff',
        'cyber-purple': '#7c3aed',
        'cyber-pink':   '#ff0080',
        'cyber-gold':   '#ffd700',
        'cyber-red':    '#ff4444',
        'cyber-green':  '#00ff88',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono:     ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        'scan':        'scan 6s linear infinite',
        'glitch':      'glitch 5s infinite',
        'roll-entry':  'roll-entry 0.35s ease-out',
        'result-pop':  'result-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'crit-glow':   'crit-glow 1.5s ease-in-out infinite',
        'fumble-glow': 'fumble-glow 1.5s ease-in-out infinite',
        'btn-press':   'btn-press 0.15s ease-out',
        'flicker':     'flicker 0.12s ease-in-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px #00d4ff, 0 0 30px rgba(0,212,255,0.3)' },
          '50%':       { boxShadow: '0 0 30px #00d4ff, 0 0 60px rgba(0,212,255,0.5)' },
        },
        scan: {
          '0%':   { top: '-2px' },
          '100%': { top: '100vh' },
        },
        glitch: {
          '0%, 88%, 100%': { transform: 'translateX(0)', clipPath: 'none' },
          '89%': { transform: 'translateX(-3px)', clipPath: 'polygon(0 20%,100% 20%,100% 40%,0 40%)' },
          '91%': { transform: 'translateX(3px)',  clipPath: 'polygon(0 60%,100% 60%,100% 80%,0 80%)' },
          '93%': { transform: 'translateX(0)',    clipPath: 'none' },
        },
        'roll-entry': {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'result-pop': {
          '0%':   { transform: 'scale(0.2)', opacity: '0' },
          '60%':  { transform: 'scale(1.2)', opacity: '1' },
          '80%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'crit-glow': {
          '0%, 100%': { textShadow: '0 0 20px #ffd700, 0 0 40px #ffd700' },
          '50%':       { textShadow: '0 0 40px #ffd700, 0 0 80px rgba(255,215,0,0.8)' },
        },
        'fumble-glow': {
          '0%, 100%': { textShadow: '0 0 20px #ff4444, 0 0 40px #ff4444' },
          '50%':       { textShadow: '0 0 40px #ff4444, 0 0 80px rgba(255,68,68,0.8)' },
        },
        'btn-press': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(0.93)' },
          '100%': { transform: 'scale(1)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
