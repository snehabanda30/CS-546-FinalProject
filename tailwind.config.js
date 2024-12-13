/** @type {import('tailwindcss').Config} */

import daisyui from "daisyui";

module.exports = {
  content: [
    "./views/**/*.{handlebars,hbs,html,js}", // Match .handlebars, .hbs, .html, and .js files in views
    "./public/js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light"],
  },
  plugins: [daisyui],
};
