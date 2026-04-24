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
    // Fan nomi
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // AI uchun o'qituvchi ko'rsatmasi
    aiPrompt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Nechta savol bo'lsin
    questionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    // Urinishlar soni
    attemptsAllowed: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    // Test davomiyligi (daqiqa)
    durationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    // Deadline
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Qaysi guruhga tegishli (ixtiyoriy)
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Kim yaratgan (teacher ID)
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  Semester.associate = (models) => {
    Semester.belongsTo(models.Group, { as: "group", foreignKey: "groupId" });
    Semester.belongsTo(models.User, { as: "teacher", foreignKey: "teacherId" });
    Semester.hasMany(models.Attempt, { as: "attempts", foreignKey: "semesterId" });
  };

  return Semester;
};
