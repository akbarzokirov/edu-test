const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/postUser:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, admin, teacher]
 *                 example: user
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post("/postUser", userController.createUser);

/**
 * @swagger
 * /api/getUsers:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 *       500:
 *         description: Server error
 */
router.get("/getUsers", userController.getUsers);

/**
 * @swagger
 * /api/searchUser/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users by fullName
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Keyword for searching (fullName)
 *     responses:
 *       200:
 *         description: List of matched users
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Server error
 */
router.get("/searchUser/search", userController.searchUsers);

/**
 * @swagger
 * /api/getUserById/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get one user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/getUserById/:id", userController.getUserById);

/**
 * @swagger
 * /api/deleteUser/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/deleteUser/:id", userController.deleteUser);

/**
 * @swagger
 * /api/updateUser/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, teacher]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/updateUser/:id", userController.updateUser);

/**
 * @swagger
 * /api/signin:
 *   post:
 *     tags: [Users]
 *     summary: Login user
 *     description: Email va parol orqali tizimga kirish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login muvaffaqiyatli
 *       400:
 *         description: Email yoki parol noto‘g‘ri
 *       500:
 *         description: Server xatosi
 */
router.post("/signin", userController.loginUser);

module.exports = router;