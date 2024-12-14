import Handlebars from "handlebars";
import mongoose from "mongoose";

function registerHelpers() {
  // Used to conditionally render a portion of HTML if two values are equal
  Handlebars.registerHelper("ifEquals", (arg1, arg2, options) => {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifEqualsID", function (arg1, arg2, options) {
    let context = this; //

    if (arg1 instanceof mongoose.Types.ObjectId) {
      arg1 = arg1.toString();
    }

    if (arg2 instanceof mongoose.Types.ObjectId) {
      arg2 = arg2.toString();
    }

    return arg1 === arg2 ? options.fn(context) : options.inverse(context);
  });

  Handlebars.registerHelper("ifNotEqual", (a, b, options) => {
    return a !== b ? options.fn(this) : options.inverse(this);
  });
}

export { registerHelpers };
