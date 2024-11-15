import express from "express"
import exphbs from "express-handlebars"
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'

const app = express()

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

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use("/users", userRoutes)
app.use("/posts", postRoutes)

app.listen(3000, () => {
  console.log("Listening on port 3000")
})