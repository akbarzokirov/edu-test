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
    // Fayl turi (pdf, docx, txt)
    fileMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Fayl hajmi (bayt)
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // ⭐ Faylning ORIGINAL ma'lumoti (download uchun)
    fileBuffer: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    // Fayldan olingan matn (qisqartirilgan)
    fileText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Aniqlangan til
    fileLanguage: {
      type: DataTypes.STRING,
      defaultValue: "auto",
    },
    // AI yaratgan savollar
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    // Talaba javoblari
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
    correctCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    aiFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // LaTeX bormi
    hasLatex: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("in_progress", "submitted", "graded"),
      defaultValue: "in_progress",
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
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
