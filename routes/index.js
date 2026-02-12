const express = require("express");
const router = express.Router();

// import individual routes
const authRoutes = require("./authRoutes");
const blogRoutes = require("./blogroutes");

// mount routes
router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);

module.exports = router;
