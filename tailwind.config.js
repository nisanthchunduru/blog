/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
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
  // corePlugins: {
  //   container: false
  // },
  // plugins: [],
  plugins: [
    require('@tailwindcss/typography'),
    // function ({ addComponents }) {
    //   addComponents({
    //     '.container': {
    //       width: '100%',
    //       '@screen sm': {
    //         maxWidth: '640px',
    //       },
    //       '@screen md': {
    //         maxWidth: '768px',
    //       },
    //       '@screen lg': {
    //         maxWidth: '1024px',
    //       },
    //       '@screen xl': {
    //         maxWidth: '1024px',
    //       },
    //       '@screen 2xl': {
    //         maxWidth: '1024px',
    //       },
    //     }
    //   })
    // }
  ]
}
