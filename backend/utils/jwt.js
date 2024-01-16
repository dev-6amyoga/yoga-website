const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { User } = require("../models/sql/User");
const { Role } = require("../models/sql/Role");

dotenv.config();

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

const TOKEN_TYPE_ACCESS = "ACCESS_TOKEN";
const TOKEN_TYPE_REFRESH = "REFRESH_TOKEN";

function generateAccessToken(user) {
	// TODO : update the expiry
	return jwt.sign(
		{ token_type: TOKEN_TYPE_ACCESS, user: user },
		JWT_TOKEN_SECRET,
		{ expiresIn: "300s" }
	);
}

function generateRefreshToken(user) {
	// TODO : update the expiry
	return jwt.sign(
		{ token_type: TOKEN_TYPE_REFRESH, user: user },
		JWT_TOKEN_SECRET,
		{ expiresIn: "1h" }
	);
}

function verifyToken(token) {
	let decoded = null,
		error = null;

	try {
		decoded = jwt.verify(token, JWT_TOKEN_SECRET);
	} catch (err) {
		error = err;
	}
	return [decoded, error];
}

function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	// const refreshToken = req.cookies["refreshToken"];
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, JWT_TOKEN_SECRET, (err, decoded) => {
		console.log(err);

		if (err) return res.sendStatus(403);

		const u = User.findOne({
			where: {
				username: user?.username,
			},
			include: [
				{
					model: Role,
					attributes: ["name"],
				},
			],
		});

		if (!u) res.sendStatus(403);

		// TODO : get roles and permissions

		req.user = u;

		next();

		// jwt.verify(refreshToken, JWT_TOKEN_SECRET, (err, decoded) => {
		// 	const user = decoded.user;

		// });
	});
}

module.exports = {
	TOKEN_TYPE_ACCESS,
	TOKEN_TYPE_REFRESH,
	verifyToken,
	generateAccessToken,
	generateRefreshToken,
	authenticateToken,
};
