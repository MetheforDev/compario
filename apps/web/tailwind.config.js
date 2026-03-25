/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Compario Premium Palette
        'neon-cyan':   '#C49A3C',   // Warm Gold
        'neon-purple': '#8B9BAC',   // Cool Platinum
        'neon-green':  '#10B981',   // Emerald
        'neon-pink':   '#DC2626',   // Crimson
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(196,154,60,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(196,154,60,0.02) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      boxShadow: {
        'neon-cyan':   '0 0 15px rgba(196,154,60,0.4), 0 0 40px rgba(196,154,60,0.15)',
        'neon-purple': '0 0 15px rgba(139,155,172,0.4), 0 0 40px rgba(139,155,172,0.15)',
        'neon-green':  '0 0 15px rgba(16,185,129,0.4), 0 0 40px rgba(16,185,129,0.15)',
        'neon-pink':   '0 0 15px rgba(220,38,38,0.4), 0 0 40px rgba(220,38,38,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
