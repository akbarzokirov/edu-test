const { User, sequelize } = require("./models");

async function seed() {
  try {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ where: { email: "admin@gmail.com" } });
    if (!adminExists) {
      await User.create({
        fullName: "Asosiy Admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin"
      });
      console.log("Admin foydalanuvchisi yaratildi: admin@gmail.com / admin123");
    } else {
      console.log("Admin allaqachon mavjud.");
    }
    process.exit();
  } catch (error) {
    console.error("Seed xatosi:", error);
    process.exit(1);
  }
}

seed();
