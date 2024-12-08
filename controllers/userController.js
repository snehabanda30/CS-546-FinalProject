import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  refinedUserSchema,
  reviewSchema,
  userLoginSchema,
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
    const existingUser = await User.findOne({ username });
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

    const existingUser = await User.findOne({ username }).exec();
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

// Review

export const reviewUser = async (req, res) => {
  try {
    if (!req.session.profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { username, rating, reviewBody } = req.body;
    const reviewer = req.session.profile.username;

    if (!rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (username === reviewer) {
      return res.status(400).json({
        error: "You cannot review yourself",
      });
    }

    const result = reviewSchema.safeParse({ rating, reviewBody });
    if (result.success === false) {
      const errors = result.error.errors.map((error) => error.message);
      return res.status(400).json({
        error: errors.join(", "),
      });
    }

    const existingUser = await User.findOne(
      { username },
      { reviews: 1 },
      { collation: { locale: "en_US", strength: 2 } },
    );
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingReview = existingUser.reviews.filter(
      (review) => review.posterUsername === reviewer,
    );
    if (existingReview.length !== 0) {
      return res.status(400).json({ error: "You have reviewed this user" });
    }

    const review = {
      rating,
      reviewBody,
      posterUsername: reviewer,
    };
    await User.updateOne(
      { username },
      { $push: { reviews: review } },
      { collation: { locale: "en_US", strength: 2 } },
    );

    return res.status(201).json({ message: "Review posted" });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Something went wrong when reviewing" });
  }
};

export default {
  getSignup,
  signup,
  getLoginPage,
  login,
  logout,
  getProfilePage,
  reviewUser,
};
