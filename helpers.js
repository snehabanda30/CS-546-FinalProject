import Handlebars from "handlebars";

function registerHelpers() {
  // Used to conditionally render a portion of HTML if two values are equal
  Handlebars.registerHelper("ifEquals", (arg1, arg2, options) => {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
  });
}

export { registerHelpers };
