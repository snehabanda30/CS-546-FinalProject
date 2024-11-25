import connectDB from "../config/connectDB.js";

const db = await connectDB();




db.dropDatabase();
