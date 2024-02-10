const { sequelize } = require("../../init.sequelize");
const { DataTypes } = require("sequelize");
const { options } = require("./defaultOptions");
const { Role } = require("./Role");
const { Permission } = require("./Permission");

const RolePermission = sequelize.define("role_permission", {}, { ...options });

module.exports = { RolePermission };
