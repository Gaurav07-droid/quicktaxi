const mongoose = require("mongoose");

const travellingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Travelling must require a user"],
  },
  driver: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Travelling must require a driver"],
  },
  from: {
    type: "String",
    required: [true, "Travelling must require a start destination"],
  },
  to: {
    type: "String",
    required: [true, "Travelling must require a ending destination"],
  },
  taxi: {
    type: mongoose.Types.ObjectId,
    ref: "Taxi",
    required: [true, "Travelling must require a taxi"],
  },
  fair: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  distance: {
    type: Number,
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

travellingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email phone photo",
  })
    .populate({
      path: "taxi",
      select: "name type price",
    })
    .populate({ path: "driver", select: "name phone " });

  next();
});

const Travelling = mongoose.model("Travelling", travellingSchema);

module.exports = Travelling;
