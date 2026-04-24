const { User, sequelize } = require("./models");

async function seed() {
  try {
    console.log("Database sinxronizatsiya qilinmoqda...");
    await sequelize.sync({ alter: true });
    console.log("✓ Sinxronizatsiya tugadi");

    // Faqat birinchi admin — qolgan foydalanuvchilar admin panelidan qo'shiladi
    const admin = await User.scope(null).findOne({ where: { email: "admin@gmail.com" } });
    if (!admin) {
      await User.create({
        fullName: "Asosiy Admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin",
      });
      console.log("\n✓ Admin yaratildi");
      console.log("  Email: admin@gmail.com");
      console.log("  Parol: admin123");
      console.log("\nBoshqa foydalanuvchilar, guruhlar va semestrlarni admin panelidan qo'shing.");
    } else {
      console.log("→ Admin allaqachon mavjud (admin@gmail.com)");
    }

    console.log("\n=== Seed tugadi ===");
    process.exit();
  } catch (error) {
    console.error("Seed xatosi:", error);
    process.exit(1);
  }
}

seed();
