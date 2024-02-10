const { Op } = require("sequelize");
const { RolePermission } = require("../models/sql/RolePermission");
const {
	UserInstitutePlanRole,
} = require("../models/sql/UserInstitutePlanRole");
const { HTTP_FORBIDDEN, HTTP_UNAUTHORIZED } = require("./http_status_codes");
const { Permission } = require("../models/sql/Permission");

async function hasPermission(req, res, next, ...requiredPerms) {
	let perm = false;

	console.log(req.user);
	// get roles
	const uipr = await UserInstitutePlanRole.findAll({
		where: { user_id: req.user?.user_id },
	});

	let uiprJson = uipr.map((r) => r.toJSON());

	// get permissions list
	const role_perms = await RolePermission.findAll({
		where: {
			role_id: {
				[Op.in]: uiprJson.map((r) => r.role_id),
			},
		},
		attributes: ["role_id", "permission_id"],
		include: [
			{
				model: Permission,
				attributes: ["name"],
			},
		],
	});

	// check perms
	const perms = role_perms.map((rp) => rp.toJSON());
	// console.log(perms);

	// if root skip everything
	let checkPerms = perms.findIndex((pp) => pp.role_id === 1) === -1;
	console.log({ checkPerms });

	if (checkPerms) {
		// check if user has perms
		for (let p = 0; p < requiredPerms.length; p++) {
			if (
				perms.findIndex(
					(pp) => pp.permission.name === requiredPerms[p]
				) > -1
			) {
				console.log(requiredPerms[p]);
				perm = true;
			} else {
				console.log(requiredPerms[p]);
				perm = false;
				break;
			}
		}
	} else {
		perm = true;
	}

	/*
 if theres user_id / institute_id check if user owns it
 - req.user has user_id
 - req.body.user_id ?
 - req.body.institute_id ?
 
 - 
 */

	if (perm) {
		next();
	} else {
		return res
			.status(HTTP_UNAUTHORIZED)
			.json({ message: "Unauthorized access" });
	}
}

module.exports = { hasPermission };
