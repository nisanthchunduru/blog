export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Nohemi"', 'system-ui', 'sans-serif'],
        sans: ['"Libre Franklin"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          muted: '#EDE9FE',
          dark: '#1a1a2e',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
