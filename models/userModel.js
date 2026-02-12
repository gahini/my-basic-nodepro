const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");


const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },

  resetTokenExpiry: {
    type: DataTypes.BIGINT,
    allowNull: true
  },

  role: {
  type: DataTypes.ENUM("SUPER_ADMIN", "ADMIN", "USER"),
  allowNull: false,
  defaultValue: "USER"
},


}, {
  tableName: "users",
  freezeTableName: true,
  timestamps: false
});



// find user by email
const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

// create new user
const createUser = async ({ name, email, password }) => {
  return await User.create({ name, email, password });
};

module.exports = {
  User,
  findByEmail,
  createUser
};
