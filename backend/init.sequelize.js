const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");
const SQLite = require("sqlite3");

dotenv.config();

const DB_DATABASE = process.env.DB_DATABASE,
  DB_USERNAME = process.env.DB_USERNAME,
  DB_PASSWORD = process.env.DB_PASSWORD,
  DB_HOST = process.env.DB_HOST,
  DB_PORT = process.env.DB_PORT;

// console.log(DB_DATABASE, DB_USERNAME, DB_PASSWORD);
var sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  dialect: "postgres",
  logging: false,
  host: DB_HOST,
  port: DB_PORT,
  dialectOptions: {
    // ssl: {
    //   require: true, // This will help you. But you will see nwe error
    //   rejectUnauthorized: false, // This line will fix new error
    // },
  },
  benchmark: true,
});

// Initializes and syncs the db
function initializeSequelize() {
  return sequelize.sync({ alter: true });
  // return sequelize.sync({ force: true });
}

module.exports = { sequelize, initializeSequelize };
