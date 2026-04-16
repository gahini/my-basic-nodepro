require("dotenv").config();
const app = require("./src/app");

// 🔥 IMPORTANT: import models BEFORE migrations
const db = require("./src/models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Test DB connection
    await db.sequelize.authenticate();
    console.log("Database connected");

    // 🔥 Migrations handle schema - no sync needed
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup error:", error);
  }
})();
