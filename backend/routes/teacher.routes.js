const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// Statistika
router.get("/stats", teacherController.getDashboardStats);

// Guruhlar
router.get("/groups", teacherController.getMyGroups);

// Talabalar
router.get("/students", teacherController.getMyStudents);

// Semestrlar
router.get("/semesters", teacherController.getSemesters);
router.post("/semesters", teacherController.createSemester);
router.put("/semesters/:id", teacherController.updateSemester);
router.delete("/semesters/:id", teacherController.deleteSemester);

// Natijalar
router.get("/results", teacherController.getGroupResults);

module.exports = router;
