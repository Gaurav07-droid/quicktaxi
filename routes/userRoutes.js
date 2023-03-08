const express = require("express");
const userController = require("../controller/userController");
const authController = require("../controller/authController");
const travellingController = require("../controller/travellingController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post(
  "/signup/driver",
  authController.settingdefaultRoles,
  authController.signup
);
router.post("/login", authController.login);
router.post("/login/otp", authController.requestOtp);
router.post("/login/otp/:otp", authController.loginWithOtp);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.get("/logout", authController.logOut);
router.patch("/update-password", authController.updatePassword);
router.patch(
  "/update-me",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete(
  "/:id/delete",
  authController.restrictTo("admin"),
  userController.deleteUser
);
router.delete("/:id/travellings", travellingController.getATravelling);

router.delete("/:email/delete-me", userController.deleteMe);

module.exports = router;
