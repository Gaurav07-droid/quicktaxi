const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review will be for Driver"],
  },

  rating: {
    type: Number,
    default: 4,
    min: [1, "Rating should be less than 1"],
    max: [5, "Rating should not be more than 5"],
  },

  review: {
    type: String,
    required: [true, "Please add a review"],
  },
});

reviewSchema.index({ user: 1, driver: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo email",
  });

  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
