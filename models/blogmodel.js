module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define("Blog", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    // 🔥 FOREIGN KEY (THIS WAS MISSING / MISUSED)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {
    tableName: "Blogs",
    timestamps: true
  });

  return Blog;
};
