/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF7F0',
          200: '#F5EFE0',
        },
        ink: {
          900: '#0A0A08',
          800: '#1A1A16',
          700: '#2D2D27',
          500: '#5C5C52',
          400: '#8A8A7E',
          300: '#B0B0A6',
        },
        gold: {
          400: '#C9A84C',
          500: '#B8973A',
          600: '#9E7E28',
        },
        indigo: {
          50: '#EEEDF9',
          100: '#D4D2F2',
          500: '#4F46E5',
          600: '#3730A3',
          700: '#2D2480',
        }
      },
      letterSpacing: {
        widest: '0.25em',
        'ultra': '0.35em',
      }
    },
  },
  plugins: [],
}
