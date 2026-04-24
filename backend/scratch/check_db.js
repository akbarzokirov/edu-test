const { sequelize, Group } = require("../models");

async function check() {
  try {
    const desc = await sequelize.getQueryInterface().describeTable("Groups");
    console.log("Groups table description:", JSON.stringify(desc, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
