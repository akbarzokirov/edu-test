module.exports = (sequelize, DataTypes) => {
  const Result = sequelize.define("Result", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
