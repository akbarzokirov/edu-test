module.exports = (sequelize, DataTypes) => {
  const Attempt = sequelize.define("Attempt", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Yuklangan faylning asl nomi
    fileName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Fayldan olingan matn (qisqartirilgan)
    fileText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Aniqlangan til (uz, ru, en, auto)
    fileLanguage: {
      type: DataTypes.STRING,
      defaultValue: "auto",
    },
    // AI yaratgan savollar — JSON massiv
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    // Talaba javoblari — JSON obyekt
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    // Baho (0-100)
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // To'g'ri javoblar soni
    correctCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // AI'ning tahliliy fikri
    aiFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Test holati
    status: {
      type: DataTypes.ENUM("in_progress", "submitted", "graded"),
      defaultValue: "in_progress",
    },
    // Boshlangan vaqti
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // Topshirilgan vaqti
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Tab switch soni (anti-cheat)
    tabSwitchCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  Attempt.associate = (models) => {
    Attempt.belongsTo(models.User, { as: "student", foreignKey: "studentId" });
    Attempt.belongsTo(models.Semester, { as: "semester", foreignKey: "semesterId" });
  };

  return Attempt;
};
