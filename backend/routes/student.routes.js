const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/stats", studentController.getDashboardStats);
router.get("/semesters", studentController.getSemesters);
router.get("/semesters/:id", studentController.getSemesterDetails);
router.post("/semesters/:id/submit", studentController.submitTest);

router.get("/results", studentController.getMyResults);
router.get("/group", studentController.getMyGroup);

module.exports = router;
