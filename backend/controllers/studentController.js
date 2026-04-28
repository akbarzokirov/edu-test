const { User, Group, Semester, Result, Attempt } = require("../models");
const { extractText } = require("../services/file.service");
const {
  generateQuestions,
  gradeAttempt,
  detectLanguageHint,
} = require("../services/ai.service");

// ============================================
//  Talabaning eski natijalari
// ============================================
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { studentId: req.user.id },
      include: [
        { model: Semester, as: "semester" },
        { model: User, as: "student", attributes: ["fullName"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  Talabaning guruhi
// ============================================
exports.getMyGroup = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.id, {
      include: [
        {
          model: Group,
          as: "group",
          include: [{ model: User, as: "teacher", attributes: ["fullName", "email"] }],
        },
      ],
    });
    res.json({ success: true, data: student?.group || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  Talabaga tegishli aktiv semestrlar ro'yxati
// ============================================
exports.getMySemesters = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.id);
    const where = { isActive: true };
    if (student?.groupId) {
      where.groupId = student.groupId;
    }
    const semesters = await Semester.findAll({
      where,
      include: [
        { model: User, as: "teacher", attributes: ["id", "fullName"] },
        { model: Group, as: "group", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Har semestr uchun — urinishlar soni
    const data = await Promise.all(
      semesters.map(async (s) => {
        const attempts = await Attempt.count({
          where: { semesterId: s.id, studentId: req.user.id },
        });
        return {
          id: s.id,
          name: s.name,
          subject: s.subject,
          teacher: s.teacher?.fullName || "—",
          questionCount: s.questionCount,
          attempts: s.attemptsAllowed,
          attemptsUsed: attempts,
          duration: s.durationMinutes,
          deadline: s.deadline,
          autoGrade: true,
          status: s.isActive ? "active" : "inactive",
          canStart: attempts < s.attemptsAllowed && (!s.deadline || new Date(s.deadline) > new Date()),
        };
      })
    );

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  Semestr haqida batafsil ma'lumot
// ============================================
exports.getSemesterDetail = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id, {
      include: [{ model: User, as: "teacher", attributes: ["fullName"] }],
    });
    if (!semester) {
      return res.status(404).json({ success: false, message: "Semestr topilmadi" });
    }

    const attemptsUsed = await Attempt.count({
      where: { semesterId: semester.id, studentId: req.user.id },
    });

    res.json({
      success: true,
      data: {
        id: semester.id,
        name: semester.name,
        subject: semester.subject,
        teacher: semester.teacher?.fullName || "—",
        questionCount: semester.questionCount,
        attempts: semester.attemptsAllowed,
        attemptsUsed,
        duration: semester.durationMinutes,
        deadline: semester.deadline,
        autoGrade: true,
        canStart: attemptsUsed < semester.attemptsAllowed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
//  ⭐ ENG MUHIM ENDPOINT:
//  Talaba fayl yuklaydi → AI savol yaratadi → attempt boshlanadi
// ============================================
exports.startAttempt = async (req, res) => {
  try {
    const semesterId = req.params.id;
    const studentId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Darslik faylini yuklang (PDF, DOCX yoki TXT)",
      });
    }

    // Semestr mavjudligini tekshirish
    const semester = await Semester.findByPk(semesterId);
    if (!semester) {
      return res.status(404).json({ success: false, message: "Semestr topilmadi" });
    }

    // Urinishlar limitini tekshirish
    const prevAttempts = await Attempt.count({
      where: { semesterId, studentId },
    });
    if (prevAttempts >= semester.attemptsAllowed) {
      return res.status(403).json({
        success: false,
        message: "Urinishlar limiti tugagan",
      });
    }

    // 1) Fayldan matnni ajratib olish
    console.log(`[Attempt] Fayl qayta ishlanmoqda: ${req.file.originalname} (${req.file.size} bytes)`);
    const fileText = await extractText(req.file.buffer, req.file.originalname);

    if (!fileText || fileText.length < 100) {
      return res.status(400).json({
        success: false,
        message: "Fayldan yetarli matn olib bo'lmadi. Iltimos, boshqa fayl yuklang.",
      });
    }

    // 2) Tilni aniqlash
    const languageHint = detectLanguageHint(fileText);
    console.log(`[Attempt] Aniqlangan til: ${languageHint}`);

    // 3) Groq AI orqali savol yaratish
    console.log(`[Attempt] AI ${semester.questionCount} ta savol yaratmoqda...`);
    const { detectedLanguage, questions, hasLatex } = await generateQuestions({
      fileText,
      teacherPrompt: semester.aiPrompt || "",
      subject: semester.subject || "",
      questionCount: semester.questionCount || 10,
      languageHint,
    });
    console.log(`[Attempt] ${questions.length} ta savol yaratildi (${detectedLanguage}, latex: ${hasLatex})`);

    // 4) Attempt yaratish — fayl buffer ham saqlanadi (download uchun)
    const attempt = await Attempt.create({
      studentId,
      semesterId,
      fileName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileBuffer: req.file.buffer,
      fileText: fileText.slice(0, 15000),
      fileLanguage: detectedLanguage,
      hasLatex,
      questions,
      answers: {},
      status: "in_progress",
      startedAt: new Date(),
    });

    // 5) Frontend'ga javob — correctOption'ni YUBORMASLIK kerak
    const questionsForClient = questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
    }));

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        questions: questionsForClient,
        duration: semester.durationMinutes,
        language: detectedLanguage,
        hasLatex,
        startedAt: attempt.startedAt,
      },
    });
  } catch (err) {
    console.error("[Attempt] XATO:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Testni boshlab bo'lmadi",
    });
  }
};

// ============================================
//  Progress saqlash (har 1 soniyada avtomatik)
// ============================================
exports.saveProgress = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      where: { id: req.params.id, studentId: req.user.id },
    });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt topilmadi" });
    }
    if (attempt.status !== "in_progress") {
      return res.status(400).json({ success: false, message: "Test yakunlangan" });
    }

    const { answers, tabSwitch } = req.body;
    if (answers && typeof answers === "object") {
      attempt.answers = answers;
    }
    if (tabSwitch) {
      attempt.tabSwitchCount += 1;
    }
    await attempt.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
//  Testni topshirish — AI baholaydi
// ============================================
exports.submitAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      where: { id: req.params.id, studentId: req.user.id },
    });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt topilmadi" });
    }
    if (attempt.status !== "in_progress") {
      return res.status(400).json({ success: false, message: "Test allaqachon topshirilgan" });
    }

    const { answers } = req.body;
    const finalAnswers = answers && typeof answers === "object" ? answers : attempt.answers;

    // Baholash
    const grading = await gradeAttempt({
      questions: attempt.questions,
      answers: finalAnswers,
      language: attempt.fileLanguage,
    });

    // Attempt'ni yangilash
    attempt.answers = finalAnswers;
    attempt.score = grading.score;
    attempt.correctCount = grading.correctCount;
    attempt.aiFeedback = grading.feedback;
    attempt.status = "graded";
    attempt.submittedAt = new Date();
    await attempt.save();

    // Result jadvaliga ham yozamiz (dashboard statistikasi uchun)
    await Result.create({
      studentId: req.user.id,
      semesterId: attempt.semesterId,
      grade: grading.score,
      comment: grading.feedback?.slice(0, 500) || "",
    });

    const duration = Math.round(
      (new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000
    );

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score: grading.score,
        correct: grading.correctCount,
        total: grading.totalCount,
        duration,
        aiFeedback: grading.feedback,
      },
    });
  } catch (err) {
    console.error("[Submit] XATO:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
//  Natijani batafsil ko'rish (savollar va javoblar bilan)
// ============================================
exports.getAttemptDetail = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      where: { id: req.params.id, studentId: req.user.id },
      include: [
        { model: Semester, as: "semester", include: [{ model: User, as: "teacher", attributes: ["fullName"] }] },
      ],
    });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Topilmadi" });
    }

    const duration = attempt.submittedAt
      ? Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000)
      : 0;

    res.json({
      success: true,
      data: {
        id: attempt.id,
        semesterName: attempt.semester?.name || "—",
        subject: attempt.semester?.subject || "—",
        teacher: attempt.semester?.teacher?.fullName || "—",
        questions: attempt.questions,
        answers: attempt.answers,
        score: attempt.score,
        correct: attempt.correctCount,
        total: attempt.questions.length,
        duration,
        aiFeedback: attempt.aiFeedback,
        submittedAt: attempt.submittedAt,
        language: attempt.fileLanguage,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
