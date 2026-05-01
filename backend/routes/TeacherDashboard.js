const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../utils/jwt')
const verifyTeacherRole = require('../middleware/verifyTeacherRole')

// Import sub-routers
const classManagementRoutes = require('./TeacherDashboard/ClassManagement')
const memberManagementRoutes = require('./TeacherDashboard/MemberManagement')
const videoPlayerRoutes = require('./TeacherDashboard/VideoPlayer')
const transactionRoutes = require('./TeacherDashboard/Transactions')
const dashboardRoutes = require('./TeacherDashboard/Dashboard')

// Apply authentication and role verification middleware
router.use(authenticateToken)
router.use(verifyTeacherRole)

/**
 * Class Management Routes
 * GET    /api/teacher/classes                         - Get all classes
 * POST   /api/teacher/classes                         - Create new class
 * GET    /api/teacher/classes/:classId                - Get class details
 * POST   /api/teacher/classes/:classId/join           - Join class
 * POST   /api/teacher/classes/:classId/attendance/log - Log attendance
 * GET    /api/teacher/classes/:classId/attendance/logs- Get attendance logs
 * GET    /api/teacher/classes/:classId/members       - Get class members
 */
router.use('/classes', classManagementRoutes)

/**
 * Member Management Routes
 * GET    /api/teacher/students                        - Get all students
 * GET    /api/teacher/students/:studentId             - Get student details
 * PUT    /api/teacher/students/:studentId             - Update student
 * DELETE /api/teacher/students/:studentId             - Remove student
 * GET    /api/teacher/user-plan-mappings              - Get user plan mappings
 */
router.use('/students', memberManagementRoutes)
// Special route for user plan mappings
router.get(
  '/user-plan-mappings',
  memberManagementRoutes.stack.find(
    (layer) => layer.route && layer.route.path === '/user-plan-mappings'
  )?.handle
)

/**
 * Video Player Routes
 * GET    /api/teacher/playlists                       - Get playlists
 * POST   /api/teacher/playlists                       - Create playlist
 * GET    /api/teacher/playlists/:playlistId/videos    - Get playlist videos
 * POST   /api/teacher/video-watch-history             - Log watch history
 */
router.use('/playlists', videoPlayerRoutes)
router.post(
  '/video-watch-history',
  videoPlayerRoutes.stack.find(
    (layer) => layer.route && layer.route.path === '/watch-history'
  )?.handle
)

/**
 * Transaction Routes
 * GET    /api/teacher/transactions                    - Get transactions
 * GET    /api/teacher/transactions/:transactionId     - Get transaction details
 * GET    /api/teacher/transactions/export/csv         - Export as CSV
 */
router.use('/transactions', transactionRoutes)

/**
 * Dashboard Routes
 * GET    /api/teacher/dashboard/stats                 - Get dashboard stats
 * GET    /api/teacher/dashboard/summary               - Get dashboard summary
 */
router.use('/dashboard', dashboardRoutes)

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Teacher Dashboard API is healthy',
    user: req.user?.name || 'Unknown',
  })
})

module.exports = router
