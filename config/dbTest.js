const sequelize = require("./sequelize");

(async () => {
  try {
    await sequelize.authenticate();
    console.log(" PostgreSQL connected using Sequelize");
  } catch (error) {
    console.error(" Unable to connect:", error);
  }
})();
