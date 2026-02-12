const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ import only ONE routes file
const routes = require("./routes");

// base route
app.use("/api", routes);

// test route
app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = app;
