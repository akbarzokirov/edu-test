const { User, sequelize } = require("./models");

async function resetAdmin() {
  try {
    await sequelize.authenticate();
    const admin = await User.findOne({ where: { email: "admin@gmail.com" } });
    if (admin) {
      admin.password = "admin123";
      await admin.save();
      console.log("Admin paroli 'admin123' ga yangilandi.");
    } else {
      console.log("Admin topilmadi.");
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

resetAdmin();
