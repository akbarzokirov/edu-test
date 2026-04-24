const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user.model")(sequelize, Sequelize);
const Group = require("./group.model")(sequelize, Sequelize);
const Semester = require("./semester.model")(sequelize, Sequelize);
const Result = require("./result.model")(sequelize, Sequelize);

const models = { User, Group, Semester, Result };

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { ...models, sequelize };
