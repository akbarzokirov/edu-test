const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin boshqaruv tizimi (O'qituvchilar, Talabalar, Guruhlar, Semestrlar)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Umumiy statistikani olish
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Statistika ma'lumotlari" }
 */
router.get("/stats", adminController.getStats);
router.get("/activity", adminController.getActivity);
router.get("/chart", adminController.getChartData);

/**
 * @swagger
 * /api/admin/teachers:
 *   get:
 *     tags: [Admin]
 *     summary: O'qituvchilar ro'yxatini olish
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Ism bo'yicha qidirish
 *     responses:
 *       200: { description: "O'qituvchilar ro'yxati" }
 */
router.get("/teachers", adminController.getTeachers);

/**
 * @swagger
 * /api/admin/teachers:
 *   post:
 *     tags: [Admin]
 *     summary: Yangi o'qituvchi yaratish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: "O'qituvchi yaratildi" }
 */
router.post("/teachers", adminController.createTeacher);

/**
 * @swagger
 * /api/admin/teachers/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: O'qituvchi ma'lumotlarini tahrirlash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Yangilandi" }
 */
router.patch("/teachers/:id", adminController.updateTeacher);

/**
 * @swagger
 * /api/admin/teachers/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: O'qituvchini o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.delete("/teachers/:id", adminController.removeTeacher);
router.post("/teachers/:id/reset-password", adminController.resetTeacherPassword);

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     tags: [Admin]
 *     summary: Talabalar ro'yxatini olish
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: groupId
 *         schema: { type: integer }
 */
router.get("/students", adminController.getStudents);
router.post("/students", adminController.createStudent);
router.patch("/students/:id", adminController.updateStudent);
router.delete("/students/:id", adminController.removeStudent);

/**
 * @swagger
 * /api/admin/users/{id}/toggle-status:
 *   patch:
 *     tags: [Admin]
 *     summary: Foydalanuvchini bloklash/faollashtirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.patch("/users/:id/toggle-status", adminController.toggleUserStatus);

/**
 * @swagger
 * /api/admin/groups:
 *   get:
 *     tags: [Admin]
 *     summary: Guruhlar ro'yxatini olish
 */
router.get("/groups", adminController.getGroups);

/**
 * @swagger
 * /api/admin/groups:
 *   post:
 *     tags: [Admin]
 *     summary: Yangi guruh yaratish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, teacherId]
 *             properties:
 *               name: { type: string }
 *               teacherId: { type: integer }
 */
router.post("/groups", adminController.createGroup);

/**
 * @swagger
 * /api/admin/semesters:
 *   get:
 *     tags: [Admin]
 *     summary: Semestrlar ro'yxatini olish
 */
router.get("/semesters", adminController.getSemesters);
router.post("/semesters", adminController.createSemester);
router.patch("/semesters/:id", adminController.updateSemester);
router.delete("/semesters/:id", adminController.removeSemester);

module.exports = router;
