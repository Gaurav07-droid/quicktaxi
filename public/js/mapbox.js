// import { BulkCountryUpdateInstance } from "twilio/lib/rest/voice/v1/dialingPermissions/bulkCountryUpdate";
import { showAlert } from "./alert";
import fuzSearch from "fuzzy-search";
import axios from "axios";
const mapContainer = document.getElementById("map");

// let accessApiToken=
mapboxgl.accessToken =
  "pk.eyJ1IjoiaWdhdXJhdiIsImEiOiJjbGNyazBva2wwMWpvM3BwNGc5Y3IwazE3In0.aqSfPNUzPCOUgE1_IBUGIw";

if (mapContainer)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const { latitude, longitude } = position.coords;

      // console.log(position);
      //const map for setting up marker

      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/outdoors-v12",
        zoom: 12.2,
        center: [longitude, latitude],
        interactive: false,
      });

      const el = document.createElement("div");
      el.className = "marker";

      new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([longitude, latitude])
        .addTo(map);
    });

    //extends to location
    // const bounds = new mapboxgl.LatLngBounds();

    // bounds.extends([longitude, latitude]);
  } else {
    alert("sorry");
    window.setTimeout(() => {
      showAlert("error", "Location permisiion denied!");
    }, 1000);
  }

// const options = {
//   method: "GET",
//   url: "https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix",
//   params: {
//     origins: "23.2128512,72.6368256",
//     destinations: "23.24083433471105, 72.65525141198836",
//   },
//   headers: {
//     "X-RapidAPI-Key": "0c34964b6bmsh1a1efb8049fe002p113d11jsne2de8eda6610",
//     "X-RapidAPI-Host": "trueway-matrix.p.rapidapi.com",
//   },
// };

// const getDistance = async (opt) => {
//   try {
//     const res = await axios({ opt });
//     console.log(res);
//   } catch (err) {
//     console.log(err);
//   }
// };

// getDistance(options);

const address = [
  {
    from: "Dwarkesh residency gandhinagar gujarat",
    to: "Bpccs gandhinagar gujarat",
    km: 4.9,
  },
];

const searcher = new fuzSearch(address, ["to", "from"], {
  caseSensitive: false,
});

export const showResult = function (search) {
  const result = searcher.search("bpccs");
  console.log(result);

  return result;
};

//Generate and send request

export const sendRequest = async function (driver, from, to, taxi) {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/taxi/request",
      data: {
        driver,
        from,
        to,
        taxi,
      },
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        "Requested sent to the driver. Please wait for confirmation"
      );

      window.setTimeout(function () {
        location.assign("/my-bookings");
      }, 30000);
    }
  } catch (err) {
    showAlert("error", "please enter pickup and destination address");
    window.setTimeout(function () {
      location.reload(true);
    }, 2000);
  }
};

export const declineRequest = async function (id) {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/taxi/request/${id}/decline`,
    });

    if (res.status === 204) {
      window.setTimeout(() => {
        showAlert("success", "Request declined successfully!");

        location.assign("/me");
      }, 2000);
    }
  } catch (err) {
    window.setTimeout(() => {
      showAlert("error", "Oops somehting went wrong! Try again later");
    }, 2000);
  }
};

export const acceptRequest = async function (id) {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/taxi/request/${id}/accept`,
    });

    if (res.data.status === "success") {
      showAlert("success", "Request accepted successfully!");
      window.setTimeout(() => {
        location.assign("/bookings");
      }, 1500);
    }
  } catch (err) {
    window.setTimeout(() => {
      showAlert("error", "Oops somehting went wrong! Try again later");
    }, 2000);
  }
};

//////////////////////STRIPE PAYMENTS//////////////////////////
const stripe = Stripe(
  "pk_test_51MfK58SGjxFrEzSXsi0QPrZYVypozfb1kmnOT0ZZNJDLSHUsYDz5Wtan6jF4t9aZPSxPh4W8ZwZak4CesWkJnOom00MEn3EjHD"
);

export const bookTour = async (travelId) => {
  try {
    const session = await axios({
      url: `/api/v1/travellings/checkout-session/${travelId}`,
    });

    // creating checkout form with stripe
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", "Oops! Something went very wrong.Pease try later");
  }
};

export const giveFeedback = async (driver, rating, review) => {
  try {
    const res = await axios({
      url: `/api/v1/feedback`,
      method: "POST",
      data: {
        driver,
        rating,
        review,
      },
    });

    console.log(res);
    if (res.data.status === "success") {
      showAlert("success", "Feedback Submitted successfully!");
      window.setTimeout(() => {
        location.assign("/me");
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", "You can only provide feedback once.Thank you");
  }
};
