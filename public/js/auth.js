import axios from "axios";
import { showAlert } from "./alert.js";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.data.user.role === "driver") {
      showAlert("success", "Logged in successfully!");

      window.setTimeout(() => {
        location.assign("/me");
      }, 2000);
    } else if (res.data.data.user.role === "admin") {
      showAlert("success", "Logged in successfully!");

      window.setTimeout(() => {
        location.assign("/me");
      }, 2000);
    } else {
      showAlert("success", "Logged in succesfully!");

      window.setTimeout(() => {
        location.assign("/home");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", "Incorrect email or password!");

    window.setTimeout(() => {
      location.reload(true);
    }, 1000);
  }
};

export const reqLoginOtp = async (phone) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login/otp",
      data: {
        phone,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "OTP sent to you mobile!");

      window.setTimeout(() => {
        location.assign("/login-with-mobile/verify");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const LoginOtpVerify = async (otp) => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/users/login/otp/${otp}`,
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");

      window.setTimeout(() => {
        location.assign("/home");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });

    // console.log(res);

    if (res.data.message === "success") {
      showAlert("success", "Logging you out..");
      window.setTimeout(() => {
        location.assign("/home");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", err.resetPassword.data.message);
  }
};

export const signUpDriver = async (
  name,
  email,
  phone,
  driverLicense,
  driverAccountNumber,
  driverIfsc,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup/driver",
      data: {
        name,
        email,
        phone,
        driverLicense,
        driverAccountNumber,
        driverIfsc,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Account created succesfully!");

      window.setTimeout(() => {
        location.assign("/add-taxi");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);

    window.setTimeout(() => {
      location.reload(true);
    }, 2000);
  }
};

export const signUp = async (name, email, phone, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name,
        email,
        phone,
        password,
        passwordConfirm,
      },
    });

    console.log(res);

    if (res.data.status === "success") {
      showAlert("success", "Account created succesfully!");

      window.setTimeout(() => {
        location.assign("/home");
      }, 2000);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      url: "/api/v1/users/forgotPassword",
      method: "POST",
      data: {
        email,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", res.data.message);

      window.setTimeout(() => {
        location.assign("/reset-password");
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    if (err.response.status === 404) {
      showAlert("error", "No user found with that email! Please try again");
    } else {
      showAlert("error", "Oops Something went wrong! Please try again");
    }

    window.setTimeout(() => {
      location.reload(true);
    }, 2000);
  }
};

export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    const res = await axios({
      url: `/api/v1/users/resetPassword/${token}`,
      method: "PATCH",
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Password reseted sucessfully");

      window.setTimeout(() => {
        location.assign("/home");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const updatePassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      url: "/api/v1/users/update-password",
      method: "PATCH",
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Password updated successfully!");

      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);

    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  }
};

export const updateProfile = async (data) => {
  try {
    const res = await axios({
      url: "/api/v1/users/update-me",
      method: "PATCH",
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "Profile updated successfully!");

      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);

    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  }
};

export const addTaxi = async (data) => {
  try {
    const res = await axios({
      url: "/api/v1/taxi",
      method: "POST",
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", "Taxi added successfully!");

      window.setTimeout(() => {
        location.assign("/me");
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);

    // window.setTimeout(() => {
    //   location.reload(true);
    // }, 1500);
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await axios({
      url: `/api/v1/users/${id}/delete`,
      method: "DELETE",
    });

    if (res.status === 204) {
      showAlert("success", "User deleted successfully!");

      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);

    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  }
};
