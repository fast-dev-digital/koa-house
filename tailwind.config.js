/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'koa-green': {
          light: '#98AD00', // Pantone 383 CP
          DEFAULT: '#546223', // Pantone 371 CP
        },
        'koa-teal': '#227680',   // Pantone 7714 CP
        'koa-beige': '#BAA58D',  // Pantone 4253 CP
        'koa-brown': '#6E4C1E',  // Pantone 1405 CP
        'koa-dark': '#212721',   // Pantone Black 3 CP
      }
    },
  },
  plugins: [],
}