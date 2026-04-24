const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentifikatsiya tizimi
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimga kirish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@gmail.com" }
 *               password: { type: string, example: "admin123" }
 *     responses:
 *       200: { description: "Muvaffaqiyatli kirish" }
 *       400: { description: "Email yoki parol xato" }
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Joriy foydalanuvchi ma'lumotlarini olish
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Foydalanuvchi ma'lumotlari" }
 */
router.get("/me", authMiddleware, authController.getMe);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Parolni o'zgartirish
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: "Parol o'zgartirildi" }
 */
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
