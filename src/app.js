const express = require("express");
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import routes
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
