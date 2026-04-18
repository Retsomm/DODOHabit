/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#D97757',
          soft: '#E8A584',
          deep: '#B8593A',
        },
        champagne: '#E8C9A3',
        cream: '#F5EDE2',
        paper: '#EFE6D8',
        ink: {
          DEFAULT: '#1F1A16',
          soft: '#2B2420',
          deep: '#14100D',
        },
        warm: {
          950: '#0A0807',
          900: '#14100D',
          800: '#1F1A16',
          700: '#2B2420',
          600: '#3D302A',
          slate: '#8A7C70',
          'slate-soft': '#B8AA9E',
        },
        space: {
          950: '#09090f',
          900: '#0f0f1a',
          800: '#161625',
          700: '#1e1e35',
        },
      },
      fontFamily: {
        fraunces: ['Fraunces', 'Noto Serif TC', 'Georgia', 'serif'],
        'noto-serif': ['Noto Serif TC', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        base: ['1rem', { lineHeight: '1.6' }],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        halo: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.25)', opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 8s ease-in-out infinite',
        halo: 'halo 8s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
      },
      boxShadow: {
        terracotta: '0 0 40px rgba(217,119,87,0.4)',
        'terracotta-sm': '0 0 16px rgba(217,119,87,0.3)',
        champagne: '0 0 20px rgba(232,201,163,0.3)',
        'warm-card': '0 2px 20px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
