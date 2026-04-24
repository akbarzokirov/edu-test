module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define("Semester", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      defaultValue: "Umumiy fan",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active", // active, completed, draft
    },
    deadline: {
      type: DataTypes.DATE,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 60, // in minutes
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    questionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sourceFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Semester.associate = (models) => {
    Semester.belongsTo(models.User, { as: "teacher", foreignKey: "teacherId" });
    Semester.belongsTo(models.Group, { as: "group", foreignKey: "groupId" });
    Semester.hasMany(models.Result, { as: "results", foreignKey: "semesterId" });
  };

  return Semester;
};
