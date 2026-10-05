/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bone: '#FFFFFF',
        paper: '#F6F6F6',
        ink: '#1E1E1E',
        stone: {
          100: '#F1F1F1',
          200: '#E2E2E2',
          300: '#BEBEBE',
          400: '#8C8C8C',
          500: '#5F5F5F',
          600: '#3A3A3A',
        },
        sienna: {
          DEFAULT: '#F46F30',
          dark: '#D4531A',
          light: '#FF8A55',
        },
        miombo: {
          DEFAULT: '#1F3A2A',
          dark: '#132419',
          light: '#3A5B47',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
      },
      aspectRatio: {
        'portrait': '3 / 4',
        'editorial': '4 / 5',
        'poster': '5 / 7',
      },
    },
  },
  plugins: [],
};
