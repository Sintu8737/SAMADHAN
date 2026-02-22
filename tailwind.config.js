/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'army-olive': '#556B2F',
        'army-dark': '#2F4F2F',
        'army-light': '#8FBC8F',
        'army-brown': '#8B4513',
        'army-tan': '#D2B48C',
        'army-black': '#1C1C1C',
      }
    },
  },
  plugins: [],
}
