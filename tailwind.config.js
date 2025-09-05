/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,hbs}", // for handlebars templates
    "./public/**/*.js"         // for your JS if using classes
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
