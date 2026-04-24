const { User, sequelize } = require("./models");

async function checkUsers() {
  try {
    await sequelize.authenticate();
    const users = await User.scope(null).findAll();
    console.log("Users in DB:");
    users.forEach(u => {
      console.log(`- ${u.fullName} (${u.email}) - Role: ${u.role} - Active: ${u.isActive}`);
    });
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkUsers();
