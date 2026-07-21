export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#effaf7',
          100: '#d9f4ec',
          200: '#b7e9d9',
          300: '#8dd9c2',
          400: '#57c2a0',
          500: '#2fa882',
          600: '#1f8265',
          700: '#1c6752',
          800: '#1a5242',
          900: '#184337',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
