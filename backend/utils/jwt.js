const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { User } = require("../models/sql/User");
const { Role } = require("../models/sql/Role");
const { HTTP_FORBIDDEN } = require("./http_status_codes");

dotenv.config();

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

const TOKEN_TYPE_ACCESS = "ACCESS_TOKEN";
const TOKEN_TYPE_REFRESH = "REFRESH_TOKEN";

function generateAccessToken(user) {
	// TODO : update the expiry

	const now = new Date();

	const exp = new Date();
	exp.setSeconds(exp.getSeconds() + 300);

	return [
		jwt.sign(
			{ token_type: TOKEN_TYPE_ACCESS, user: user },
			JWT_TOKEN_SECRET,
			{ expiresIn: "300s" }
		),
		now,
		exp,
	];
}

function generateRefreshToken(user) {
	// TODO : update the expiry

	const now = new Date();

	const exp = new Date();
	exp.setHours(exp.getHours() + 1);

	return [
		jwt.sign(
			{ token_type: TOKEN_TYPE_REFRESH, user: user },
			JWT_TOKEN_SECRET,
			{ expiresIn: "1h" }
		),
		now,
		exp,
	];
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

async function authenticateToken(req, res, next) {
	const authHeader = req.headers["token"];
	// const refreshToken = req.cookies["refreshToken"];
	const token = authHeader;

	if (token === null || token === undefined) return res.sendStatus(401);

	jwt.verify(token, JWT_TOKEN_SECRET, async (err, decoded) => {
		if (err) {
			console.error(err.message);
			return res.status(HTTP_FORBIDDEN).json({ message: "Forbidden" });
		}

		const u = await User.findOne({
			where: {
				username: decoded?.user?.username,
			},
			include: [
				{
					model: Role,
					attributes: ["name"],
				},
			],
		});

		if (!u) res.status(HTTP_FORBIDDEN).json({ message: "Forbidden" });

		// TODO : get roles and permissions

		req.user = u.toJSON();

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
