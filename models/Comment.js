import mongoose from 'mongoose';

const commentsSchema = new mongoose.Schema({
  commentID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
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

const Comment = mongoose.model('Comment', commentsSchema);

export default { commentsSchema, Comment };
