/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00fff7',
        'neon-purple': '#b724ff',
        'neon-green': '#39ff14',
        'neon-pink': '#ff006e',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,255,247,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,247,0.03) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00fff7, 0 0 30px #00fff780',
        'neon-purple': '0 0 10px #b724ff, 0 0 30px #b724ff80',
        'neon-green': '0 0 10px #39ff14, 0 0 30px #39ff1480',
        'neon-pink': '0 0 10px #ff006e, 0 0 30px #ff006e80',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 4s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
