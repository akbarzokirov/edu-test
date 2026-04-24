module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define("Group", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Group.associate = (models) => {
    // Guruhning bitta o'qituvchisi bo'ladi
    Group.belongsTo(models.User, { 
      as: "teacher", 
      foreignKey: { name: "teacherId", allowNull: true } 
    });
    // Guruhda ko'plab talabalar bo'lishi mumkin
    Group.hasMany(models.User, { as: "students", foreignKey: "groupId" });
  };

  return Group;
};
