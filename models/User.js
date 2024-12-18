import mongoose from "mongoose";
import { addressSchema } from "./Address.js";
import { reviewSchema } from "./Review.js";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 30,
    unique: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
    required: true,
  },
  phoneNumber: {
    type: String,
    default: "",
    maxlength: 10,
  },
  firstName: {
    type: String,
    default: "",
    required: true,
  },
  lastName: {
    type: String,
    default: "",
    required: true,
  },
  address: {
    type: addressSchema,
    default: null,
  },
  skills: {
    type: [String],
    default: [],
  },
  reviews: {
    type: [reviewSchema],
    default: [],
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  favorites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  tasksHelped: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  tasksPosted: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  profilePicture: {
    type: String,
    default: "",
  },
  endorsedBy: {
    type: [
      {
        skill: { type: String, required: true },
        endorsedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);
export default User;
