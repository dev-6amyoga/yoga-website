const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");
const { Role } = require("./Role");
const { Institute } = require("./Institute");
const { Plan } = require("./Plan");

const UserInstitutePlanRole = sequelize.define(
  "user_institute_plan_role",
  {
    user_institute_plan_role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { ...options }
);

UserInstitutePlanRole.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
UserInstitutePlanRole.belongsTo(Role, {
  foreignKey: "role_id",
  onDelete: "SET NULL",
});
UserInstitutePlanRole.belongsTo(Institute, {
  foreignKey: "institute_id",
  onDelete: "SET NULL",
});
UserInstitutePlanRole.belongsTo(Plan, {
  foreignKey: "plan_id",
  onDelete: "SET NULL",
});

module.exports = { UserInstitutePlanRole };
