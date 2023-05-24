const catchAsync = require("../utils/catchAsync");
const Taxi = require("../models/taxiModel");
const User = require("../models/userModel");
const Feedback = require("../models/feedbackModel");
const Travelling = require("../models/travellingModel");

exports.getOverview = catchAsync(async (req, res) => {
  //Find all the data

  res.status(200).render("overview", {
    title: "Home",
  });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render("login", {
    title: "Login to your account",
  });
};

exports.getVerifyOtp = (req, res, next) => {
  res.status(200).render("verifyOtp", {
    title: "Verify OTP",
  });
};

exports.getLoginFormOtp = (req, res, next) => {
  res.status(200).render("loginOtp", {
    title: "Login with phone",
  });
};

exports.getLoginOpts = (req, res, next) => {
  res.status(200).render("logOpt", {
    title: "Login options",
  });
};

exports.getMe = catchAsync(async (req, res, next) => {
  const travelRequests = await Travelling.find({
    driver: req.user.id,
    confirmed: false,
  });

  res.status(200).render("account", {
    title: "My account",
    travelRequests,
  });
});

exports.signUp = (req, res, next) => {
  res.status(200).render("signup", {
    title: "Create your account",
  });
};

exports.signUpDriver = (req, res, next) => {
  res.status(200).render("signupDriver", {
    title: "Become driver signup",
  });
};

exports.addTaxi = (req, res, next) => {
  res.status(200).render("addTaxi", {
    title: "Add taxi",
  });
};

exports.myTaxi = catchAsync(async (req, res, next) => {
  const taxi = await Taxi.findOne({ driver: req.user.id });

  if (!taxi) {
    res.status(200).render("addTaxi", {
      title: "Add taxi",
    });
  } else {
    res.status(200).render("myTaxi", {
      title: "My taxi",
      taxi,
    });
  }
});

exports.getForgotPassword = (req, res, next) => {
  res.status(200).render("forgotpass", {
    title: "Forgot password",
  });
};

exports.getResetPassword = (req, res, next) => {
  res.status(200).render("resetpass", {
    title: "Reset password",
  });
};

exports.getLandingPage = (req, res, next) => {
  res.status(200).render("landingPage", {
    title: "Start your journey",
  });
};

exports.getTaxi = catchAsync(async (req, res, next) => {
  let cont = req.originalUrl.split("ride/")[1];

  const taxi = await Taxi.find({ type: cont });

  const availTaxi = taxi[Math.floor(Math.random() * taxi.length)];
  const feedbacks = await Feedback.find({ driver: availTaxi.driver.id });

  res.status(200).render("taxiPage", {
    title: `Ride with ${cont}`,
    availTaxi,
    feedbacks,
  });
});

exports.getRequests = catchAsync(async (req, res, next) => {
  const travelRequests = await Travelling.find({
    driver: req.user.id,
    confirmed: false,
  });

  if (travelRequests.length < 1) {
    res.status(404).render("notFound", {
      title: "No requests",
      type: "Requests",
    });
  } else {
    res.status(200).render("requests", {
      title: "Requests",
      travelRequests,
    });
  }
});

exports.getBookingsForUser = catchAsync(async (req, res, next) => {
  const bookings = await Travelling.find({
    user: req.user.id,
    confirmed: true,
  }).sort({ date: -1 });

  res.status(200).render("bookings-user", {
    title: "Confirmed bookings",
    bookings,
  });
});

exports.getBookingsForDriver = catchAsync(async (req, res, next) => {
  const bookings = await Travelling.find({
    driver: req.user.id,
    confirmed: true,
  }).sort({ date: -1 });

  // console.log(bookings);

  if (bookings.length < 1) {
    res.status(200).render("notFound", {
      title: "No Bookings",
      type: "Bookings",
    });
  } else {
    res.status(200).render("bookings-driver", {
      title: "My Bookings",
      bookings,
    });
  }
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  if (users.length < 1) {
    res.status(200).render("notFound", {
      title: "No users",
      type: "Users",
    });
  } else {
    res.status(200).render("users", {
      title: "All users",
      users,
    });
  }
});

exports.getAllDrivers = catchAsync(async (req, res, next) => {
  const drivers = await User.find({ role: "driver" });

  if (drivers.length < 1) {
    res.status(200).render("notFound", {
      title: "No drivers",
      type: "Drivers",
    });
  } else {
    res.status(200).render("drivers", {
      title: "All drivers",
      drivers,
    });
  }
});

exports.getAllTaxis = catchAsync(async (req, res, next) => {
  const taxis = await Taxi.find();

  if (taxis.length < 1) {
    res.status(200).render("notFound", {
      title: "No taxis",
    });
  } else {
    res.status(200).render("taxis", {
      title: "All taxis",
      taxis,
    });
  }
});

exports.getMyWallet = async (req, res, next) => {
  let fair = [];
  let todayEarn = [];

  const bookings = await Travelling.find({ driver: req.user.id, paid: true });
  const bookingsToday = await Travelling.find({
    driver: req.user.id,
    paid: true,
    date: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  bookingsToday.forEach((bkng) => {
    todayEarn.push(bkng.fair);
  });

  bookings.forEach((bkng) => {
    fair.push(bkng.fair);
  });

  const totalEarning = fair.reduce((int, prev) => {
    return (int += prev);
  }, 0);

  const todaysEarning = todayEarn.reduce((int, prev) => {
    return (int += prev);
  }, 0);

  res.status(200).render("wallet", {
    title: "Earnings",
    totalEarning,
    todaysEarning,
  });
};

exports.getFeedbacks = catchAsync(async (req, res, next) => {
  const feedbacks = await Feedback.find({ driver: req.user.id });

  if (feedbacks.length < 1) {
    res.status(200).render("notFound", {
      title: "No drivers",
      type: "Feedbacks",
    });
  } else {
    res.status(200).render("feedbacks-driver", {
      title: "All feedbacks",
      feedbacks,
    });
  }
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  res.status(200).render("deleteMe", {
    title: "Delete account",
  });
});
