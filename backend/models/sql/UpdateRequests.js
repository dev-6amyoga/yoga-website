const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { Institute } = require("./Institute");
const { Role } = require("./Role");
const { User } = require("./User");

const UpdateRequests = sequelize.define(
  "update_requests",
  {
    update_request_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      autoIncrementIdentity: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    old_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    new_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    admin_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    approval_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { ...options }
);

UpdateRequests.belongsTo(User, { foreignKey: "user_id" });

module.exports = { UpdateRequests };
