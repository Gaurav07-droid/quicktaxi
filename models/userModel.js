const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      minLength: [2, "Name must be greater than 2 characters"],
      maxLength: [20, "Name must be shorter than 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: [true, "Email already exists!Please use other one"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    photo: { type: String, default: "default.jpg" },
    role: {
      type: String,
      enum: ["user", "driver", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [8, "password will be 8 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confrim your password"],
      validate: {
        //this only works SAVE!!!
        validator: function (el) {
          return el === this.password; //if this return false validation error
        },
        message: "password are not the same!",
      },
    },
    phone: {
      type: Number,
      maxLength: [10, "Phone number can not be greater than 10 values"],
      minLength: [10, "Phone number can not be less than 10 values"],
      unique: [
        true,
        "Phone number already in use! please try again with other phone",
      ],
    },
    vechileType: String,
    vechileNumber: {
      type: String,
      minLength: [10, "Vechile number must be of 10 digits"],
      maxLength: [10, "Vechile number must be of 10 digits"],
      unique: [true, "Number already registered!"],
    },
    driverLicense: {
      type: String,
      unique: [true, "License already registered!"],
    },
    driverAccountNumber: {
      type: String,
      unique: [true, "Account number already registered!"],
    },
    driverIfsc: { type: String, unique: [true, "IFSC already registered!"] },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresIn: Date,
    otp: Number,
    otpExpiresIn: Date,
    active: { type: String, default: true, select: false },
    createdOn: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "driver",
});

//hashing the password before saving it (pre save hook)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; //not stored in database
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Instance mehtod on the model available while using User have to await the result
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //only return true or false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false; //doesnot chnaged password (default)
};

userSchema.methods.createPasswordResetToken = function () {
  //to emai reset token will be sent ut to databse encryptrted will saved
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto //this will be in databse (encrypted one)
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000; //set to 10 minutes
  // console.log(this.passwordResetExpiresIn > Date.now());return true
  return resetToken;
};

userSchema.methods.createSendOtp = function () {
  const otp = Math.floor(Math.random() * (5000 - 1000) + 1000);

  // const otp = crypto.randomInt(9999 - 1111).toString("hex");

  this.otp = otp;
  this.otpExpiresIn = Date.now() + 2 * 60 * 1000;

  return otp;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
