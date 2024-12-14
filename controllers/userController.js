import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  userSchema,
  edituserSchema,
  userEditSchema,
  refinedUserSchema,
  userLoginSchema,
  reviewSchema,
} from "../utils/schemas.js";
import Post from "../models/Post.js";
import { format } from "date-fns";

// Signup
const getSignup = (req, res) => {
  if (req.session.profile) {
    return res.redirect("/");
  }
  return res.render("signup", {
    script: "/public/js/validateUserSignupSchema.js",
  });
};

const signup = async (req, res) => {
  try {
    // Logic for signup
    const { username, password, email, firstName, lastName, confirmPassword } =
      req.body;

    // Check for username and password
    if (
      !username ||
      !password ||
      !email ||
      !firstName ||
      !lastName ||
      !confirmPassword
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Checks if sent data corresponds to correct user schema
    const result = refinedUserSchema.safeParse({
      username,
      password,
      email,
      firstName,
      lastName,
      confirmPassword,
    });
    if (result.success === false) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({
        error: errors.join(", "),
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne(
      { username },
      {},
      { collation: { locale: "en_US", strength: 2 } },
    );
    if (existingUser) {
      return res.status(409).json({
        error: `User with username ${username} already exists.`,
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        error: `User with email ${email} already exists.`,
      });
    }

    // Create new user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      username,
      hashedPassword,
      email,
      firstName,
      lastName,
    });

    return res.json({ username: newUser.username });
  } catch (e) {
    return res.status(500).json({
      error: "Something went wrong when signing up. Please try again.",
    });
  }
};

// login
const getLoginPage = async (req, res) => {
  if (req.session.profile) {
    return res.redirect("/");
  }
  return res.render("login", {
    script: "/public/js/validateUserLoginSchema.js",
  });
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = userLoginSchema.safeParse({ username, password });
    if (result.success === false) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({
        error: errors.join(", "),
      });
    }

    const existingUser = await User.findOne(
      { username },
      {},
      { collation: { locale: "en_US", strength: 2 } },
    );
    if (!existingUser) {
      return res
        .status(404)
        .json({ error: `Incorrect username or password entered` });
    }

    const match = await bcrypt.compare(password, existingUser.hashedPassword);
    if (!match) {
      return res.status(403).json({
        error: "Incorrect username or password entered",
      });
    }

    req.session.profile = {
      id: existingUser._id,
      username: existingUser.username,
    };
    return res.redirect("/");
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "Something went wrong when signing up. Please try again.",
    });
  }
};

const logout = async (req, res) => {
  if (req.session.profile) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error logging out" });
      }
      return res.redirect("/");
    });
  }
};

const getProfilePage = async (req, res) => {
  try {
    if (!req.session.profile) {
      return res.status(401).redirect("/users/login");
    }

    const { username } = req.params;
    const trimmedUsername = username.trim();

    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(404).render("404", {
        user: req.session.profile,
      });
    }

    const filteredPosts = await Post.find({ posterID: user._id });
    const objectPosts = filteredPosts.map((post) => ({
      ...post.toObject(),
      datePosted: format(new Date(post.datePosted), "MMMM dd, yyyy"),
      completeBy: format(new Date(post.completeBy), "MMMM dd, yyyy"),
    }));

    const objectReviews = user.reviews.map((review) => ({
      ...review.toObject(),
    }));

    const returnedUserData = {
      username: user.username,
      tasksPosted: objectPosts,
      tasksHelped: user.tasksHelped,
      rating: user.averageRating,
      firstName: user.firstName,
      lastName: user.lastName,
      hasTasksPosted: objectPosts.length > 0,
      reviews: objectReviews,
    };
    return res.render("profilePage", {
      user: req.session.profile,
      viewedUser: returnedUserData,
      script: "/public/js/validateReviewSchema.js",
    });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Something went wrong when fetching page" });
  }
};

const getEdit = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log(req.session.profile.id);
    if (!req.session || !req.session.profile || !req.session.profile.id) {
      return res.redirect("/");
    }
    let userLogin = null;
    if (req.session) {
      if (req.session.profile.id) {
        userLogin = await User.findById(req.session.profile.id);
      }
    }
    const user = await User.findById(req.session.profile.id);
    console.log(user.username);
    if (!user) {
      return res.status(404).json({ error: "User not found! in this array" });
    }

    return res.render("edit", {
      script: "/public/js/validateUserEditSignup.js",
      user: user.username, // Pass user data for editing
      userLogin: userLogin.username, // Pass userLogin to show authenticated state
    });
  } catch (e) {
    return res.status(500).json({
      error: "Something went wrong when fetching user data.",
    });
  }
};

const editUser = async (req, res) => {
  try {
    let userLogin = null;
    if (req.session) {
      if (req.session.profile.id) {
        userLogin = await User.findById(req.session.profile.id);
      }
    }
    console.log("Hello!!!");
    const { username, password } = req.body;
    // Find the user
    const user = await User.findById(req.session.profile.id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Prepare an object to hold updates
    const updates = {};
    // Update username if it has changed
    console.log(updates);
    if (username && username !== user.username) {
      console.log(username);
      console.log(req.session.profile);

      const usernameValidation = edituserSchema.safeParse({ username });
      const existingUser = await User.findOne({ username });
      console.log(existingUser);
      if (existingUser) {
        return res.status(409).json({
          error: `User with username ${username} already exists.`,
        });
      }
      if (!usernameValidation.success) {
        const errors = usernameValidation.error.errors.map(
          (error) => error.message,
        );
        return res.status(400).json({ error: errors.join(", ") });
      }
      updates.username = username;
      req.session.profile.username = username;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.hashedPassword = await bcrypt.hash(password, salt);
    }
    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(req.session.profile.id, updates, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "User details updated successfully." });
    }
  } catch (err) {
    return res.status(500).json({
      error: "An error occurred while updating the user. Please try again.",
    });
  }
};

export default {
  getSignup,
  signup,
  getLoginPage,
  login,
  logout,
  getProfilePage,
  getEditProfilePage,
  editProfile,
  reviewUser,
  getEdit,
  editUser,
};
