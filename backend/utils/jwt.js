const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { User } = require("../models/sql/User");
const { Role } = require("../models/sql/Role");
const { HTTP_FORBIDDEN } = require("./http_status_codes");
const { LoginToken } = require("../models/sql/LoginToken");
const { Op } = require("sequelize");
const { GetUserInfo } = require("../services/User.service");

dotenv.config();

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

const TOKEN_TYPE_ACCESS = "ACCESS_TOKEN";
const TOKEN_TYPE_REFRESH = "REFRESH_TOKEN";

function generateAccessToken(user) {
	// TODO : update the expiry

	const now = new Date();

	const exp = new Date();
	exp.setHours(exp.getHours() + 2);

	return [
		jwt.sign(
			{ token_type: TOKEN_TYPE_ACCESS, user: user },
			JWT_TOKEN_SECRET,
			{
				expiresIn: "2h",
			}
		),
		now,
		exp,
	];
}

function generateRefreshToken(user) {
	// TODO : update the expiry

	const now = new Date();

	const exp = new Date();
	exp.setHours(exp.getHours() + 12);

	return [
		jwt.sign(
			{ token_type: TOKEN_TYPE_REFRESH, user: user },
			JWT_TOKEN_SECRET,
			{
				expiresIn: "12h",
			}
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
		console.log(err);
		error = err;
	}
	return [decoded, error];
}

async function authenticateToken(req, res, next) {
	// console.log(req.headers);
	const authHeader = req.headers["authorization"];
	// const refreshToken = req.cookies["refreshToken"];
	const token = authHeader?.split(" ")[1];
	console.log({ access_token: token !== undefined || token !== null });
	// console.log({ authHeader });

	if (token === null || token === undefined) return res.sendStatus(401);

	jwt.verify(token, JWT_TOKEN_SECRET, async (err, decoded) => {
		if (err) {
			console.error(err.message);
			return res.status(HTTP_FORBIDDEN).json({ message: "Forbidden" });
		}

		const [u, error] = await GetUserInfo({ user_id: decoded.user.user_id });

		if (error) {
			console.error(error);
			return res.status(HTTP_FORBIDDEN).json({ message: "Forbidden" });
		}

		if (!u) {
			console.error("User not found");
			return res.status(HTTP_FORBIDDEN).json({ message: "Forbidden" });
		}

		const login_token = await LoginToken.findOne({
			where: {
				access_token: token,
				user_id: u.user_id,
				refresh_token_expiry_at: {
					[Op.gt]: new Date(),
				},
			},
		});

		if (!login_token) {
			console.log("Token unavailable");
			return res
				.status(HTTP_FORBIDDEN)
				.json({ message: "Token unavailable" });
		}

		req.user = u;

		next();
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
