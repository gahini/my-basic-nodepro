const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers.authorization;

    // 2️⃣ Check header exists & format
    // Expected: Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Token missing or invalid format"
      });
    }

    // 3️⃣ Extract token

    const token = authHeader.split(" ")[1];


    // 4️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Attach user info to request
    // decoded = { id, role, iat, exp }
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    // 6️⃣ Continue request
    next();

  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      message: "Access denied. Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;
