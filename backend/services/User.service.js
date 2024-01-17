const { User } = require("../models/sql/User");
const { Plan } = require("../models/sql/Plan");
const { Institute } = require("../models/sql/Institute");
const { Role } = require("../models/sql/Role");
const { UserPlan } = require("../models/sql/UserPlan");
const { UserRole } = require("../models/sql/UserRole");
const { UserInstitute } = require("../models/sql/UserInstitute");

const GetUser = async (filter, attributes) => {
	// returns user

	let user = null,
		error = null;

	try {
		let q = {
			where: filter,
		};

		if (attributes) {
			q.attributes = attributes;
		}

		user = await User.findOne(q);

		if (!user) {
			error = "User does not exist";
			return [null, error];
		}

		return [user, error];
	} catch (err) {
		return [null, err];
	}
};

const GetUserInfo = async (filter, attributes = null) => {
	// returns user with roles
	/*
 Returns
 {
  user_id, name, username, email, phone,
  roles: [
   {user_id, role_id, role: {name}}
  ],
		plan: {
			user_id, 
			plan_id, 
			plan: {
				plan_id, 
				name, 
				description, 
				has_basic_playlist, 
				has_playlist_creation,
			 playlist_creation_limit,
				has_self_audio_upload,
   	number_of_teachers,
    plan_validity,
    plan_user_type,
			}
		},
		institutes: [
			 {user_id, institute_id, institute: {name}}
		]
 }
 */
	let user = null,
		error = null;
	try {
		[user, errorUser] = await GetUser(filter, attributes);

		if (!user || errorUser) {
			error = "User does not exist";
			return [null, error];
		}

		// get all roles
		const roles = await UserRole.findAll({
			where: {
				user_id: user.user_id,
			},
			order: [["role_id", "ASC"]],
			attributes: ["user_id", "role_id"],
			include: [
				{
					model: Role,
					attributes: ["name"],
				},
			],
		});

		if (!roles) {
			error = "Role does not exist";
			return [null, error];
		}

		// get plan
		const user_plan = await UserPlan.findOne({
			where: {
				user_id: user.user_id,
			},
			attributes: ["user_id", "plan_id"],
			include: [
				{
					model: Plan,
				},
			],
		});

		// get institutes
		const institutes = await UserInstitute.findAll({
			where: {
				user_id: user.user_id,
			},
			attributes: ["user_id", "institute_id"],
			include: [
				{
					model: Institute,
					attributes: ["name"],
					required: true,
				},
			],
		});

		let userInfo = {
			...user.toJSON(),
			roles: roles.map((r) => r.toJSON()),
			plan: user_plan ? user_plan.toJSON()?.plan : null,
			institutes:
				institutes && institutes.length > 0
					? institutes.map((i) => i.toJSON())
					: null,
		};

		return [userInfo, error];
	} catch (err) {
		return [null, err];
	}
};

module.exports = {
	GetUser,
	GetUserInfo,
};
