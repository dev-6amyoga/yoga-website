const express = require("express");
const router = express.Router();
const requestIp = require("request-ip");
const auth = require("../oauth");
const { User: UserSQL } = require("../models/sql/User");
const brypt = require("bcrypt");
const {
	HTTP_BAD_REQUEST,
	HTTP_OK,
	HTTP_INTERNAL_SERVER_ERROR,
	HTTP_SERVICE_UNAVAILABLE,
} = require("../utils/http_status_codes");
const { Institute } = require("../models/sql/Institute");
const { Role } = require("../models/sql/Role");
const { Op } = require("sequelize");
const { Plan } = require("../models/sql/Plan");
const { sequelize } = require("../init.sequelize");
const { timeout } = require("../utils/promise_timeout");
const { validate_email } = require("../utils/validate_email");
const { mailTransporter } = require("../init.nodemailer");

const {
	generateAccessToken,
	generateRefreshToken,
	verifyToken,
	TOKEN_TYPE_REFRESH,
	TOKEN_TYPE_ACCESS,
	authenticateToken,
} = require("../utils/jwt");
const { GetUserInfo } = require("../services/User.service");
const {
	UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");
const { LoginHistory } = require("../models/sql/LoginHistory");
const { LoginToken } = require("../models/sql/LoginToken");
const { UpdateUserPlanStatus } = require("../services/UserPlan.service");

router.use(requestIp.mw());

router.post("/verify-google", async (req, res) => {
	const { client_id, jwtToken } = req.body;
	try {
		let startTime = new Date();
		const userInfo = await auth.verify(client_id, jwtToken);

		console.log(
			"elapsed time to verify google token: ",
			new Date() - startTime
		);

		if (
			userInfo === null ||
			userInfo === undefined ||
			!userInfo.email_verified
		) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "Invalid Google OAuth token" });
		}

		startTime = new Date();
		const user = await GetUserInfo({ email: userInfo.email })[0];
		console.log("elapsed time to get user info: ", new Date() - startTime);

		if (!user) {
			console.log(userInfo);
			return res
				.status(HTTP_OK)
				.json({ message: "Token verified", ...userInfo });
		} else {
			console.log("there");
			return res.status(HTTP_OK).json({
				message: "User already exists; Please sign in",
				...userInfo,
			});
		}
	} catch (error) {
		console.error("Authentication error:", error.message);
		return res.status(401).json({ error: "Authentication failed" });
	}
});

router.post("/verify-tokens", async (req, res) => {
	const { access_token, refresh_token } = req.body;
	if (!access_token || !refresh_token) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });
	}

	// decode and verify refresh token as it expires much later	than access token
	let [decodedRefresh, errorRefresh] = verifyToken(refresh_token);
	if (!decodedRefresh || errorRefresh) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Refresh token expired" });
	}

	if (decodedRefresh.token_type !== TOKEN_TYPE_REFRESH) {
		return res.status(HTTP_BAD_REQUEST).json({ message: "Invalid token" });
	}

	let [decodedAccess, errorAccess] = verifyToken(access_token);

	if (!decodedAccess || errorAccess) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Access token expired" });
	}

	if (decodedAccess.token_type !== TOKEN_TYPE_ACCESS) {
		return res.status(HTTP_BAD_REQUEST).json({ message: "Invalid token" });
	}

	return res.status(HTTP_OK).json({ message: "Token verified" });
});

router.post("/login", async (req, res) => {
	const clientIp = req.clientIp;

	const { username, password } = req.body;
	if (!username || !password)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ message: "Missing required fields" });

	const t = await sequelize.transaction();

	try {
		let startTime = new Date();
		// check if user exists
		let [user, errorUser] = await GetUserInfo({ username }, [
			"user_id",
			"password",
		]);
		console.log("elapsed time to get user info: ", new Date() - startTime);

		// console.log(errorUser);

		if (!user || errorUser) {
			await t.rollback();
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "User does not exist" });
		}

		// check password
		startTime = new Date();
		const validPassword = await brypt.compare(password, user.password);
		console.log(
			"elapsed time to compare password: ",
			new Date() - startTime
		);

		if (!validPassword) {
			await t.rollback();
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "Invalid password" });
		}

		delete user.password;

		// update user plans
		const uipr = await UserInstitutePlanRole.findAll({
			where: {
				user_id: user.user_id,
			},
			transaction: t,
		});

		if (uipr.length === 0) {
			await t.rollback();
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "User not registered" });
		}

		startTime = new Date();
		for (let i = 0; i < uipr.length; i++) {
			const u = uipr[i];
			// console.log(
			// 	"Updating user plan status",
			// 	user.user_id,
			// 	u.get("institute_id")
			// );
			await UpdateUserPlanStatus(user.user_id, u.get("institute_id"), t);
		}

		console.log(
			"elapsed time to update plan status: ",
			new Date() - startTime
		);

		startTime = new Date();
		[user, errorUser] = await GetUserInfo({ username }, [
			"user_id",
			"username",
			"name",
			"email",
			"phone",
			"is_google_login",
			"last_login",
		]);

		console.log("elapsed time to  plan status: ", new Date() - startTime);

		if (errorUser) {
			await t.rollback();
			return res
				.status(HTTP_INTERNAL_SERVER_ERROR)
				.json({ error: errorUser });
		}

		// TODO: check if login history shows different IP

		startTime = new Date();
		// check if user has active login token
		const login_token_history = await LoginToken.findOne({
			where: {
				user_id: user?.user_id,
				refresh_token_expiry_at: {
					[Op.gt]: new Date(),
				},
				ip: clientIp,
			},
			transaction: t,
		});

		if (login_token_history) {
			await t.rollback();
			return res.status(HTTP_BAD_REQUEST).json({
				error: "Varying IP Address; One device login only",
			});
		}

		console.log(
			"elapsed time to get login token history: ",
			new Date() - startTime
		);

		// check if plans should be updated

		startTime = new Date();
		const [accessToken, access_token_creation_at, access_token_expiry_at] =
			generateAccessToken(user);
		const [
			refreshToken,
			refresh_token_creation_at,
			refresh_token_expiry_at,
		] = generateRefreshToken(user);

		console.log(
			"elapsed time to generate tokens: ",
			new Date() - startTime
		);

		// console.log(user);
		// const [_, userPlanUpdateError] = await UpdateUserPlanStatus(user.user_id);
		// TODO: delete all previous tokens of user from same ip?

		startTime = new Date();
		// add current token to login token table
		await LoginToken.create(
			{
				access_token: accessToken,
				refresh_token: refreshToken,
				access_token_creation_at,
				access_token_expiry_at,
				refresh_token_creation_at,
				refresh_token_expiry_at,
				ip: clientIp,
				user_id: user?.user_id,
			},
			{ transaction: t }
		);

		// add login history
		await LoginHistory.create(
			{
				user_id: user?.user_id,
				ip: clientIp || null,
				user_agent:
					req.get("User-Agent") || req?.useragent?.source || null,
				platform: req?.useragent?.platform,
				os: req?.useragent?.os,
				browser: req?.useragent?.browser,
			},
			{ transaction: t }
		);

		console.log(
			"elapsed time to create login token: ",
			new Date() - startTime
		);

		startTime = new Date();
		await t.commit();

		console.log(
			"elapsed time to commit transaction: ",
			new Date() - startTime
		);

		return res.status(HTTP_OK).json({ user, accessToken, refreshToken });
	} catch (err) {
		await t.rollback();
		console.log(err);
		return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			message: "internal server error",
		});
	}
});

router.post("/login-google", async (req, res) => {
	const { client_id, jwtToken } = req.body;
	const clientIp = req.clientIp;

	try {
		let startTime = new Date();
		const userInfo = await auth.verify(client_id, jwtToken);

		console.log(
			"elapsed time to verify google token: ",
			new Date() - startTime
		);

		if (
			userInfo === null ||
			userInfo === undefined ||
			!userInfo.email_verified
		) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "Invalid Google OAuth token" });
		}

		// get email and name
		const { email, name } = userInfo;
		if (!email || !name) {
			return res
				.status(HTTP_BAD_REQUEST)
				.json({ error: "Invalid Google OAuth token" });
		}

		const t = await sequelize.transaction();

		try {
			// check if user exists
			startTime = new Date();
			let [user, errorUser] = await GetUserInfo({ email }, [
				"user_id",
				"password",
			]);

			console.log(
				"elapsed time to get user info: ",
				new Date() - startTime
			);

			if (!user || errorUser) {
				await t.rollback();
				return res.status(HTTP_OK).json({
					user: { email: email, name: name },
					message: "User does not exist",
				});
			}

			startTime = new Date();
			// update user plans
			const uipr = await UserInstitutePlanRole.findAll({
				where: {
					user_id: user.user_id,
				},
				transaction: t,
			});

			console.log(
				"elapsed time to get user plans: ",
				new Date() - startTime
			);

			if (uipr.length === 0) {
				await t.rollback();
				return res
					.status(HTTP_BAD_REQUEST)
					.json({ error: "User not registered" });
			}

			startTime = new Date();
			for (let i = 0; i < uipr.length; i++) {
				const u = uipr[i];
				// console.log(
				// 	"Updating user plan status",
				// 	user.user_id,
				// 	u.get("institute_id")
				// );
				await UpdateUserPlanStatus(
					user.user_id,
					u.get("institute_id"),
					t
				);
			}

			console.log(
				"elapsed time to update user plans: ",
				new Date() - startTime
			);

			[user, errorUser] = await GetUserInfo({ email }, [
				"user_id",
				"username",
				"name",
				"email",
				"phone",
				"is_google_login",
				"last_login",
			]);

			// if (user.is_google_login === false) {
			// 	return res
			// 		.status(HTTP_BAD_REQUEST)
			// 		.json({ error: "User not registered using Google" });
			// }

			startTime = new Date();
			// check if user has active login token
			const login_token_history = await LoginToken.findOne({
				where: {
					user_id: user?.user_id,
					refresh_token_expiry_at: {
						[Op.gt]: new Date(),
					},
					ip: clientIp,
				},
				transaction: t,
			});

			if (login_token_history) {
				await t.rollback();
				return res.status(HTTP_BAD_REQUEST).json({
					error: "Varying IP Address; One device login only",
				});
			}

			console.log(
				"elapsed time to get login token history: ",
				new Date() - startTime
			);

			startTime = new Date();
			const [
				accessToken,
				access_token_creation_at,
				access_token_expiry_at,
			] = generateAccessToken(user);

			const [
				refreshToken,
				refresh_token_creation_at,
				refresh_token_expiry_at,
			] = generateRefreshToken(user);

			console.log(
				"elapsed time to generate tokens: ",
				new Date() - startTime
			);

			// TODO: delete all previous tokens of user from same ip?

			// add current token to login token table
			await LoginToken.create(
				{
					access_token: accessToken,
					refresh_token: refreshToken,
					access_token_creation_at,
					access_token_expiry_at,
					refresh_token_creation_at,
					refresh_token_expiry_at,
					ip: req.ip,
					user_id: user?.user_id,
				},
				{ transaction: t }
			);

			// add login history
			await LoginHistory.create(
				{
					user_id: user?.user_id,
					ip: req.ip || null,
					user_agent:
						req.get("User-Agent") || req?.useragent?.source || null,
					platform: req?.useragent?.platform,
					os: req?.useragent?.os,
					browser: req?.useragent?.browser,
				},
				{ transaction: t }
			);

			await t.commit();
			return res
				.status(HTTP_OK)
				.json({ user, accessToken, refreshToken });
		} catch (err) {
			await t.rollback();
			return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
				message: "internal server error",
			});
		}
	} catch (error) {
		console.error("Authentication error:", error.message);
		return res.status(401).json({ error: "Authentication failed" });
	}
});

router.post("/logout", authenticateToken, async (req, res) => {
	if (!req.user) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "No user logged in" });
	}

	const { user_id } = req.user;

	const t = await sequelize.transaction();

	try {
		await LoginToken.destroy({
			where: {
				user_id,
			},
			transaction: t,
			force: true,
		});

		await t.commit();

		return res.status(HTTP_OK).json({ message: "Logged out" });
	} catch (error) {
		console.error(error);
		await t.rollback();

		return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: error.message,
		});
	}
});

router.post("/refresh-token", async (req, res) => {
	const { refresh_token } = req.body;

	if (!refresh_token) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Missing required fields" });
	}

	const [decoded, error] = verifyToken(refresh_token);

	if (!decoded || error) {
		return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid token" });
	}

	if (decoded.token_type !== TOKEN_TYPE_REFRESH) {
		return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid token" });
	}

	const user = decoded.user;

	const t = await sequelize.transaction();

	try {
		// get previous access token
		const prev_login_token = await LoginToken.findOne({
			where: {
				user_id: user.user_id,
				refresh_token: refresh_token,
				refresh_token_expiry_at: {
					[Op.gt]: new Date(),
				},
			},
			transaction: t,
		});

		const [accessToken, access_token_creation_at, access_token_expiry_at] =
			generateAccessToken(user);

		// update access token in login token
		prev_login_token.access_token = accessToken;
		prev_login_token.access_token_creation_at = access_token_creation_at;
		prev_login_token.access_token_expiry_at = access_token_expiry_at;
		await prev_login_token.save({ transaction: t });
		await t.commit();
		return res.status(HTTP_OK).json({ accessToken });
	} catch (error) {
		console.error(error);
		await t.rollback();

		return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
			error: error.message,
		});
	}
});

router.post("/register", async (req, res) => {
	const {
		username,
		password,
		confirm_password,
		email_id,
		phone_no,
		name,
		institute_name,
		role_name,
		is_google_login,
	} = req.body;
	// validate inputs
	if (
		!username ||
		!password ||
		!email_id ||
		!phone_no ||
		!name ||
		!role_name ||
		is_google_login === undefined ||
		is_google_login === null
	)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Missing required fields" });

	if (!validate_email(email_id)) {
		return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid email" });
	}

	// check password
	if (password !== confirm_password)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Passwords do not match" });

	if (password.length < 4) {
		return res.status(HTTP_BAD_REQUEST).json({
			error: "Password must be at least 4 characters long",
		});
	}

	// check if user exists
	const user = await UserSQL.findOne({
		where: {
			[Op.or]: [
				{ username: username },
				{ email: email_id },
				{ phone: phone_no },
			],
		},
		attributes: ["user_id", "name", "username", "email", "phone"],
	});

	if (user && user.username === username)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Username already exists" });

	if (user && user.email === email_id)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Email already exists" });

	if (user && user.phone === phone_no)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Phone No. already exists" });

	// hash password
	const salt = await brypt.genSalt(10);
	const hashedPassword = await brypt.hash(password, salt);

	// db transaction
	const t = await sequelize.transaction();
	try {
		// find insitite by name
		let institute = null;
		if (
			institute_name !== null &&
			institute_name !== undefined &&
			institute_name !== "" &&
			institute_name.length > 0
		) {
			institute = await Institute.findOne(
				{
					where: { name: institute_name },
					attributes: ["institute_id"],
				},
				{ transaction: t }
			);

			if (institute === null) throw new Error("Institute doesn't exist");
		}

		// find role by name
		const role = await Role.findOne(
			{
				where: { name: role_name },
				attributes: ["role_id"],
			},
			{ transaction: t }
		);

		if (!role) throw new Error("Role doesn't exist");

		// create user
		const newUser = await UserSQL.create(
			{
				username,
				password: hashedPassword,
				name,
				email: email_id,
				phone: phone_no,
				is_google_login,
			},
			{ transaction: t }
		);

		// create user_institute
		const user_institute_plan_role = await UserInstitutePlanRole.create(
			{
				user_id: newUser.user_id,
				institute_id: institute ? institute.institute_id : null,
				role_id: role.role_id,
				user_plan_id: null,
			},
			{ transaction: t }
		);

		// await timeout(t.commit(), 5000, new Error("timeout; try again"));

		t.commit();

		mailTransporter.sendMail(
			{
				from: "dev.6amyoga@gmail.com",
				to: email_id,
				subject: "6AM Yoga | Successful Registration",
				html: `
          <p>Greetings,</p>
          <p>Your registration at ai.6amyoga.com was successful. These are the details we received : </p>
          
          <p>Name : ${name}</p>
          <p>Email ID : ${email_id}.</p>
          <p>Phone Number : ${phone_no}.</p>
          <p>Username : ${username}.</p>


          <p>Regards, </p>
          <p>My Yoga Teacher, 6AM Yoga </p>
        `,
			},
			async (err, info) => {
				if (err) {
					console.error(err);
					res.status(HTTP_INTERNAL_SERVER_ERROR).json({
						message: "Internal server error; try again",
					});
				} else {
					// console.log("Registration mail sent to admin!");
					mailTransporter.sendMail(
						{
							from: "dev.6amyoga@gmail.com",
							to: "dev.6amyoga@gmail.com",
							subject: "6AM Yoga | New User Registration",
							html: `
                <p>Greetings,</p>
                <p>You received a new registration on ai.6amyoga.com ! Congratulations :) The users' details are as follows : </p>
                
                <p>Name : ${name}</p>
                <p>Email ID : ${email_id}.</p>
                <p>Phone Number : ${phone_no}.</p>

                <p>Regards, </p>
                <p>My Yoga Teacher, 6AM Yoga </p>
              `,
						},
						async (err, info) => {
							if (err) {
								console.error(err);
								res.status(HTTP_INTERNAL_SERVER_ERROR).json({
									message: "Internal server error; try again",
								});
							} else {
								res.status(HTTP_OK).json({
									message: "Registration mail sent to admin!",
									user: newUser,
								});
							}
						}
					);
				}
			}
		);

		// return res.status(HTTP_OK).json({ user: newUser });
	} catch (error) {
		console.error(error);
		await t.rollback();

		switch (error.message) {
			case "Institute doesn't exist":
			case "Role doesn't exist":
				return res
					.status(HTTP_BAD_REQUEST)
					.json({ error: error.message });
			default:
				return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
					error: error.message,
				});
		}
	}
});

router.post("/register-google", async (req, res) => {
	// used to register user whos logging in using google oauth
	const {
		email_id,
		name,
		is_google_login,
		client_id,
		jwt_token,
		username,
		password,
		role_name,
		confirm_password,
		phone_no,
	} = req.body;
	// const {access_token} = req.headers.authorization?.split(" ") ?? null

	// validate inputs
	if (
		!email_id ||
		!name ||
		!client_id ||
		!username ||
		!password ||
		!confirm_password ||
		!phone_no ||
		!role_name ||
		is_google_login === undefined ||
		is_google_login === null
	)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Missing required fields" });

	const userInfo = await auth.verify(client_id, jwt_token);

	if (!userInfo) {
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Invalid Google OAuth token" });
	}

	if (userInfo.email !== email_id) {
		return res.status(HTTP_BAD_REQUEST).json({
			error: "unmatched email",
		});
	}

	if (!validate_email(email_id)) {
		return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid email" });
	}

	if (!is_google_login) {
		return res.status(HTTP_BAD_REQUEST).json({
			error: "user not registered using Google OAuth",
		});
	}

	const salt = await brypt.genSalt(10);
	const hashedPassword = await brypt.hash(password, salt);

	// check if user exists
	const user = await UserSQL.findOne({
		where: {
			email: email_id,
		},
		attributes: ["user_id", "name", "username", "email"],
	});
	if (user && user.email === email_id)
		return res
			.status(HTTP_BAD_REQUEST)
			.json({ error: "Email already exists" });

	// db transaction
	const t = await sequelize.transaction();

	try {
		// create user
		const newUser = await UserSQL.create(
			{
				name,
				username,
				password: hashedPassword,
				email: email_id,
				phone: phone_no,
				is_google_login,
			},
			{ transaction: t }
		);

		const user_institute_plan_role = await UserInstitutePlanRole.create(
			{
				user_id: newUser.user_id,
				institute_id: null,
				role_id: role_name === "STUDENT" ? 5 : 2,
				plan_id: null,
			},
			{ transaction: t }
		);

		await timeout(t.commit(), 5000, new Error("timeout; try again"));

		res.status(HTTP_OK).json({ user: newUser });
	} catch (error) {
		console.error(error);
		await t.rollback();

		switch (error.message) {
			default:
				return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
					error: error.message,
				});
		}
	}
});

module.exports = router;
