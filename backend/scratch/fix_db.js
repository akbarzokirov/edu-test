const { sequelize } = require("../models");

async function fix() {
  try {
    await sequelize.getQueryInterface().changeColumn("Groups", "teacherId", {
      type: "INTEGER", // Fixed type as string "INTEGER" or use Sequelize.INTEGER
      allowNull: true
    });
    console.log("Successfully changed teacherId to allowNull: true");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
