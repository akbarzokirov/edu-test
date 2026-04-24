const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize } = require("./models");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const teacherRoutes = require("./routes/teacher.routes");
const studentRoutes = require("./routes/student.routes");
const userRoutes = require("./routes/user.routes");
const setupSwagger = require("./swagger/swagger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors({ origin: "*" }));

// ================= HEALTH CHECK (TEST) =================
app.get("/ping", (req, res) => {
  res.json({ success: true, message: "Server ishlayapti" });
});

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api", userRoutes);

// ================= SWAGGER =================
setupSwagger(app);

// ================= 404 HANDLER (OXIRIDA BO‘LISHI SHART) =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: "fail",
    message: `${req.originalUrl} manzili topilmadi`,
  });
});

// ================= DATABASE + SERVER =================
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database ulandi");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });