const { User, Group, Semester, Result } = require("../models");
const { Op } = require("sequelize");

// O'qituvchining o'z guruhlarini olish
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      where: { teacherId: req.user.id },
      include: [{ model: User, as: "students", attributes: ["id", "fullName", "email", "createdAt"] }]
    });
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error("GET MY GROUPS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// O'qituvchiga biriktirilgan talabalar
exports.getMyStudents = async (req, res) => {
  try {
    const groups = await Group.findAll({ where: { teacherId: req.user.id } });
    const groupIds = groups.map(g => g.id);

    const students = await User.findAll({
      where: { groupId: { [Op.in]: groupIds }, role: "student" },
      include: [
        { model: Group, as: "group" },
        { model: Result, as: "results" } // to calculate avgScore and myTestsCompleted
      ]
    });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SEMESTRLAR ============

exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.findAll({
      where: { teacherId: req.user.id },
      include: [
        { model: Group, as: "group" },
        { model: Result, as: "results" }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json({ success: true, data: semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSemester = async (req, res) => {
  try {
    const data = req.body;
    const semester = await Semester.create({
      ...data,
      teacherId: req.user.id,
      status: "active",
      questionCount: data.questionCount || 10,
    });
    res.status(201).json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findOne({ where: { id, teacherId: req.user.id } });
    if (!semester) return res.status(404).json({ success: false, message: "Semestr topilmadi" });

    await semester.update(req.body);
    res.json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findOne({ where: { id, teacherId: req.user.id } });
    if (!semester) return res.status(404).json({ success: false, message: "Semestr topilmadi" });

    await semester.destroy();
    res.json({ success: true, message: "Semestr o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ NATIJALAR ============

exports.getGroupResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      include: [
        { 
          model: User, as: "student", 
          include: [{ model: Group, as: "group", where: { teacherId: req.user.id } }] 
        },
        { model: Semester, as: "semester", where: { teacherId: req.user.id } }
      ],
      order: [["submittedAt", "DESC"]]
    });
    // null student bo'lganlarini filtrlaymiz
    const filteredResults = results.filter(r => r.student !== null);
    res.json({ success: true, data: filteredResults });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard statistika
exports.getDashboardStats = async (req, res) => {
  try {
    const groups = await Group.findAll({ where: { teacherId: req.user.id } });
    const groupIds = groups.map(g => g.id);

    const studentsCount = await User.count({ where: { groupId: { [Op.in]: groupIds }, role: "student" } });
    const semesters = await Semester.findAll({ where: { teacherId: req.user.id } });
    const activeSemesters = semesters.filter(s => s.status === "active").length;

    const semesterIds = semesters.map(s => s.id);
    const resultsCount = await Result.count({ where: { semesterId: { [Op.in]: semesterIds } } });

    res.json({
      success: true,
      data: {
        myGroups: groups.length,
        groupsChange: 0,
        myStudents: studentsCount,
        studentsChange: 0,
        activeSemesters,
        semestersChange: 0,
        completedTests: resultsCount,
        scoreChange: 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
