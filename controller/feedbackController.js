const Feedback = require("../models/feedbackModel");
const catchAsync = require("../utils/catchAsync");

exports.giveFedback = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  const feedback = await Feedback.create(req.body);

  res.status(200).json({ status: "success", data: feedback });
});

exports.getAllFeedbacks = catchAsync(async (req, res, next) => {
  const feedbacks = await Feedback.find();

  res
    .status(200)
    .json({ status: "success", results: feedbacks.length, data: feedbacks });
});

exports.getAFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findOne({ slug: req.params.slug });
  if (!feedback)
    return next(
      new AppError("Sorry no taxi feedback found with that id!", 404)
    );

  res.status(200).json({ status: "success", data: feedback });
});

exports.deleteAFeedback = catchAsync(async (req, res, next) => {
  await Feedback.findByIdAndDelete(req.params.id);

  res.status(204).json({ status: "success" });
});
