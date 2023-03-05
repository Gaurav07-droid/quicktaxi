const { promisify } = require("util");
const client = require("twilio")(
  process.env.twilio_authSId,
  process.env.twilio_token
);
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = function (req, user, statusCode, res) {
  const token = signToken(user._id);

  //sending cookie
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000
    ),
    // httpOnly: true,
    // secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  //removing password
  res.password = undefined;

  //sending token
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

exports.settingdefaultRoles = catchAsync(async (req, res, next) => {
  if (req.originalUrl.endsWith("driver")) {
    req.body.role = "driver";
  } else {
    req.body.role = req.body.role;
  }

  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    vechileType: req.body.vechileType,
    driverLicense: req.body.driverLicense,
    driverAccountNumber: req.body.driverAccountNumber,
    driverIfsc: req.body.driverIfsc,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(req, newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //check email and password exists
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  //check if user exists and password is correct

  const user = await User.findOne({ email }).select("+password");

  // const correct = await user.correctPassword(password, user.password);

  // through bcrypt.compare in model by ceating instance method
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  createSendToken(req, user, 200, res);
});

// exports.logOut = (req, res, next) => {
//   res.cookie('jwt', 'Jsonwebtoken', {
//     expires: Date.now() + 10 * 1000,
//     httpOnly: true,
//   });

//   res.status(200).json({
//     status: 'success',
//   });
// };

exports.requestOtp = catchAsync(async (req, res, next) => {
  let { phone } = req.body;

  if (!phone) {
    return next(
      new AppError("Please proive a mobile number to request a otp!,", 401)
    );
  }

  const user = await User.findOne({ phone });

  if (!user) {
    return next(
      new AppError("Please proive a registered mobile number !", 401)
    );
  }

  const otpp = user.createSendOtp();
  await user.save({ validateBeforeSave: false });

  try {
    await client.messages.create({
      body: `Your otp for login to the Quicktaxi (ONLY VALID FOR 2 MINUTES):${otpp}`,
      from: "+18022301324",
      to: `+91${phone}`,
    });
  } catch (err) {
    return next(
      new AppError("Oops! somthing went try wrong! Try again later", 400)
    );
  }

  res.status(200).json({
    status: "success",
    message: "OTP sent to your mobile",
  });
});

exports.loginWithOtp = catchAsync(async (req, res, next) => {
  let { otp } = req.params;

  if (!otp) {
    return next(new AppError("Please provide otp to login!,", 401));
  }

  const user = await User.findOne({
    otp: otp,
    otpExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid otp or otp has been expired !", 401));
  }

  user.otp = undefined;
  user.otpExpiresIn = undefined;
  await user.save({ validateBeforeSave: false });

  createSendToken(req, user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //check if token already there exist or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; //taking bearer token out
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        "Your are not logged In! please logged in to get access",
        401
      )
    );
  }

  //verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //check if user still exist not deleted after login
  const currentUser = await User.findById(decoded.id);
  // console.log(freshUser);

  if (!currentUser) {
    return next(
      new AppError("The user beloging to this token is no longer exists!", 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed the password! Please login again",
        401
      )
    );
  }

  //ACCESS GRANTED TO THE PROTECTED ROUTES
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

//Only for rendered pages,so there will be no0 errors
exports.isLoggedIn = async (req, res, next) => {
  //check if token already there exist or not
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      //verify the token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      // console.log(decoded);

      //check if user still exist not deleted after login
      const currentUser = await User.findById(decoded.id);
      // console.log(freshUser);

      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //ACCESS GRANTED TO THE PROTECTED ROUTES
      req.user = currentUser;
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.logOut = (req, res, next) => {
  res.cookie("jwt", "Expires", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    message: "success",
  });
};

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    // console.log(req.user.role);
    //roles['user','driver','admin']
    if (!roles.includes(req.user.role)) {
      //req.user coming from above middleware
      return next(
        new AppError("You donot have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //GET user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User not found with that email address.", 404));
  }
  //generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to the email
  try {
    const resetURL = resetToken;

    await new Email(user, resetURL).sendPasswordToken();

    res.status(200).json({
      status: "success",
      message: "Token sent to the email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending email.Please try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get the user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresIn: { $gt: Date.now() },
  });
  //check token not expired and there is user then take the token
  if (!user) {
    return next(new AppError("Token is invalid or expired.", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresIn = undefined;

  await user.save({ validateBeforeSave: true });
  //update changedPasswordAt property for the user
  //log the user in,send jwt
  createSendToken(req, user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // req.user coming from protect rourtes
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError("Current password is incorrect!Please try again", 401)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateBeforeSave: true });

  createSendToken(req, user, 200, res);
});
