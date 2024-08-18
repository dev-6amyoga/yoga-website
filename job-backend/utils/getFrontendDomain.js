const dotenv = require("dotenv");
dotenv.config();

function getFrontendDomain() {
	return process.env.FRONTEND_DOMAIN || "http://localhost:3000/";
}

module.exports = getFrontendDomain;
