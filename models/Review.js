import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewBody: {
    type: String,
    default: '',
  },
  posterUsername: {
    type: String,
    required: true,
  },
});

const Review = mongoose.model('Review', reviewSchema);

export { reviewSchema, Review };
