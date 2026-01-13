/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./extension/**/*.{tsx,ts,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#050505',
          dark: '#0a0a0a',
          green: '#00ff88', // The glowing crypto green
          'green-dim': '#00cc6a',
        },
        background: {
          primary: '#0a0a0a',
          secondary: '#121212',
          tertiary: '#1a1a1a',
          surface: '#141414',
        },
        accent: {
          green: '#10b981',
          greenHover: '#059669',
          greenDark: '#047857',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#52525b',
        },
        border: {
          DEFAULT: '#27272a',
          hover: '#3f3f46',
        },
        zinc: {
          950: '#09090b',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'glow': '0 0 12px rgba(16, 185, 129, 0.1)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.2s ease-in',
        scaleIn: 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
