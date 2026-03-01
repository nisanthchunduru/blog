export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Clash Display"', 'sans-serif'],
        sans: ['"Libre Franklin"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#E8470C',
          light: '#F4895F',
          muted: '#F5F0E8',
          dark: '#1C1610',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
