import User from "../models/User.js";
import bcrypt from "bcrypt";
import { userSchema, edituserSchema } from "../utils/schemas.js";

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
const getHome = async (req, res) => {
  try {
      let userLogin = null;
      if (req.session) {
          if (req.session.userId)
              userLogin = await User.findById(req.session.userId);
              console.log(userLogin);
      }
      console.log("Session in getHome:", req.session);
      console.log("Fetched userLogin:", userLogin);
      res.render('home', { userLogin }); 

  } catch (error) {
     console.log(error);
      res.redirect('/');
  }
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
      return res.status(400).json({ error: "All fields are required" });
    }

    // Checks if sent data corresponds to correct user schema
    const result = userSchema.safeParse({ username, password });
    if (result.success === false) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({
        error: errors.join(", "),
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        error: `User with username ${username} already exists.`,
      });
    }

    // Create new user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({ username, hashedPassword });
    req.session.userId = newUser._id; // Set session userId
    console.log("Session set after signup:", req.session);

    // return res.json({ username: newUser.username });
    return res.redirect("/");
  } catch (e) {
    return res.status(500).json({
      error: "Something went wrong when signing up. Please try again.",
    });
  }
};
// edit 

const getEdit = async (req,res) => {
  console.log("req.session:", req.session); // Check session object
  const { userId } = req.params; 
  try {  
    let userLogin = null;
        if (req.session) {
            if (req.session.userId)
            {
              userLogin = await User.findById(req.session.userId);
            }
        }
    const user = await User.findById(req.session.userId);  
    console.log(user.username);
    if (!user){
      return res.status(404).json({ error: "User not found" });
    } 
    return res.render("edit", {
      script: "/public/js/validateUserSchema.js",
      user: user.username,  // Pass user data for editing
      userLogin: userLogin.username, // Pass userLogin to show authenticated state
  });
  } catch (e) {
    return res.status(500).json({
      error: "Something went wrong when fetching user data.",
    });
  }
} 

const editUser = async (req, res) => {
  try {
    let userLogin = null;
    if (req.session) {
      if (req.session.userId)
      {
        userLogin = await User.findById(req.session.userId);
        console.log(userLogin);
      }
  }
  console.log(req.session)
    const { username, password } = req.body; 
    // Find the user
    const user = await User.findById(req.session.userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Prepare an object to hold updates
    const updates = {};
    // Update username if it has changed 
    if (username) {
    if (username && username !== user.username) {
      console.log(username);
      const usernameValidation = edituserSchema.safeParse({ username });
      const existingUser = await User.findOne({ username });

        if (existingUser) {
          return res.status(409).json({
          error: `User with username ${username} already exists.`,
      });
    }
      if (!usernameValidation.success) {
        const errors = usernameValidation.error.errors.map((error) => error.message);
        return res.status(400).json({ error: errors.join(", ") });
      }
      updates.username = username;
    } 
  }
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.hashedPassword = await bcrypt.hash(password, salt);
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(req.session.userId, updates, { new: true });
      console.log("Updates",updates);
      return res.status(200).json({ message: "User details updated successfully." });
    } 
  } catch (err) {
    return res.status(500).json({
      error: "An error occurred while updating the user. Please try again.",
    });
  }
};


export default { demoFuncOne, demoFuncTwo, getSignup, signup, getEdit,editUser,getHome};
