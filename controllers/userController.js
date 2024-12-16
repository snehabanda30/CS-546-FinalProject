import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  edituserSchema,
  userEditSchema,
  refinedUserSchema,
  userLoginSchema,
  reviewSchema,
} from "../utils/schemas.js";
import Post from "../models/Post.js";
import xss from "xss";
import { format } from "date-fns";

// Signup
const getSignup = (req, res) => {
  if (req.session.profile) {
    return res.redirect("/");
  }
  return res.render("signup", {
    script: "/public/js/validateUserSignupSchema.js",
    title: "Sign Up",
  });
};

const signup = async (req, res) => {
  try {
    // Logic for signup
    let { username, password, email, firstName, lastName, confirmPassword } =
      req.body;

    xss(username);
    xss(password);
    xss(email);
    xss(firstName);
    xss(lastName);
    xss(confirmPassword);

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

    // For case insensitivity
    username = username.toLowerCase();
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
    title: "Log In",
  });
};

const login = async (req, res) => {
  try {
    let { username, password } = req.body;

    xss(username);
    xss(password);

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

    username = username.toLowerCase();
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
    const { username } = req.params;
    const trimmedUsername = xss(username.trim());

    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(404).render("404", {
        user: req.session.profile,
      });
    }

    const signedInUser = await User.findOne({ _id: req.session.profile.id });

    const filteredPosts = await Post.find({ posterID: user._id });
    const objectPosts = filteredPosts.map((post) => ({
      ...post.toObject(),
      datePosted: format(new Date(post.datePosted), "MMMM dd, yyyy"),
      completeBy: format(new Date(post.completeBy), "MMMM dd, yyyy"),
    }));

    const objectReviews = user.reviews.map((review) => ({
      ...review.toObject(),
    }));

    const favorited = signedInUser.favorites.includes(user._id);

    const returnedUserData = {
      username: user.username,
      tasksPosted: objectPosts,
      tasksHelped: user.tasksHelped,
      rating: user.averageRating,
      firstName: user.firstName,
      lastName: user.lastName,
      hasTasksPosted: objectPosts.length > 0,
      reviews: objectReviews,
      isFavorited: favorited,
    };
    return res.render("profilePage", {
      user: req.session.profile,
      viewedUser: returnedUserData,
      script: "/public/js/validateReviewSchema.js",
      title: "Profile",
    });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Something went wrong when fetching page" });
  }
};

const getEdit = async (req, res) => {
  try {
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
    if (!user) {
      return res.status(404).json({ error: "User not found! in this array" });
    }

    return res.render("edit", {
      script: "/public/js/validateUserEditSignup.js",
      user: user.username,
      userLogin: userLogin.username,
      title: "Edit Login",
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
    const { username, password } = req.body;
    xss(username);
    xss(password);
    const user = await User.findById(req.session.profile.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const updates = {};
    if (username && username !== user.username) {
      const usernameValidation = edituserSchema.safeParse({ username });
      const existingUser = await User.findOne({ username });
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

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.hashedPassword = await bcrypt.hash(password, salt);
    }

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

const getEditProfilePage = async (req, res) => {
  if (!req.session.profile) {
    return res.redirect("/users/login");
  } else if (req.session.profile.username !== req.params.username) {
    return res.status(403).render("403", {
      user: req.session.profile,
    });
  }

  const { username } = req.params;
  xss(username);

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(404).render("404", {
      user: req.session.profile,
    });
  }

  const returnedUserData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    address: {
      address: user.address?.address ? user.address.address : "",
      suite: user.address?.suite ? user.address.suite : "",
      city: user.address?.city ? user.address.city : "",
      state: user.address?.state ? user.address.state : "",
      zipCode: user.address?.zipCode ? user.address.zipCode : "",
      country: user.address?.country ? user.address.country : "",
    },
  };

  return res.render("editProfilePage", {
    user: req.session.profile,
    userData: returnedUserData,
    script: "/public/js/validateUserEditSchema.js ",
    title: "Edit Profile",
  });
};

const editProfile = async (req, res) => {
  let {
    firstName,
    lastName,
    email,
    phone,
    address,
    suite,
    city,
    state,
    zipcode,
    country,
    skills,
  } = req.body;

  xss(firstName);
  xss(lastName);
  xss(email);
  xss(phone);
  xss(address);
  xss(suite);
  xss(city);
  xss(state);
  xss(zipcode);
  xss(country);
  xss(skills);

  if (!req.session.profile) {
    return res.status(401).render("401", {
      user: req.session.profile,
    });
  }

  const result = userEditSchema.safeParse({
    firstName,
    lastName,
    email,
    phone,
    address,
    suite,
    city,
    state,
    zipcode,
    country,
    skills,
  });

  if (result.success === false) {
    const errors = result.error.errors.map((error) => error.message);
    return res.status(400).json({
      error: errors.join(", "),
    });
  }

  const user = await User.findOne({ _id: req.session.profile.id });

  if (!user) {
    return res.status(404).render("404", {
      user: req.session.profile,
    });
  }

  if (await User.findOne({ email, _id: { $ne: req.session.profile.id } })) {
    return res.status(409).json({
      error: `User with email ${email} already exists.`,
    });
  }

  user.email = email;

  user.phoneNumber = phone;

  user.address.address = address;

  if (suite) {
    user.address.suite = suite;
  }

  user.address.city = city;

  user.address.state = state;

  user.address.zipCode = zipcode;

  user.address.country = country;

  skills = skills.split(",").map((skill) => skill.trim());
  if (skills) {
    for (let i = 0; i < skills.length; i++) {
      if (user.skills.includes(skills[i])) {
        continue;
      }
      user.skills.push(skills[i]);
    }
  }

  await user.save();

  return res.status(200).render("profilePage", {
    user: req.session.profile,
  });
};

export const reviewUser = async (req, res) => {
  try {
    if (!req.session.profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { username, rating, reviewBody } = req.body;
    xss(username);
    xss(rating);
    xss(reviewBody);
    const reviewer = req.session.profile.username;

    const reviewUser = await User.findOne({ username: reviewer });

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
      { reviews: 1, tasksHelped: 1, tasksPosted: 1 },
      { collation: { locale: "en_US", strength: 2 } },
    );
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let hasInteracted = false;
    for (const post of existingUser.tasksPosted) {
      if (reviewUser.tasksHelped.includes(post)) {
        hasInteracted = true;
        break;
      }
    }
    for (const post of existingUser.tasksHelped) {
      if (reviewUser.tasksPosted.includes(post)) {
        hasInteracted = true;
        break;
      }
    }
    if (!hasInteracted) {
      return res.status(400).json({
        error: "No interaction with user",
      });
    }

    const existingReview = existingUser.reviews.filter(
      (review) => review.posterUsername === reviewer,
    );
    if (existingReview.length !== 0) {
      return res.status(400).json({ error: "You have reviewed this user" });
    }

    const currentRatingSum = existingUser.reviews.reduce(
      (acc, review) => acc + review.rating,
      0,
    );
    const newRating =
      Math.round(
        ((currentRatingSum + parseInt(rating)) /
          (existingUser.reviews.length + 1)) *
          100,
      ) / 100;

    const review = {
      rating,
      reviewBody,
      posterUsername: reviewer,
    };
    await User.updateOne(
      { username },
      { $push: { reviews: review }, $set: { averageRating: newRating } },
      { collation: { locale: "en_US", strength: 2 } },
    );

    return res.status(201).json({ message: "Review posted" });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Something went wrong when reviewing" });
  }
};

const getFavorites = async (req, res) => {
  const { username } = req.params;
  xss(username);

  if (req.session.profile.username !== username) {
    return res.status(403).render("403", {
      user: req.session.profile,
    });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).render("404", {
      user: req.session.profile,
    });
  }

  const favoriteUsers = await User.find({ _id: { $in: user.favorites } });

  const formattedUsers = favoriteUsers.map((user) => ({
    username: user.username,
    profilePicture: user.profilePicture,
  }));

  return res.render("favoritesPage", {
    user: req.session.profile,
    favoriteUsers: formattedUsers,
    title: "Favorites",
  });
};

const favoriteUser = async (req, res) => {
  try {
    if (!req.session.profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { favoritedUsername } = req.body;
    xss(favoritedUsername);

    const favoritedUser = await User.findOne(
      { username: favoritedUsername },
      {},
      { collation: { locale: "en_US", strength: 2 } },
    );
    if (!favoritedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await User.findOne(
      { _id: req.session.profile.id },
      {},
      { collation: { locale: "en_US", strength: 2 } },
    );
    if (user.favorites.includes(favoritedUser._id)) {
      return res.status(400).json({ error: "User already favorited" });
    }

    await User.updateOne(
      { _id: req.session.profile.id },
      { $push: { favorites: favoritedUser._id } },
    );

    return res.status(200).json({ message: "User favorited" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "Something went wrong when favoriting user" });
  }
};

const getTaskStatusTracking = async (req, res) => {
  if (!req.session.profile) {
    return res.redirect("/users/login");
  } else if (req.session.profile.username !== req.params.username) {
    return res.status(403).render("403", {
      user: req.session.profile,
    });
  }
  const { username } = req.params;
  xss(username);

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(404).render("404", {
      user: req.session.profile,
    });
  }

  const returnedUserData = {
    taskStatus: user.taskStatus,
  };

  return res.render("taskstatus", {
    user: req.session.profile,
    userData: returnedUserData,
    script: "/public/js/validateTaskStatus.js ",
    title: "Edit Task Status",
  });
};

const taskStatus = async (req, res) => {
  try {
    let userLogin = null;
    if (req.session.profile.id) {
      userLogin = await User.findById(req.session.profile.id);
    }
    const { username, postId } = req.params;
    const trimmedUsername = xss(username.trim());
    xss(postId);

    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(404).render("404", {
        user: req.session.profile,
      });
    }

    const usernameValidation = edituserSchema.safeParse({ username });
    if (!usernameValidation.success) {
      const errors = usernameValidation.error.errors.map(
        (error) => error.message,
      );
      return res.status(400).json({ error: errors.join(", ") });
    }
    const { status } = req.body;

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { $set: { status } },
      { new: true },
    );

    if (!updatedPost) {
      return res.status(500).json({ error: "Failed to update the post." });
    }

    return res.status(200).json({
      message: "Post status updated successfully.",
      updatedPost,
    });
  } catch (err) {
    return res.status(400).json({
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
  getFavorites,
  favoriteUser,
  getEdit,
  editUser,
  getTaskStatusTracking,
  taskStatus,
};
