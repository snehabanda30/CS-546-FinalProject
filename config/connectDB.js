import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/final-project");
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
