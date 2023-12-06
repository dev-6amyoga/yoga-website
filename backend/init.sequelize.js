const { Sequelize } = require('sequelize');
const SQLite = require('sqlite3');

var sequelize = new Sequelize('yoga', 'root', 'root', {
    dialect: 'sqlite',
    storage: './app.db',
    dialectOptions: {
        mode:
            SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE | SQLite.OPEN_FULLMUTEX,
    },
    logging: false,
});

function initializeSequelize() {
    return sequelize.sync({ force: true });
}

module.exports = { sequelize, initializeSequelize };
