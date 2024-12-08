import User from "../models/User.js";
import bcrypt from "bcrypt";
import { userSchema, userEditSchema } from "../utils/schemas.js";
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

    const result = userSchema.safeParse({ username, password });
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
        .json({ error: `User with username ${username} not found` });
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

    const returnedUserData = {
      username: user.username,
      tasksPosted: objectPosts,
      tasksHelped: user.tasksHelped,
      rating: user.averageRating,
      firstName: user.firstName,
      lastName: user.lastName,
      hasTasksPosted: objectPosts.length > 0,
    };
    return res.render("profilePage", {
      user: req.session.profile,
      viewedUser: returnedUserData,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Something went wrong when fetching page" });
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

  const user = await User.findOne({ username: req.params.username });

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
      address: user.address.address,
      suite: user.address.suite,
      city: user.address.city,
      state: user.address.state,
      zipCode: user.address.zipCode,
      country: user.address.country,
    },
  };

  return res.render("editProfilePage", {
    user: req.session.profile,
    userData: returnedUserData,
    script: "/public/js/validateUserEditSchema.js ",
  });
};

const editProfile = async (req, res) => {
  const { email, phoneNumber, address, suite, city, state, zipcode, country } =
    req.body;

  if (!req.session.profile) {
    return res.status(401).render("401", {
      user: req.session.profile,
    });
  }

  const result = userEditSchema.safeParse({
    email,
    phoneNumber,
    address,
    suite,
    city,
    state,
    zipcode,
    country,
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

  if (email) {
    user.email = email;
  }

  if (phoneNumber) {
    user.phoneNumber = phoneNumber;
  }

  if (address) {
    user.address.address = address;
  }

  if (suite) {
    user.address.suite = suite;
  }

  if (city) {
    user.address.city = city;
  }

  if (state) {
    user.address.state = state;
  }

  if (zipcode) {
    user.address.zipCode = zipcode;
  }

  if (country) {
    user.address.country = country;
  }

  await user.save();

  return res.status(200).render("profilePage", {
    user: req.session.profile,
  });
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
};
