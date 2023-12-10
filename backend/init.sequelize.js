const { Sequelize } = require("sequelize");
const SQLite = require("sqlite3");

var sequelize = new Sequelize("yoga", "root", "root", {
  dialect: "sqlite",
  storage: "./app.db",
  dialectOptions: {
    mode: SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE | SQLite.OPEN_FULLMUTEX,
  },
  logging: false,
});

// Initializes and syncs the db
function initializeSequelize() {
  return sequelize.sync();
}

module.exports = { sequelize, initializeSequelize };
