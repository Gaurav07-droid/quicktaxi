const express = require("express");
const viewsController = require("../controller/viewController");
const authController = require("../controller/authController");
const travellingController = require("../controller/travellingController");

const router = express.Router();

router.get("/login-options", viewsController.getLoginOpts);
router.get("/login-with-email", viewsController.getLoginForm);
router.get("/login-with-mobile", viewsController.getLoginFormOtp);
router.get("/login-with-mobile/verify", viewsController.getVerifyOtp);

router.get("/signup", viewsController.signUp);
router.get("/signup/driver", viewsController.signUpDriver);
router.get("/forgot-password", viewsController.getForgotPassword);
router.get("/reset-password", viewsController.getResetPassword);

router.get("/", viewsController.getLandingPage);

router.use(authController.isLoggedIn);

router.get("/my-taxi", viewsController.myTaxi);
router.get("/add-taxi", viewsController.addTaxi);
router.get("/home", viewsController.getOverview);

router.get(
  "/my-bookings",
  // travellingController.confirmPayment,
  viewsController.getBookingsForUser
);

router.get("/bookings", viewsController.getBookingsForDriver);
router.get("/ride/:taxi", viewsController.getTaxi);
router.get("/ride-requests", viewsController.getRequests);
router.get("/me", viewsController.getMe);

router.get("/manage-users", viewsController.getAllUsers);
router.get("/manage-drivers", viewsController.getAllDrivers);
router.get("/my-earnings", viewsController.getMyWallet);
router.get("/my-feedbacks", viewsController.getFeedbacks);
router.get("/delete-account", viewsController.deleteMe);
router.get("/manage-taxis", viewsController.getAllTaxis);

module.exports = router;
