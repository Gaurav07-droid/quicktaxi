const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("unhandled expression💥..shutting down");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("Database connected succesfully...");
});

//SERVER
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`server is running ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("unhandled rejection💥....Shutting down");
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  consoel.log("Sigterm recieved.Shutting down gracefully...💥");
  server.close(() => {
    console.log("process terminated....");
  });
});
