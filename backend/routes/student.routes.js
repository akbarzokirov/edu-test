const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Talaba paneli funksiyalari
 */
router.use(authMiddleware);

// Eski endpoints
router.get("/results", studentController.getMyResults);
router.get("/group", studentController.getMyGroup);

// Yangi — semestrlar va AI test
router.get("/semesters", studentController.getMySemesters);
router.get("/semesters/:id", studentController.getSemesterDetail);

/**
 * ⭐ Talaba fayl yuklaydi va AI test boshlanadi
 * Multipart form-data bilan chaqiriladi:
 *   field name: "file"
 *   qabul qilinadi: PDF, DOCX, DOC, TXT (maks 20MB)
 */
router.post(
  "/semesters/:id/start",
  upload.single("file"),
  studentController.startAttempt
);

router.patch("/attempts/:id/progress", studentController.saveProgress);
router.post("/attempts/:id/submit", studentController.submitAttempt);
router.get("/attempts/:id", studentController.getAttemptDetail);

module.exports = router;
