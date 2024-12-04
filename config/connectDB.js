import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/final-project");
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};

const closeConnection = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};

export { connectDB, closeConnection };
