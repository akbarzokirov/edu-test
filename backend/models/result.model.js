module.exports = (sequelize, DataTypes) => {
  const Result = sequelize.define("Result", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    comment: {
      type: DataTypes.TEXT,
    },
  });

  Result.associate = (models) => {
    Result.belongsTo(models.User, { as: "student", foreignKey: "studentId" });
    Result.belongsTo(models.Semester, { as: "semester", foreignKey: "semesterId" });
  };

  return Result;
};
