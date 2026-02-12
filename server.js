require("dotenv").config();
const app = require("./app");

// 🔥 IMPORTANT: import models BEFORE sync
const db = require("./models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Test DB connection
    await db.sequelize.authenticate();
    console.log("Database connected");

    // 🔥 This now knows about User & Blog models
    await db.sequelize.sync({alter: true});
    console.log("Models synced");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup error:", error);
  }
})();
