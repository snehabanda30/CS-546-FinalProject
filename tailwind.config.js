/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{handlebars,hbs,html,js}", // Match .handlebars, .hbs, .html, and .js files in views
    "./public/js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
