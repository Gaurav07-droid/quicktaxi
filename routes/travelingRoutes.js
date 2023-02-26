const express = require("express");
const travellingController = require("../controller/travellingController");
const authController = require("../controller/authController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(travellingController.createTravelling)
  .get(travellingController.getAllTravellings);

router
  .route("/:id")
  .get(travellingController.getATravelling)
  .delete(
    authController.restrictTo("admin"),
    travellingController.deleteATravelling
  );

router
  .route("/checkout-session/:travelId")
  .get(travellingController.getCheckoutSession);

module.exports = router;
