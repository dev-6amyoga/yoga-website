const { sequelize } = require("./init.sequelize");
const { Institute } = require("./models/sql/Institute");
const { Permission } = require("./models/sql/Permission");
const { Plan } = require("./models/sql/Plan");
const { Role } = require("./models/sql/Role");
const { User } = require("./models/sql/User");
const { PlanPricing } = require("./models/sql/PlanPricing");
const { Currency } = require("./models/sql/Currency");
const { UserInstitutePlanRole } = require("./models/sql/UserInstitutePlanRole");
const { RolePermission } = require("./models/sql/RolePermission");

const institutes = [
	{
		name: "Institute 1",
		address1: "#192, 1st Main, 2nd Cross, 5th Phase",
		address2: "JP Nagar, Bangalore",
		email: "institute1@gmail.com",
		phone: "1234567890",
		billing_address: "JP Nagar, Bangalore",
	},
	{
		name: "Institute 2",
		address1: "#3838, 1st Main, 2nd Cross, 5th Phase",
		address2: "Sarjapur, Bangalore",
		email: "institute2@gmail.com",
		phone: "1234567890",
		billing_address: "Sarjapur, Bangalore",
	},
];

const roles = [
	{
		name: "ROOT",
	},
	{
		name: "INSTITUTE_OWNER",
	},
	{
		name: "INSTIUTE_ADMIN",
	},
	{
		name: "TEACHER",
	},
	{
		name: "STUDENT",
	},
];

const users = [
	{
		username: "root",
		name: "Root",
		email: "root@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "ins1_owner",
		name: "ins1_owner",
		email: "ins1_owner@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "ins1_admin",
		name: "ins1_admin",
		email: "ins1_admin@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "ins1_teacher",
		name: "ins1_teacher",
		email: "ins1_teacher@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "ins2_owner",
		name: "ins2_owner",
		email: "ins2_owner@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "ins2_admin",
		name: "ins2_admin",
		email: "ins2_admin@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "ins2_teacher",
		name: "ins2_teacher",
		email: "ins2_teacher@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "student1",
		name: "student1",
		email: "student1@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
	{
		username: "student2",
		name: "student2",
		email: "student2@gmail.com",
		password:
			"$2b$10$vqa/9ysYiCwL4F6KOEe1k.LM//L/7OH9r8x6QMWgo58xAoz/XxJd6",
		is_google_login: false,
		last_login: null,
	},
];

const user_institute_plan_role = [
	{ user_id: 1, role_id: 1, user_plan_id: null, institute_id: null },
	{ user_id: 1, role_id: 4, user_plan_id: null, institute_id: null },
	{ user_id: 1, role_id: 5, user_plan_id: null, institute_id: null },
	{ user_id: 2, role_id: 2, user_plan_id: null, institute_id: 1 },
	{ user_id: 3, role_id: 3, user_plan_id: null, institute_id: 1 },
	{ user_id: 4, role_id: 4, user_plan_id: null, institute_id: 1 },
	{ user_id: 5, role_id: 2, user_plan_id: null, institute_id: 2 },
	{ user_id: 6, role_id: 3, user_plan_id: null, institute_id: 2 },
	{ user_id: 7, role_id: 4, user_plan_id: null, institute_id: 2 },
	{ user_id: 8, role_id: 5, user_plan_id: null, institute_id: null },
	{ user_id: 9, role_id: 5, user_plan_id: null, institute_id: null },
];

// const user_institute = [
//   { user_id: 1, institute_id: null },
//   { user_id: 2, institute_id: 1 },
//   { user_id: 3, institute_id: 1 },
//   { user_id: 4, institute_id: 1 },
//   { user_id: 5, institute_id: 2 },
//   { user_id: 6, institute_id: 2 },
//   { user_id: 7, institute_id: 2 },
//   { user_id: 8, institute_id: 1 },
//   { user_id: 9, institute_id: 2 },
// ];

const permissions = [
	{ name: "USER_CREATE" },
	{ name: "USER_READ" },
	{ name: "USER_UPDATE" },
	{ name: "USER_DELETE" },
];

// role 1: ROOT
// role 2: INSTITUTE_OWNER
const roles_perms = [
	{ role_id: 1, permission_id: 1 },
	{ role_id: 1, permission_id: 2 },
	{ role_id: 1, permission_id: 3 },
	{ role_id: 1, permission_id: 4 },
];

const plans = [
	{
		name: "Basic Plan",
		description: "Uses 6AM playlist",
		watch_time_limit: 50 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: false,
		playlist_creation_limit: 0,
		has_self_audio_upload: false,
		number_of_teachers: 0,
		plan_validity_days: 30,
		plan_user_type: "STUDENT",
	},
	{
		name: "Family Plan",
		description: "Can Create new playlist	",
		watch_time_limit: 100 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: false,
		number_of_teachers: 0,
		plan_validity_days: 30,
		plan_user_type: "STUDENT",
	},
	{
		name: "Solo Plan",
		description: "1 teacher + Uses 6AM playlist +  Can Create new playlist",
		watch_time_limit: 200 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: false,
		number_of_teachers: 1,
		plan_validity_days: 30,
		plan_user_type: "INSTITUTE",
	},
	{
		name: "Small Plan",
		description:
			"5 teachers  + Uses 6AM playlist +  Can Create new playlist	",
		watch_time_limit: 1000 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: true,
		number_of_teachers: 5,
		plan_validity_days: 30,
		plan_user_type: "INSTITUTE",
	},
	{
		name: "Medium Plan",
		description:
			"10 teachers + Uses 6AM playlist +  Can Create new playlist	",
		watch_time_limit: 2000 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: true,
		number_of_teachers: 10,
		plan_validity_days: 30,
		plan_user_type: "INSTITUTE",
	},
	{
		name: "Basic Plan",
		description: "Uses 6AM playlist",
		watch_time_limit: 50 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: false,
		playlist_creation_limit: 0,
		has_self_audio_upload: false,
		number_of_teachers: 0,
		plan_validity_days: 90,
		plan_user_type: "STUDENT",
	},
	{
		name: "Family Plan",
		description: "Can Create new playlist	",
		watch_time_limit: 100 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: false,
		number_of_teachers: 0,
		plan_validity_days: 90,
		plan_user_type: "STUDENT",
	},
	{
		name: "Solo Plan",
		description: "1 teacher + Uses 6AM playlist +  Can Create new playlist",
		watch_time_limit: 200 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: false,
		number_of_teachers: 1,
		plan_validity_days: 90,
		plan_user_type: "INSTITUTE",
	},
	{
		name: "Small Plan",
		description:
			"5 teachers  + Uses 6AM playlist +  Can Create new playlist	",
		watch_time_limit: 1000 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: true,
		number_of_teachers: 5,
		plan_validity_days: 90,
		plan_user_type: "INSTITUTE",
	},
	{
		name: "Medium Plan",
		description:
			"10 teachers + Uses 6AM playlist +  Can Create new playlist	",
		watch_time_limit: 2000 * (60 * 60),
		has_basic_playlist: true,
		has_playlist_creation: true,
		playlist_creation_limit: 1000,
		has_self_audio_upload: true,
		number_of_teachers: 10,
		plan_validity_days: 90,
		plan_user_type: "INSTITUTE",
	},
];

const currency = [
	{ name: "Indian Rupee", short_tag: "INR" },
	{ name: "United States Dollar", short_tag: "USD" },
	{ name: "Euro", short_tag: "EUR" },
];

const plan_pricing = [
	// monthly
	// INR
	{ plan_id: 1, currency_id: 1, denomination: 1999 },
	{ plan_id: 2, currency_id: 1, denomination: 2999 },
	{ plan_id: 3, currency_id: 1, denomination: 4999 },
	{ plan_id: 4, currency_id: 1, denomination: 14999 },
	{ plan_id: 5, currency_id: 1, denomination: 24999 },
	// USD
	{ plan_id: 1, currency_id: 2, denomination: 35 },
	{ plan_id: 2, currency_id: 2, denomination: 55 },
	{ plan_id: 3, currency_id: 2, denomination: 90 },
	{ plan_id: 4, currency_id: 2, denomination: 270 },
	{ plan_id: 5, currency_id: 2, denomination: 450 },
	// EUR
	{ plan_id: 1, currency_id: 3, denomination: 35 },
	{ plan_id: 2, currency_id: 3, denomination: 55 },
	{ plan_id: 3, currency_id: 3, denomination: 90 },
	{ plan_id: 4, currency_id: 3, denomination: 270 },
	{ plan_id: 5, currency_id: 3, denomination: 450 },

	// quarterly
	// INR
	{ plan_id: 6, currency_id: 1, denomination: 4999 },
	{ plan_id: 7, currency_id: 1, denomination: 6999 },
	{ plan_id: 8, currency_id: 1, denomination: 12499 },
	{ plan_id: 9, currency_id: 1, denomination: 34999 },
	{ plan_id: 10, currency_id: 1, denomination: 64999 },
	// USD
	{ plan_id: 6, currency_id: 2, denomination: 90 },
	{ plan_id: 7, currency_id: 2, denomination: 125 },
	{ plan_id: 8, currency_id: 2, denomination: 225 },
	{ plan_id: 9, currency_id: 2, denomination: 700 },
	{ plan_id: 10, currency_id: 2, denomination: 1150 },
	// EUR
	{ plan_id: 6, currency_id: 3, denomination: 90 },
	{ plan_id: 7, currency_id: 3, denomination: 125 },
	{ plan_id: 8, currency_id: 3, denomination: 225 },
	{ plan_id: 9, currency_id: 3, denomination: 700 },
	{ plan_id: 10, currency_id: 3, denomination: 1150 },
];

const bulkCreateSampleData = async () => {
	const t = await sequelize.transaction();
	// INSTITUTE
	try {
		const ri = await Institute.bulkCreate(institutes, { transaction: t });
		console.log(
			`Institutes sample data inserted : ${institutes.length}/${ri.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// ROLE
	try {
		const rr = await Role.bulkCreate(roles, { transaction: t });
		console.log(
			`Roles sample data inserted : ${roles.length}/${rr.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// USER
	try {
		const ru = await User.bulkCreate(users, { transaction: t });
		console.log(
			`Users sample data inserted : ${users.length}/${ru.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// USER_INSTITUTE
	// try {
	//   const rui = await UserInstitute.bulkCreate(user_institute, {
	//     transaction: t,
	//   });
	//   console.log(
	//     `UserInstitute sample data inserted : ${user_institute.length}/${rui.length}`
	//   );
	// } catch (err) {
	//   await t.rollback();
	//   throw err;
	// }

	// USER_ROLE
	try {
		const rur = await UserInstitutePlanRole.bulkCreate(
			user_institute_plan_role,
			{
				transaction: t,
			}
		);
		console.log(
			`UserInstitutePlanRole sample data inserted : ${user_institute_plan_role.length}/${rur.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// PERMISSION
	try {
		const rp = await Permission.bulkCreate(permissions, { transaction: t });
		console.log(
			`Permissions sample data inserted : ${permissions.length}/${rp.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// ROLE_PERMSSION
	try {
		const rrp = await RolePermission.bulkCreate(roles_perms, {
			transaction: t,
		});
		console.log(
			`RolePermission sample data inserted : ${permissions.length}/${rrp.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// PLAN
	try {
		const rpl = await Plan.bulkCreate(plans, { transaction: t });
		console.log(
			`Plans sample data inserted : ${plans.length}/${rpl.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// CURRENCY
	try {
		const rc = await Currency.bulkCreate(currency, { transaction: t });
		console.log(
			`Currency sample data inserted : ${currency.length}/${rc.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	// PLAN PRICING
	try {
		const rpp = await PlanPricing.bulkCreate(plan_pricing, {
			transaction: t,
		});
		console.log(
			`Plan pricing sample data inserted : ${plan_pricing.length}/${rpp.length}`
		);
	} catch (err) {
		await t.rollback();
		throw err;
	}

	await t.commit();
};

module.exports = { bulkCreateSampleData };
