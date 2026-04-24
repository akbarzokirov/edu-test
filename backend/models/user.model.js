const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      role: {
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
        defaultValue: "student",
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
    }
  );

  User.beforeSave(async (user) => {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  User.associate = (models) => {
    // Talaba bitta guruhga tegishli bo'lishi mumkin
    User.belongsTo(models.Group, { as: "group", foreignKey: "groupId" });
    // O'qituvchi ko'plab guruhlarga rahbar bo'lishi mumkin
    User.hasMany(models.Group, { as: "taughtGroups", foreignKey: "teacherId" });
    // Talabaning ko'plab natijalari bo'lishi mumkin
    User.hasMany(models.Result, { as: "results", foreignKey: "studentId" });
  };

  return User;
};