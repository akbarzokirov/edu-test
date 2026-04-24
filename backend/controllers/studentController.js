const { User, Group, Semester, Result } = require("../models");
const { Op } = require("sequelize");

exports.getDashboardStats = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.id);
    const results = await Result.findAll({ where: { studentId: student.id } });
    
    let avgScore = 0;
    if (results.length > 0) {
      avgScore = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
    }
    
    // Find active semesters for their group
    const activeSemesters = await Semester.count({ 
      where: { groupId: student.groupId, status: "active" } 
    });

    res.json({
      success: true,
      data: {
        completedTests: results.length,
        averageScore: avgScore,
        activeTests: activeSemesters,
        testsChange: 0,
        scoreChange: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSemesters = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.id);
    const semesters = await Semester.findAll({
      where: { groupId: student.groupId },
      include: [
        { model: User, as: "teacher", attributes: ["fullName"] },
        { 
          model: Result, as: "results", 
          where: { studentId: student.id },
          required: false // LEFT JOIN so we get semesters even if no result
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    
    res.json({ success: true, data: semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSemesterDetails = async (req, res) => {
  try {
    const semester = await Semester.findOne({
      where: { id: req.params.id },
      include: [{ model: User, as: "teacher", attributes: ["fullName"] }]
    });
    if (!semester) return res.status(404).json({ success: false, message: "Semestr topilmadi" });

    // Fetch student's past attempts
    const results = await Result.findAll({
      where: { semesterId: semester.id, studentId: req.user.id }
    });

    res.json({ success: true, data: { semester, results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { score, duration } = req.body;
    const semesterId = req.params.id;
    
    const semester = await Semester.findByPk(semesterId);
    if (!semester) return res.status(404).json({ success: false, message: "Semestr topilmadi" });

    // Check attempts limit
    const pastResultsCount = await Result.count({
      where: { semesterId, studentId: req.user.id }
    });
    
    if (pastResultsCount >= semester.attempts) {
      return res.status(400).json({ success: false, message: "Urinishlar soni tugagan" });
    }

    const result = await Result.create({
      studentId: req.user.id,
      semesterId,
      score,
      duration,
      attempts: pastResultsCount + 1,
      submittedAt: new Date()
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { studentId: req.user.id },
      include: [
        { model: Semester, as: "semester" },
        { model: User, as: "student", attributes: ["fullName"] }
      ],
      order: [["submittedAt", "DESC"]]
    });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyGroup = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.id, {
      include: [{ 
        model: Group, as: "group",
        include: [{ model: User, as: "teacher", attributes: ["fullName", "email"] }]
      }]
    });
    res.json({ success: true, data: student.group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
