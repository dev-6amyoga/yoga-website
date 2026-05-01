const { Role } = require('../models/sql/Role')
const { UserInstitutePlanRole } = require('../models/sql/UserInstitutePlanRole')
const { ROLE_TEACHER } = require('../enums/role')

/**
 * Middleware to verify that the user has TEACHER role
 * Assumes authenticateToken middleware has already verified the user
 */
const verifyTeacherRole = async (req, res, next) => {
  try {
    const userId = req.user?.user_id
    const instituteId = req.user?.currentInstituteId

    if (!userId || !instituteId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized - User not authenticated',
        code: 'UNAUTHORIZED',
      })
    }

    // Get user's role for this institute
    const userRole = await UserInstitutePlanRole.findOne({
      where: {
        user_id: userId,
        institute_id: instituteId,
      },
      include: [{ model: Role, attributes: ['name'] }],
    })

    if (!userRole) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden - No role assignment found',
        code: 'FORBIDDEN',
      })
    }

    if (userRole.role.name !== ROLE_TEACHER) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden - Only teachers can access this resource',
        code: 'FORBIDDEN',
      })
    }

    // Attach role info to request for later use
    req.userRole = userRole.role.name
    req.userInstituteRole = userRole

    next()
  } catch (error) {
    console.error('Error in verifyTeacherRole middleware:', error)
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'SERVER_ERROR',
    })
  }
}

module.exports = verifyTeacherRole
