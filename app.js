import express from "express";
import exphbs from "express-handlebars";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { connectDB } from "./config/connectDB.js";
import session from "express-session";
import { configDotenv } from "dotenv";
import { registerHelpers } from "./helpers.js";

const app = express();

await connectDB();

configDotenv();

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

registerHelpers();
const hbs = exphbs.create({ defaultLayout: "main" });
hbs.handlebars.registerHelper("joinSkills", function (skills) {
  return skills.join(", ");
});

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(
  session({
    secret: process.env.SECRET_TOKEN,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 72,
      httpOnly: true,
    },
  }),
);

// app.use((req, res, next) => {
//   console.log("Session:", req.session);
//   next();
// });

app.get("/", (req, res) => {
  if (req.session.profile?.id) {
    return res.render("home", { user: req.session.profile });
  }
  return res.render("home");
});

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
