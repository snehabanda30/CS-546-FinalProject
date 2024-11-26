import mongoose from 'mongoose';
import { addressSchema } from './Address.js';
import { commentsSchema } from './Comment.js';

const postSchema = new mongoose.Schema({
  posterID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  helperID: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: addressSchema,
    required: true,
  },
  skillsRequired: {
    type: [String],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  description: {
    type: String,
    required: true,
  },
  comments: {
    type: [commentsSchema],
    default: [],
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  completeBy: {
    type: Date,
    required: true,
  },
  requestedUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
});
const Post = mongoose.model('Post', postSchema);

export default Post;
