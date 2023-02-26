const stripe = require("stripe")(process.env.Stripe_secret_key);
const Travelling = require("../models/travellingModel");
const Taxi = require("../models/taxiModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.defaultDetails = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  next();
});

exports.createTravelling = catchAsync(async (req, res, next) => {
  const travelling = await Travelling.create(req.body);
  const taxi = await Taxi.findById(travelling.taxi);

  travelling.fair = taxi.price * Math.floor(Math.random() * (27 - 22 + 1) + 22);
  await travelling.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success", data: travelling });
});

exports.getAllTravellings = catchAsync(async (req, res, next) => {
  const allTravellings = await Travelling.find();

  res.status(200).json({
    status: "success",
    results: allTravellings.length,
    data: allTravellings,
  });
});

exports.getATravelling = catchAsync(async (req, res, next) => {
  const travelling = await Travelling.findById(req.params.id);
  if (!travelling)
    return next(
      new AppError("Sorry no travel details found with that id!", 404)
    );

  res.status(200).json({ status: "success", data: travelling });
});

exports.updateTravelling = catchAsync(async (req, res, next) => {
  const updatedTravelling = await Travelling.findByIdAndUpdate(req.params.id, {
    confirmed: true,
  });

  res.status(200).json({ status: "success", data: updatedTravelling });
});

exports.deleteATravelling = catchAsync(async (req, res, next) => {
  await Travelling.findByIdAndDelete(req.params.id);

  res.status(204).json({ status: "success" });
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get currently confirmed travel details
  const travelling = await Travelling.findById(req.params.travelId);

  //Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/my-bookings?travelId=${
      req.params.travelId
    }&user=${req.user.id}&price=${travelling.amount}`,
    cancel_url: `${req.protocol}://${req.get("host")}/me`,
    customer_email: req.user.email,
    client_reference_id: req.params.travelId,
    line_items: [
      {
        price_data: {
          currency: "inr",
          unit_amount: travelling.fair * 100,
          product_data: {
            name: `${travelling.taxi.name} Taxi`,
            description: `${travelling.from} to ${travelling.to}`,
            images: [
              `https://t4.ftcdn.net/jpg/02/23/58/69/360_F_223586956_rXHwijytH8BJKmzr5F9wmf4XUMXn3Jkk.jpg`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });

  //create session as request

  res.status(200).json({
    status: "success",
    session,
  });
});

//creating booking checkout

exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { travelId, user, price } = req.query;

  if (!travelId && !user && !price) return next();

  await Travelling.findByIdAndUpdate(travelId, {
    paid: true,
  });

  res.redirect(req.originalUrl.split("?")[0]);
});
