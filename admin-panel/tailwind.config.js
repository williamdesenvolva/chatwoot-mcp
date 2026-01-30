/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0FF2B2',
          light: '#4FFAC5',
          dark: '#0AD99A',
        },
        primary: {
          DEFAULT: '#47A7F6',
          50: '#EBF5FE',
          100: '#D7EBFD',
          200: '#AFD8FB',
          300: '#87C4F9',
          400: '#5FB1F7',
          500: '#47A7F6',
          600: '#1089F4',
          700: '#0A6CC5',
          800: '#074F90',
          900: '#05325A',
        },
        dark: {
          DEFAULT: '#0A0F26',
          100: '#1A1F3A',
          200: '#2A2F4E',
          300: '#3A3F62',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Lexend Deca', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
