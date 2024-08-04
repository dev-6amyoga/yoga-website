const { User } = require('../models/sql/User')
const { Plan } = require('../models/sql/Plan')
const { Institute } = require('../models/sql/Institute')
const { Role } = require('../models/sql/Role')

const { UserInstitutePlanRole } = require('../models/sql/UserInstitutePlanRole')
const { UserPlan } = require('../models/sql/UserPlan')

const GetUser = async (filter, attributes) => {
  // returns user

  let user = null,
    error = null

  try {
    let q = {
      where: filter,
    }

    if (attributes) {
      q.attributes = attributes
    }

    user = await User.findOne(q)

    if (!user) {
      error = 'User does not exist'
      return [null, error]
    }
    return [user, error]
  } catch (err) {
    return [null, err]
  }
}

/*
 Returns
		{
				user_id: 1,
				username: "",
				name: "",
				email: "",
				phone: "",

				roles: {
					"INSTITUTE_OWNER": [
						{
							user_institute_plan_role_id,
							institute: {
									insitute_id,
									name
							}, 
							plan: {
								plan_id,
								name,
								etc
							},
						}
					]
				}
		}
		@param filter: {}
		@param attributes: []
 */
const GetUserInfo = async (filter, attributes = null) => {
  // returns user with roles

  let user = null,
    error = null
  try {
    ;[user, errorUser] = await GetUser(filter, attributes)
    console.log(user, 'retrieved!')

    if (!user || errorUser) {
      error = 'User does not exist'
      console.log(error)
      return [null, error]
    }

    let userInstitutePlanRoles = await UserInstitutePlanRole.findAll({
      where: {
        user_id: user.user_id,
      },
      attributes: [
        'user_institute_plan_role_id',
        'user_id',
        'role_id',
        'institute_id',
        'user_plan_id',
        'updated',
      ],
      include: [
        { model: Institute, attributes: ['institute_id', 'name'] },
        {
          model: UserPlan,
          attributes: ['user_plan_id', 'plan_id'],
          include: [
            {
              model: Plan,
              attributes: [
                'plan_id',
                'name',
                'has_basic_playlist',
                'has_playlist_creation',
                'playlist_creation_limit',
                'has_self_audio_upload',
                'number_of_teachers',
                'plan_validity_days',
                'watch_time_limit',
              ],
            },
          ],
        },
        { model: Role, attributes: ['role_id', 'name'] },
      ],
    })

    userInstitutePlanRoles = userInstitutePlanRoles.map((uipr) => {
      const uiprJson = uipr.toJSON()
      const p = uiprJson?.user_plan?.plan ?? null
      delete uiprJson.user_plan
      return {
        ...uiprJson,
        plan: p,
      }
    })

    let roles = {}

    userInstitutePlanRoles.forEach((uipr) => {
      // const {role, institute, plan} = uipr;
      if (!roles[uipr.role.name]) {
        roles[uipr.role.name] = []
      }

      roles[uipr.role.name].push(uipr)
    })

    let userInfo = {
      ...user.toJSON(),
      roles,
    }

    return [userInfo, error]
  } catch (err) {
    return [null, err]
  }
}

module.exports = {
  GetUser,
  GetUserInfo,
}
