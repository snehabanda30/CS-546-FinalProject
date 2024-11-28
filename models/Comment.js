import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
});

const Comment = mongoose.model("Comment", commentsSchema);

export { commentsSchema, Comment };
