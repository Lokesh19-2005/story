/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8f5f0',
        text: '#111111',
        muted: '#777777',
        border: '#e5dfd7',
        accent: '#d9c7b8',
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
