const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { User } = require("./User");
const { Role } = require("./Role");
const { Institute } = require("./Institute");
const { Plan } = require("./Plan");
const { UserPlan } = require("./UserPlan");

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

module.exports = { UserInstitutePlanRole };
