const Taxi = require("../models/taxiModel");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only image!", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTaxiImage = upload.single("photo");

exports.resizeTaxiPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `taxi-${req.user.name}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(641, 389)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/taxiImages/${req.file.filename}`);

  next();
};

exports.defaultParams = (req, res, next) => {
  if (req.body.type === "quick-moto") {
    req.body.price = 11;
  } else if (req.body.type === "quick-cab") {
    req.body.price = 15;
  } else if (req.body.type === "quick-auto") {
    req.body.price = 12;
  } else if (req.body.type === "quick-rentals") {
    req.body.price = 12;
  }

  if (!req.body.driver) req.body.driver = req.user.id;

  next();
};

exports.createTaxi = catchAsync(async (req, res, next) => {
  if (req.file) req.body.image = req.file.filename;

  const taxi = await Taxi.create(req.body);

  res.status(200).json({ status: "success", data: taxi });
});

exports.getAllTaxi = catchAsync(async (req, res, next) => {
  const allTaxi = await Taxi.find();

  res
    .status(200)
    .json({ status: "success", results: allTaxi.length, data: allTaxi });
});

exports.getATaxi = catchAsync(async (req, res, next) => {
  const taxi = await Taxi.findOne({ slug: req.params.slug });
  if (!taxi)
    return next(new AppError("Sorry no taxi found with that name!", 404));

  res.status(200).json({ status: "success", data: taxi });
});

// exports.updateTaxi = catchAsync(async (req, res, next) => {
//   const taxi = await Taxi.find({ type: req.body.type });
//   const driver = await User.findOne({ email: req.body.email });
//   console.log(taxi.length);
//   console.log(Math.floor(Math.random() * taxi.length));

//   let randomTaxi = taxi[Math.round(Math.random() * taxi.length)];

//   // console.log(randomTaxi);
//   // console.log(driver);

//   // res.status(204).json({ status: "success" });
// });

exports.deleteTaxi = catchAsync(async (req, res, next) => {
  await Taxi.findOneAndDelete({ slug: req.params.slug });

  res.status(204).json({ status: "success" });
});
