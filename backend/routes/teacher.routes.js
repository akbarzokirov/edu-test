const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// Dashboard
router.get("/stats", teacherController.getStats);

// Guruhlar
router.get("/groups", teacherController.getMyGroups);

// Talabalar
router.get("/students", teacherController.getMyStudents);
router.post("/students", teacherController.createStudent);
router.patch("/students/:id", teacherController.updateStudent);
router.delete("/students/:id", teacherController.deleteStudent);

// Semestrlar
router.get("/semesters", teacherController.getMySemesters);
router.post("/semesters", teacherController.createSemester);
router.patch("/semesters/:id", teacherController.updateSemester);
router.delete("/semesters/:id", teacherController.deleteSemester);

// Natijalar
router.get("/results", teacherController.getResults);
router.get("/results/:id", teacherController.getAttemptDetail);
router.get("/results/:id/download", teacherController.downloadAttemptFile);

module.exports = router;
