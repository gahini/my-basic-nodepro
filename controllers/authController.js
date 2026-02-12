const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { findByEmail, createUser, User } = require("../models/userModel");

/* =========================
   EMAIL VALIDATION
========================= */
const isValidEmail = (email) => {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
  return emailRegex.test(email);
};

/* =========================
   PASSWORD VALIDATION
========================= */
const isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

/* =========================
   REGISTER USER
========================= */
exports.register = async (req, res) => {
  try {

    const { name, email, password,} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include letters, numbers, and special character"
      });
    }

    const existingUser = await findByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 COUNT USERS
    const userCount = await User.count();

    // 🔥 FIRST USER → SUPER_ADMIN
    const role = userCount === 0 ? "SUPER_ADMIN" : "USER";

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    //userId: newUser.id,

    return res.status(201).json({
      message: "User registered successfully",
      role: newUser.role
    });

  } catch (error) {

    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });

  }
};


/* =========================
   LOGIN USER
========================= */
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });

  }
};

/* =========================
   GET PROFILE
========================= */
exports.getProfile = async (req, res) => {
  try {

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {

    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message });

  }
};

/* =========================
   UPDATE PROFILE
========================= */
exports.updateProfile = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {

      if (!isStrongPassword(password)) {
        return res.status(400).json({
          message: "Password not strong enough"
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully"
    });

  } catch (error) {

    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });

  }
};

/* =========================
   DELETE ACCOUNT
========================= */
exports.deleteAccount = async (req, res) => {
  try {

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Prevent SUPER_ADMIN deletion
    if (user.role === "SUPER_ADMIN") {
      return res.status(400).json({
        message: "Super Admin cannot delete account"
      });
    }

    await user.destroy();

    res.json({ message: "Account deleted successfully" });

  } catch (error) {

    console.error("Delete account error:", error);
    res.status(500).json({ message: error.message });

  }
};

/* =========================
   FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    console.log("RESET TOKEN:", resetToken);

    res.json({ message: "Reset token generated" });

  } catch (error) {

    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });

  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  try {

    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: "Password not strong enough"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {

    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });

  }
};

/* =========================
   UPDATE PASSWORD
========================= */
exports.updatePassword = async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required"
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: "New password must be at least 8 characters and include letters, numbers, and special character"
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from old password"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password updated successfully"
    });

  } catch (error) {

    console.error("Update password error:", error);
    res.status(500).json({ message: error.message });

  }
};

/* =========================
   UPDATE USER ROLE
   (SUPER_ADMIN ONLY)
========================= */
exports.updateUserRole = async (req, res) => {
  try {

    const { role } = req.body;
    const { userId } = req.params;

    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "USER"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Allow only ONE SUPER_ADMIN
    if (role === "SUPER_ADMIN") {
      const existingSuperAdmin = await User.findOne({
        where: { role: "SUPER_ADMIN" }
      });

      if (existingSuperAdmin && existingSuperAdmin.id !== user.id) {
        return res.status(400).json({
          message: "Super Admin already exists"
        });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully"
    });

  } catch (error) {

    console.error("Update role error:", error);
    res.status(500).json({ message: error.message });

  }
};
