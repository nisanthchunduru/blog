/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./backend/views/**/*.ejs",
    "./views/**/*.ejs",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['-apple-system', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          muted: '#EDE9FE',
          dark: '#1a1a2e',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            "p": {
              color: "#000000"
            },
          },
        },
        invert: {
          css: {
            "p": {
              color: "#ffffff"
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}
