import {
  login,
  logOut,
  signUp,
  forgotPassword,
  resetPassword,
  signUpDriver,
  reqLoginOtp,
  LoginOtpVerify,
  updatePassword,
  updateProfile,
  addTaxi,
  deleteUser,
  deleteMe,
} from "./auth.js";

import { showAlert } from "./alert.js";

import "@babel/polyfill";
import {
  showMap,
  sendRequest,
  declineRequest,
  acceptRequest,
  bookTour,
  giveFeedback,
} from "./mapbox.js";
import { DayContext } from "twilio/lib/rest/bulkexports/v1/export/day.js";

const timer = document.querySelector(".timer");

const inputPhone = document.getElementById("phone");
const inputUserName = document.getElementById("user-name");
const inputEmail = document.getElementById("email");
const inputDl = document.getElementById("DL");
const inputAccountNumber = document.getElementById("Acc-number");
const inputIfsc = document.getElementById("ifsc-code");
const inputName = document.getElementById("name");

const inputDigOne = document.getElementById("digit-1");
const inputDigTwo = document.getElementById("digit-2");
const inputDigThree = document.getElementById("digit-3");
const inputDigFour = document.getElementById("digit-4");

const inputCurPass = document.getElementById("password-current");
const inputPass = document.getElementById("password");
const inputConfPass = document.getElementById("password-confirm");
const resetToken = document.getElementById("reset-token");
const inputPickupLoc = document.getElementById("pickup-loc");
const inputDestinLoc = document.getElementById("destination-loc");
const inputTaxiName = document.getElementById("taxi-name");
const inputTaxiType = document.getElementById("taxi-type");
const inputTaxiRegNo = document.getElementById("reg-no");
const inputFeedback = document.getElementById("review-text");
const inputRatings = document.getElementById("Numbers");
// const inputCurPass = document.getElementById("password-current");

const formLogin = document.querySelector(".form_login");
const resetPassForm = document.getElementById("resetpass-form");
const formSignup = document.querySelector(".form_signup");
const formSignupDriver = document.querySelector(".form_signup_driver");
const formOtp = document.querySelector(".form_Otp");
const fromOtpVerify = document.querySelector(".digit-group");
const formUpdatePass = document.getElementById("updatePass");
const formUpdateMe = document.getElementById("form-userUpdate");
const formAddTaxi = document.querySelector(".form-add-taxi");
const formGiveFeedback = document.querySelector(".review-rate");
const formDetelteMe = document.querySelector(".form-deleteME");

const logOutBtn = document.querySelector(".nav__el--logout");
const btnGetToken = document.getElementById("getToken");
const btnLoginOtp = document.getElementById("login");
const btnRequestCab = document.getElementById("btn-reqRide");
const btnAcceptReq = document.querySelectorAll(".accept-req");
const btnDeclineReq = document.querySelectorAll(".decline-req");
const btnPay = document.querySelector(".pay-now");
const btnDeleteUser = document.querySelectorAll(".delete-users");
const btnDeleteDriver = document.querySelectorAll(".delete-drivers");
const btnDeleteTaxi = document.querySelectorAll(".delete-taxi");

const map = document.getElementById("map");

if (formLogin)
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    // console.log(inputEmail.value, inputPass.value);

    login(inputEmail.value, inputPass.value);
  });

//logging out user
if (logOutBtn) logOutBtn.addEventListener("click", logOut);

if (formSignup)
  formSignup.addEventListener("submit", (e) => {
    e.preventDefault();

    signUp(
      inputUserName.value,
      inputEmail.value,
      inputPhone.value,
      inputPass.value,
      inputConfPass.value
    );
  });

if (formSignupDriver) {
  formSignupDriver.addEventListener("submit", (e) => {
    e.preventDefault();

    signUpDriver(
      inputUserName.value,
      inputEmail.value,
      inputPhone.value,
      inputDl.value,
      inputAccountNumber.value,
      inputIfsc.value,
      inputPass.value,
      inputConfPass.value
    );
  });
}

if (btnGetToken)
  btnGetToken.addEventListener("click", (e) => {
    e.preventDefault();

    if (email.value) {
      forgotPassword(email.value);
      e.target.textContent = "sending...";
    }
  });

if (resetPassForm)
  resetPassForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // resetPassword(resetToken.value, password.value, confPassword.value);
    if (resetToken.value && inputPass.value && inputConfPass.value) {
      resetPassword(resetToken.value, inputPass.value, inputConfPass.value);
      document.getElementById("passResetBtn").textContent =
        "Resetting password..";
    }
  });

if (formOtp)
  formOtp.addEventListener("submit", (e) => {
    e.preventDefault();

    reqLoginOtp(inputPhone.value);
  });

if (btnLoginOtp) {
  inputDigOne.focus();
  btnLoginOtp.addEventListener("click", (e) => {
    e.preventDefault();

    const digits = [];

    digits.push(
      inputDigOne.value,
      inputDigTwo.value,
      inputDigThree.value,
      inputDigFour.value
    );

    const otp = +digits.join("");

    if (
      !inputDigOne.value ||
      !inputDigTwo.value ||
      !inputDigThree.value ||
      !inputDigFour.value
    )
      return showAlert("error", "Please enter the 4 digit OTP!");

    LoginOtpVerify(otp);
  });
}

if (formUpdatePass)
  formUpdatePass.addEventListener("submit", (e) => {
    e.preventDefault();

    const currentPassword = inputCurPass.value;
    const password = inputPass.value;
    const confirmPassword = inputConfPass.value;

    updatePassword(currentPassword, password, confirmPassword);
    document.getElementById("passSaveBtn").textContent = "Updating...";
  });

if (formUpdateMe)
  formUpdateMe.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", inputName.value);
    form.append("email", inputEmail.value);
    form.append("phone", inputPhone.value);
    form.append("photo", document.getElementById("photo").files[0]);

    document.getElementById("saveData").textContent = "Updating...";
    updateProfile(form);
  });

if (btnRequestCab)
  btnRequestCab.addEventListener("click", (e) => {
    e.preventDefault();

    let driverId = e.target.dataset.id;
    let taxiId = e.target.dataset.taxiid;

    let from = inputPickupLoc.value;
    let to = inputDestinLoc.value;

    sendRequest(driverId, from, to, taxiId);
    btnRequestCab.textContent = "Requested";
  });

if (btnDeclineReq) {
  btnDeclineReq.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      let reqID = e.target.dataset.reqid;

      declineRequest(reqID);
    });
  });
}

if (btnAcceptReq)
  btnAcceptReq.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const travelId = e.target.dataset.reqid;

      acceptRequest(travelId);

      btnDeclineReq.style.opacity = 0;
    });
  });

if (formAddTaxi)
  formAddTaxi.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();

    // console.log(inputTaxiName.value);
    // console.log(inputTaxiType.value);
    // console.log(inputTaxiRegNo.value);

    form.append("name", inputTaxiName.value);
    form.append("type", inputTaxiType.value);
    form.append("regNumber", inputTaxiRegNo.value);
    form.append("photo", document.getElementById("photo").files[0]);

    addTaxi(form);
  });

if (btnPay)
  btnPay.addEventListener("click", (e) => {
    const travelId = e.target.dataset.reqid;

    bookTour(travelId);

    btnPay.textContent = "Processing..";
  });

if (btnDeleteUser)
  btnDeleteUser.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userId = e.target.dataset.id;

      deleteUser(userId);
    });
  });

if (btnDeleteDriver)
  btnDeleteDriver.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const driverId = e.target.dataset.id;

      deleteUser(driverId);
    });
  });

if (btnDeleteTaxi)
  btnDeleteTaxi.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const taxiSlug = e.target.dataset.slug;

      deleteUser(taxiSlug);
    });
  });

if (formGiveFeedback)
  formGiveFeedback.addEventListener("submit", (e) => {
    e.preventDefault();

    const driver = e.target.dataset.id;

    const feedback = inputFeedback.value;
    const ratings = inputRatings.value;

    console.log(feedback, ratings, driver);

    giveFeedback(driver, ratings, feedback);
  });

if (formDetelteMe) {
  formDetelteMe.addEventListener("submit", (e) => {
    e.preventDefault();

    window.alert("Are you really want to delete your account?");

    deleteMe(inputEmail.value);

    document.getElementById("delete-me").textContent = "Deleting...";
  });
}
