const express = require("express");
const feedbackController = require("../controller/feedbackController");
const authController = require("../controller/authController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(feedbackController.giveFedback)
  .get(authController.restrictTo("admin"), feedbackController.getAllFeedbacks);

router
  .route("/:id")
  .get(feedbackController.getAFeedback)
  .delete(
    authController.restrictTo("admin"),
    feedbackController.deleteAFeedback
  );

// router.route("/update").patch(taxiController.updateTaxi);

module.exports = router;
