const Sequelize = require("sequelize");
const sequelize = require("../config/sequelize");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Blog model → factory function ✔
db.Blog = require("./blogmodel")(sequelize, Sequelize.DataTypes);

// User model → normal object ✔
const userModel = require("./userModel");
db.User = userModel.User;

// relations
db.User.hasMany(db.Blog, { foreignKey: "userId" });
db.Blog.belongsTo(db.User, { foreignKey: "userId" });




module.exports = db;
