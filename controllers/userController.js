import User from "../models/User.js";
import bcrypt from "bcrypt";
import { userSchema } from "../utils/schemas.js";

const demoFuncOne = (req, res) => {
  return res.render("test", {
    number: 1,
    type: "user",
  });
};

const demoFuncTwo = (req, res) => {
  return res.render("test", {
    number: 2,
    type: "user",
  });
};

// Signup
const getSignup = (req, res) => {
  return res.render("signup", {
    script: "/public/js/validateUserSchema.js",
  });
};

const signup = async (req, res) => {
  try {
    // Logic for signup
    const { username, password } = req.body;

    // Check for username and password
    if (!username || !password) {
      return res.status(400).render("signup", {
        error: "All fields are mandatory.",
        script: "/public/js/validateUserSchema.js",
      });
    }

    // Checks if sent data corresponds to correct user schema
    const result = userSchema.safeParse({ username, password });
    if (result.success === false) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).render("signup", {
        error: errors.join(", "),
        script: "/public/js/validateUserSchema.js",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).render("signup", {
        error: `User with username ${username} already exists.`,
        script: "/public/js/validateUserSchema.js",
      });
    }

    // Create new user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({ username, hashedPassword });
    return res.redirect("/");
  } catch (e) {
    return res.status(500).render("signup", {
      error: "Something went wrong when signing up. Please try again.",
      script: "/public/js/validateUserSchema.js",
    });
  }
};

export default { demoFuncOne, demoFuncTwo, getSignup, signup };
