const { User, Group, Semester, Result, Attempt, sequelize } = require("../models");
const { Op } = require("sequelize");

// ============================================
//  Talaba yaratish (FAQAT o'z guruhiga)
// ============================================
exports.createStudent = async (req, res) => {
  try {
    const { fullName, email, password, groupId } = req.body;

    if (!fullName || !email || !password || !groupId) {
      return res.status(400).json({
        success: false,
        message: "Ism, email, parol va guruhni kiriting",
      });
    }

    // Email formati
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Email formati noto'g'ri" });
    }

    // Parol uzunligi
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Parol kamida 6 ta belgi bo'lsin" });
    }

    // Guruh teacher'niki ekanligini tekshirish
    const group = await Group.findOne({
      where: { id: groupId, teacherId: req.user.id },
    });
    if (!group) {
      return res.status(403).json({
        success: false,
        message: "Siz faqat o'zingizning guruhingizga talaba qo'sha olasiz",
      });
    }

    // Email band emasligini tekshirish
    const existing = await User.scope(null).findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Bu email allaqachon band" });
    }

    const student = await User.create({
      fullName,
      email,
      password,
      role: "student",
      groupId: parseInt(groupId),
    });

    const studentData = student.toJSON();
    delete studentData.password;

    res.status(201).json({ success: true, data: studentData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
//  Talabani tahrirlash (FAQAT o'z guruhidagi)
// ============================================
exports.updateStudent = async (req, res) => {
  try {
    const { fullName, email, password, groupId } = req.body;

    // Talabani topish va teacher guruhiga tegishli ekanligini tekshirish
    const student = await User.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });

    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, message: "Talaba topilmadi" });
    }

    if (!student.group || student.group.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Siz faqat o'zingizning guruhingizdagi talabalarni tahrirlay olasiz",
      });
    }

    // Agar yangi guruh berilsa — u ham teacher'niki bo'lishi kerak
    if (groupId && groupId !== student.groupId) {
      const newGroup = await Group.findOne({
        where: { id: groupId, teacherId: req.user.id },
      });
      if (!newGroup) {
        return res.status(403).json({
          success: false,
          message: "Yangi guruh sizga tegishli emas",
        });
      }
      student.groupId = parseInt(groupId);
    }

    // Email o'zgartirilsa — band emasligini tekshirish
    if (email && email !== student.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: "Email formati noto'g'ri" });
      }
      const existing = await User.scope(null).findOne({ where: { email } });
      if (existing && existing.id !== student.id) {
        return res.status(409).json({ success: false, message: "Bu email allaqachon band" });
      }
      student.email = email;
    }

    if (fullName) student.fullName = fullName;

    // Parol o'zgartirish ixtiyoriy
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Parol kamida 6 ta belgi bo'lsin" });
      }
      student.password = password; // user model beforeSave hook avtomatik hash qiladi
    }

    await student.save();

    const studentData = student.toJSON();
    delete studentData.password;

    res.json({ success: true, data: studentData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
//  Talabani o'chirish (FAQAT o'z guruhidan)
// ============================================
exports.deleteStudent = async (req, res) => {
  try {
    // Talabani topish
    const student = await User.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });

    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, message: "Talaba topilmadi" });
    }

    // Talaba teacher'ning guruhidami?
    if (!student.group || student.group.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Siz faqat o'zingizning guruhingizdagi talabalarni o'chira olasiz",
      });
    }

    await student.destroy();
    res.json({ success: true, message: "Talaba o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  O'qituvchining o'z guruhlari
// ============================================
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      where: { teacherId: req.user.id },
      include: [
        { model: User, as: "students", attributes: ["id", "fullName", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Har guruh uchun aktiv semestr soni
    const data = await Promise.all(
      groups.map(async (g) => {
        const activeSemesters = await Semester.count({
          where: { groupId: g.id, isActive: true },
        });
        return {
          id: g.id,
          name: g.name,
          studentsCount: g.students?.length || 0,
          activeSemesters,
          students: g.students,
          createdAt: g.createdAt,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  O'qituvchining talabalari
// ============================================
exports.getMyStudents = async (req, res) => {
  try {
    const { search, groupId } = req.query;

    // O'qituvchining guruhlari
    const myGroups = await Group.findAll({
      where: { teacherId: req.user.id },
      attributes: ["id", "name"],
    });
    const groupIds = myGroups.map((g) => g.id);

    if (groupIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const where = { role: "student", groupId: { [Op.in]: groupIds } };
    if (groupId && groupId !== "all") {
      where.groupId = parseInt(groupId);
    }
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const students = await User.findAll({
      where,
      include: [{ model: Group, as: "group", attributes: ["id", "name"] }],
      order: [["fullName", "ASC"]],
    });

    // Har talaba uchun statistika
    const data = await Promise.all(
      students.map(async (s) => {
        const testsCompleted = await Result.count({ where: { studentId: s.id } });
        const avg = await Result.findAll({
          where: { studentId: s.id },
          attributes: [[sequelize.fn("AVG", sequelize.col("grade")), "avgScore"]],
        });
        const averageScore = parseFloat(avg[0]?.dataValues?.avgScore) || null;
        return {
          id: s.id,
          fullName: s.fullName,
          email: s.email,
          groupId: s.groupId,
          groupName: s.group?.name || "—",
          testsCompleted,
          averageScore: averageScore != null ? Math.round(averageScore) : null,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  Dashboard statistikasi
// ============================================
exports.getStats = async (req, res) => {
  try {
    const myGroups = await Group.count({ where: { teacherId: req.user.id } });

    const groupIds = (await Group.findAll({
      where: { teacherId: req.user.id },
      attributes: ["id"],
    })).map((g) => g.id);

    const myStudents = groupIds.length
      ? await User.count({ where: { role: "student", groupId: { [Op.in]: groupIds } } })
      : 0;

    const activeSemesters = await Semester.count({
      where: { teacherId: req.user.id, isActive: true },
    });

    const mySemesterIds = (await Semester.findAll({
      where: { teacherId: req.user.id },
      attributes: ["id"],
    })).map((s) => s.id);

    const avg = mySemesterIds.length
      ? await Result.findAll({
          where: { semesterId: { [Op.in]: mySemesterIds } },
          attributes: [[sequelize.fn("AVG", sequelize.col("grade")), "avgScore"]],
        })
      : [];
    const averageScore = parseFloat(avg[0]?.dataValues?.avgScore) || 0;

    res.json({
      success: true,
      data: {
        myGroups,
        myStudents,
        activeSemesters,
        averageScore: Math.round(averageScore),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  O'qituvchi yaratgan semestrlar
// ============================================
exports.getMySemesters = async (req, res) => {
  try {
    const semesters = await Semester.findAll({
      where: { teacherId: req.user.id },
      include: [{ model: Group, as: "group", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    const data = await Promise.all(
      semesters.map(async (s) => {
        const total = s.groupId
          ? await User.count({ where: { role: "student", groupId: s.groupId } })
          : 0;
        const submitted = await Attempt.count({
          where: { semesterId: s.id, status: "graded" },
        });
        return {
          id: s.id,
          name: s.name,
          subject: s.subject,
          groupId: s.groupId,
          groupName: s.group?.name || "—",
          questionCount: s.questionCount,
          attempts: s.attemptsAllowed,
          duration: s.durationMinutes,
          deadline: s.deadline,
          aiPrompt: s.aiPrompt,
          status: s.isActive ? "active" : "draft",
          submitted,
          total,
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  Yangi semestr yaratish (teacher)
// ============================================
exports.createSemester = async (req, res) => {
  try {
    const {
      name, subject, aiPrompt, questionCount,
      attemptsAllowed, durationMinutes, deadline,
      groupId, isActive,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Semestr nomini kiriting" });
    }
    if (!aiPrompt || aiPrompt.length < 10) {
      return res.status(400).json({ success: false, message: "AI prompt kamida 10 ta belgi bo'lsin" });
    }

    // Teacher faqat o'z guruhlariga semestr yarata oladi
    if (groupId) {
      const group = await Group.findOne({
        where: { id: groupId, teacherId: req.user.id },
      });
      if (!group) {
        return res.status(403).json({ success: false, message: "Bu sizning guruhingiz emas" });
      }
    }

    const semester = await Semester.create({
      name,
      subject: subject || null,
      aiPrompt,
      questionCount: questionCount || 10,
      attemptsAllowed: attemptsAllowed || 1,
      durationMinutes: durationMinutes || 30,
      deadline: deadline || null,
      groupId: groupId || null,
      teacherId: req.user.id,
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, data: semester });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
//  Semestrni tahrirlash
// ============================================
exports.updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findOne({
      where: { id: req.params.id, teacherId: req.user.id },
    });
    if (!semester) {
      return res.status(404).json({ success: false, message: "Semestr topilmadi" });
    }

    const allowed = [
      "name", "subject", "aiPrompt", "questionCount",
      "attemptsAllowed", "durationMinutes", "deadline",
      "groupId", "isActive",
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

// ============================================
//  Semestrni o'chirish
// ============================================
exports.deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findOne({
      where: { id: req.params.id, teacherId: req.user.id },
    });
    if (!semester) {
      return res.status(404).json({ success: false, message: "Semestr topilmadi" });
    }
    await semester.destroy();
    res.json({ success: true, message: "Semestr o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  Natijalar ro'yxati
// ============================================
exports.getResults = async (req, res) => {
  try {
    const { search, semesterId, scoreRange } = req.query;

    const mySemesterIds = (await Semester.findAll({
      where: { teacherId: req.user.id },
      attributes: ["id"],
    })).map((s) => s.id);

    if (mySemesterIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const where = { semesterId: { [Op.in]: mySemesterIds }, status: "graded" };
    if (semesterId && semesterId !== "all") {
      where.semesterId = parseInt(semesterId);
    }
    if (scoreRange === "excellent") where.score = { [Op.gte]: 85 };
    else if (scoreRange === "good") where.score = { [Op.between]: [70, 84] };
    else if (scoreRange === "fair") where.score = { [Op.between]: [50, 69] };
    else if (scoreRange === "poor") where.score = { [Op.lt]: 50 };

    let attempts = await Attempt.findAll({
      where,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "fullName", "email", "groupId"],
          include: [{ model: Group, as: "group", attributes: ["id", "name"] }],
        },
        { model: Semester, as: "semester", attributes: ["id", "name", "subject"] },
      ],
      order: [["submittedAt", "DESC"]],
    });

    if (search) {
      const q = search.toLowerCase();
      attempts = attempts.filter(
        (a) =>
          a.student?.fullName?.toLowerCase().includes(q) ||
          a.semester?.name?.toLowerCase().includes(q)
      );
    }

    const data = attempts.map((a) => ({
      id: a.id,
      studentName: a.student?.fullName || "—",
      studentUsername: a.student?.email || "—",
      groupName: a.student?.group?.name || "—",
      semesterName: a.semester?.name || "—",
      subject: a.semester?.subject || "—",
      score: a.score,
      correct: a.correctCount,
      total: a.questions?.length || 0,
      duration: a.submittedAt && a.startedAt
        ? Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
        : 0,
      submittedAt: a.submittedAt,
      hasFile: !!a.fileName,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  O'quvchi yuklagan faylni ko'rish (fileText)
// ============================================
exports.getAttemptDetail = async (req, res) => {
  try {
    const attempt = await Attempt.findByPk(req.params.id, {
      include: [
        { model: Semester, as: "semester" },
        { model: User, as: "student", attributes: ["fullName", "email"] },
      ],
    });
    if (!attempt || attempt.semester?.teacherId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Topilmadi" });
    }
    res.json({
      success: true,
      data: {
        id: attempt.id,
        student: attempt.student,
        fileName: attempt.fileName,
        fileText: attempt.fileText,
        fileLanguage: attempt.fileLanguage,
        score: attempt.score,
        correctCount: attempt.correctCount,
        aiFeedback: attempt.aiFeedback,
        questions: attempt.questions,
        answers: attempt.answers,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
