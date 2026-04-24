const { User, Group, Semester, Result, sequelize } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

// --- DASHBOARD ---
exports.getStats = async (req, res) => {
  try {
    const teacherCount = await User.count({ where: { role: "teacher" } });
    const studentCount = await User.count({ where: { role: "student" } });
    const groupCount = await Group.count();
    const activeSemesters = await Semester.count();
    const testsCompleted = await Result.count();

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const weeklyTests = await Result.count({
      where: { createdAt: { [Op.gte]: startOfWeek } }
    });
    
    const averageScoreResult = await Result.findAll({
      attributes: [[sequelize.fn("AVG", sequelize.col("grade")), "avgScore"]]
    });
    const averageScore = Math.round(parseFloat(averageScoreResult[0].dataValues.avgScore) || 0);
    
    res.json({
      success: true,
      data: {
        teachers: teacherCount,
        students: studentCount,
        groups: groupCount,
        activeSemesters,
        testsCompleted,
        weeklyTests,
        averageScore,
        teachersChange: 10,
        studentsChange: 15,
        semestersChange: 5,
        scoreChange: 2
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]]
    });

    const activity = recentUsers.map(u => ({
      id: u.id,
      type: u.role === "teacher" ? "teacher_created" : "student_joined",
      title: u.role === "teacher" ? "Yangi o'qituvchi" : "Yangi talaba",
      description: u.fullName,
      email: u.email,
      timestamp: u.createdAt
    }));

    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const monthsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const daysLabels = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
    const now = new Date();
    
    // Monthly Data (Last 6 months)
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const students = await User.count({ where: { role: "student", createdAt: { [Op.between]: [start, end] } } });
      const tests = await Result.count({ where: { createdAt: { [Op.between]: [start, end] } } });
      monthly.push({ month: monthsLabels[d.getMonth()], students, tests });
    }

    // Weekly Data (Last 7 days)
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      const tests = await Result.count({ where: { createdAt: { [Op.between]: [start, end] } } });
      // JS getDay(): 0=Sun, 1=Mon...
      // Map to: 0=Mon, 6=Sun
      const dayIdx = (d.getDay() + 6) % 7; 
      weekly.push({ day: daysLabels[dayIdx], tests });
    }

    res.json({ success: true, data: { monthly, weekly } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- TEACHERS ---
exports.getTeachers = async (req, res) => {
  const { search } = req.query;
  try {
    const where = { role: "teacher" };
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const teachers = await User.findAll({ 
      where,
      include: [{ 
        model: Group, 
        as: "taughtGroups",
        include: [{ model: User, as: "students", attributes: ["id"] }]
      }]
    });

    const data = teachers.map(t => {
      const json = t.toJSON();
      let studentsCount = 0;
      if (json.taughtGroups) {
        json.taughtGroups.forEach(g => {
          if (g.students) studentsCount += g.students.length;
        });
      }
      return { ...json, studentsCount };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  const { groups, ...userData } = req.body;
  try {
    const teacher = await User.create({ ...userData, role: "teacher" });
    
    if (groups && groups.length > 0) {
      const groupInstances = await Promise.all(
        groups.map(name => Group.findOrCreate({ where: { name } }).then(([g]) => g))
      );
      await teacher.setTaughtGroups(groupInstances);
    }
    
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  const { groups, ...userData } = req.body;
  try {
    const teacher = await User.findOne({ where: { id: req.params.id, role: "teacher" } });
    if (!teacher) return res.status(404).json({ success: false, message: "O'qituvchi topilmadi" });
    
    await teacher.update(userData);
    
    if (groups) {
      const groupInstances = await Promise.all(
        groups.map(name => Group.findOrCreate({ where: { name } }).then(([g]) => g))
      );
      await teacher.setTaughtGroups(groupInstances);
    }
    
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await User.findByPk(id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ success: false, message: "O'qituvchi topilmadi" });
    }
    
    // Guruhlar bilan bog'liqlikni uzish
    // teacherId column borligini tekshirish uchun Group.update ishlatamiz
    await Group.update(
      { teacherId: null }, 
      { where: { teacherId: id } }
    );
    
    // O'qituvchini o'chirish
    await teacher.destroy();
    
    res.json({ success: true, message: "O'qituvchi muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("DELETE TEACHER ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "O'chirishda xatolik yuz berdi",
      error: error.message 
    });
  }
};

exports.resetTeacherPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const teacher = await User.findOne({ where: { id: req.params.id, role: "teacher" } });
    if (!teacher) return res.status(404).json({ success: false, message: "O'qituvchi topilmadi" });
    
    teacher.password = password || "123456";
    await teacher.save();
    res.json({ success: true, message: "Parol muvaffaqiyatli yangilandi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- STUDENTS ---
exports.getStudents = async (req, res) => {
  const { search, groupId } = req.query;
  try {
    const where = { role: "student" };
    if (search) {
      where.fullName = { [Op.iLike]: `%${search}%` };
    }
    if (groupId) {
      where.groupId = groupId;
    }

    const students = await User.findAll({ 
      where,
      include: [{ 
        model: Group, 
        as: "group",
        include: [{ model: User, as: "teacher", attributes: ["id", "fullName"] }]
      }]
    });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await User.create({ ...req.body, role: "student" });
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await User.findOne({ where: { id: req.params.id, role: "student" } });
    if (!student) return res.status(404).json({ success: false, message: "Talaba topilmadi" });
    
    await student.update(req.body);
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const student = await User.findOne({ where: { id: req.params.id, role: "student" } });
    if (!student) return res.status(404).json({ success: false, message: "Talaba topilmadi" });
    await student.destroy();
    res.json({ success: true, message: "Talaba o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- GROUPS ---
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        { model: User, as: "teacher", attributes: ["id", "fullName"] },
        { model: User, as: "students", attributes: ["id", "fullName"] }
      ]
    });
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Guruh topilmadi" });
    await group.update(req.body);
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Guruh topilmadi" });
    await group.destroy();
    res.json({ success: true, message: "Guruh o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SEMESTERS ---
exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.findAll({
      include: [
        { model: User, as: "teacher", attributes: ["id", "fullName"] },
        { model: Group, as: "group", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSemester = async (req, res) => {
  try {
    const {
      name, subject, aiPrompt, questionCount,
      attemptsAllowed, durationMinutes, deadline,
      groupId, teacherId, isActive,
    } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Semestr nomini kiriting" });
    }
    const semester = await Semester.create({
      name,
      subject: subject || null,
      aiPrompt: aiPrompt || null,
      questionCount: questionCount || 10,
      attemptsAllowed: attemptsAllowed || 1,
      durationMinutes: durationMinutes || 30,
      deadline: deadline || null,
      groupId: groupId || null,
      teacherId: teacherId || null,
      isActive: isActive !== false,
    });
    res.status(201).json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id);
    if (!semester) return res.status(404).json({ success: false, message: "Semestr topilmadi" });
    const allowed = [
      "name", "subject", "aiPrompt", "questionCount",
      "attemptsAllowed", "durationMinutes", "deadline",
      "groupId", "teacherId", "isActive",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        semester[key] = req.body[key];
      }
    }
    await semester.save();
    res.json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeSemester = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id);
    if (!semester) return res.status(404).json({ success: false, message: "Semestr topilmadi" });
    await semester.destroy();
    res.json({ success: true, message: "Semestr o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- USER STATUS (BLOCK/ACTIVE) ---
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      success: true, 
      message: user.isActive ? "Foydalanuvchi faollashtirildi" : "Foydalanuvchi bloklandi",
      data: { isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
