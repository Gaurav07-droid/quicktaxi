const express = require("express");
const taxiController = require("../controller/taxiController");
const authController = require("../controller/authController");
const travellingController = require("../controller/travellingController");

const router = express.Router();

router.use(authController.protect);
// router.use(authController.restrictTo("admin"));

router
  .route("/")
  .post(
    taxiController.uploadTaxiImage,
    taxiController.resizeTaxiPhoto,
    taxiController.defaultParams,
    taxiController.createTaxi
  )
  .get(taxiController.getAllTaxi);

router
  .route("/:slug")
  .get(taxiController.getATaxi)
  .delete(authController.restrictTo("admin"), taxiController.deleteTaxi);

// router.route("/update").patch(taxiController.updateTaxi);

router
  .route("/request")
  .post(
    travellingController.defaultDetails,
    travellingController.createTravelling
  );

router.use(authController.restrictTo("driver"));

router
  .route("/request/:id/decline")
  .delete(travellingController.deleteATravelling);

router
  .route("/request/:id/accept")
  .patch(travellingController.updateTravelling);

module.exports = router;
