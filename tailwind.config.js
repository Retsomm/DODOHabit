/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#09090f',
          900: '#0f0f1a',
          800: '#161625',
          700: '#1e1e35',
        }
      },
      fontSize: {
        base: ['1rem', { lineHeight: '1.6' }],
      }
    },
  },
  plugins: [],
}
