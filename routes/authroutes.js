const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const superAdminOnly = require("../middlewares/superAdminOnly");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.put("/update-password",authMiddleware,authController.updatePassword);

// 🔐 ROLE MANAGEMENT (SUPER ADMIN ONLY)
router.put( "/update-role/:userId",authMiddleware,superAdminOnly("SUPER_ADMIN"),authController.updateUserRole);

module.exports = router;
