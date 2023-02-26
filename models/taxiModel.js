const mongoose = require("mongoose");
const slugify = require("slugify");

const taxiSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Taxi name must be provided!"] },
  type: { type: String, required: [true, "Taxi name must be provided!"] },
  price: { type: Number, required: [true, "Taxi must have a price"] },

  regNumber: {
    type: String,
    minLength: [13, "Registration number must be of 10 digits"],
    maxLength: [13, "Registration number must be of 10 digits"],
    unique: [true, "Vechile already registered!"],
  },

  driver: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Taxi must have a driver."],
  },

  image: {
    type: String,
    required: [true, "Taxi must have an image"],
  },

  slug: String,
});

taxiSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

taxiSchema.pre(/^find/, function (next) {
  this.populate({
    path: "driver",
    select: "name email phone photo",
  });

  next();
});

const taxiModel = mongoose.model("Taxi", taxiSchema);
module.exports = taxiModel;
