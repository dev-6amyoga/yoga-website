# Teacher Dashboard Backend Implementation Guide

This guide provides step-by-step instructions for implementing the backend API endpoints for the Teacher Dashboard system.

## Quick Start

### 1. Create Teacher Routes File

Create: `backend/routes/TeacherDashboard.js`

```javascript
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../utils/jwt");
const { ROLE_TEACHER } = require("../enums/role");
const { verifyUserRole } = require("../middleware/verifyUserRole");

// Middleware to verify teacher role
router.use(authenticateToken);
router.use(verifyUserRole([ROLE_TEACHER]));

// Import sub-routers
const classManagementRoutes = require("./TeacherDashboard/ClassManagement");
const memberManagementRoutes = require("./TeacherDashboard/MemberManagement");
const videoPlayerRoutes = require("./TeacherDashboard/VideoPlayer");
const transactionRoutes = require("./TeacherDashboard/Transactions");
const dashboardRoutes = require("./TeacherDashboard/Dashboard");

// Mount sub-routers
router.use("/classes", classManagementRoutes);
router.use("/students", memberManagementRoutes);
router.use("/playlists", videoPlayerRoutes);
router.use("/transactions", transactionRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/user-plan-mappings", memberManagementRoutes);

module.exports = router;
```

### 2. Register Routes in Main Server

In `backend/server.js`:

```javascript
const TeacherDashboardRoutes = require("./routes/TeacherDashboard");

// Add to Express app
app.use("/api/teacher", TeacherDashboardRoutes);
```

### 3. Create Middleware for Role Verification

Create: `backend/middleware/verifyUserRole.js`

```javascript
const { Role } = require("../models/sql/Role");

const verifyUserRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.user_id;
      const instituteId = req.user?.currentInstituteId;

      if (!userId || !instituteId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get user's role for this institute
      const {
        UserInstitutePlanRole,
      } = require("../models/sql/UserInstitutePlanRole");
      const userRole = await UserInstitutePlanRole.findOne({
        where: {
          user_id: userId,
          institute_id: instituteId,
        },
        include: [{ model: Role, attributes: ["name"] }],
      });

      if (!userRole || !allowedRoles.includes(userRole.role.name)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      req.userRole = userRole.role.name;
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = verifyUserRole;
```

---

## Implementation Guide by Feature

### Feature 1: Class Management

Create: `backend/routes/TeacherDashboard/ClassManagement.js`

```javascript
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../../init.sequelize");
const Class = require("../../models/mongo/Class");
const { ClassAttendance } = require("../../models/sql/ClassAttendance");
const { User } = require("../../models/sql/User");
const { ZoomClassModel } = require("../../models/sql/ZoomClassModel");

/**
 * GET /api/teacher/classes
 * Get all classes for the logged-in teacher
 */
router.get("/", async (req, res) => {
  try {
    const teacherId = req.user.user_id;

    // Get classes from MongoDB
    const classes = await Class.find({ teacher_id: teacherId }).sort({
      createdAt: -1,
    });

    res.json({
      status: "success",
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * POST /api/teacher/classes
 * Create a new class
 */
router.post("/", async (req, res) => {
  try {
    const teacherId = req.user.user_id;
    const {
      name,
      description,
      schedule,
      type,
      recurringDays,
      startTime,
      endTime,
      maxStudents,
    } = req.body;

    // Validate required fields
    if (!name || !description || !type) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    const newClass = new Class({
      class_name: name,
      class_desc: description,
      teacher_id: teacherId,
      class_type: type,
      schedule: schedule,
      recurrance_days: recurringDays || [],
      recurring_class_start_time: startTime,
      recurring_class_end_time: endTime,
      max_students: maxStudents || 30,
    });

    const savedClass = await newClass.save();

    res.status(201).json({
      status: "success",
      data: savedClass,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * POST /api/teacher/classes/:classId/join
 * Join a class (for teacher)
 */
router.post("/:classId/join", async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.user_id;

    // Implementation depends on your Class model structure
    // Add logic to track teacher joining class for streaming

    res.json({
      status: "success",
      message: "Joined class successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * POST /api/teacher/classes/:classId/attendance/log
 * Log attendance for a class
 */
router.post("/:classId/attendance/log", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { classId } = req.params;
    const { studentIds, status, timestamp } = req.body;
    const teacherId = req.user.user_id;

    if (!studentIds || !status) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    const attendanceRecords = [];

    for (const studentId of studentIds) {
      const record = await ClassAttendance.create(
        {
          class_id: classId,
          user_id: studentId,
          instructor_id: teacherId,
          attendance_status: status,
          marked_by: "INSTRUCTOR",
          marked_at: timestamp || new Date(),
        },
        { transaction },
      );
      attendanceRecords.push(record);
    }

    await transaction.commit();

    res.json({
      status: "success",
      data: {
        attendanceRecords,
        message: `Attendance logged for ${studentIds.length} students`,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /api/teacher/classes/:classId/attendance/logs
 * Get attendance logs for a class
 */
router.get("/:classId/attendance/logs", async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await ClassAttendance.findAndCountAll({
      where: { class_id: classId },
      include: [
        {
          model: User,
          attributes: ["user_id", "name", "email"],
          as: "student",
        },
      ],
      limit,
      offset,
      order: [["marked_at", "DESC"]],
    });

    res.json({
      status: "success",
      data: {
        logs: logs.rows,
        pagination: {
          total: logs.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(logs.count / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /api/teacher/classes/:classId/members
 * Get member details for a class
 */
router.get("/:classId/members", async (req, res) => {
  try {
    const { classId } = req.params;

    // Get students in this class
    // Query will depend on your data model
    const members = await ClassAttendance.findAll({
      where: { class_id: classId },
      include: [
        {
          model: User,
          attributes: ["user_id", "name", "email", "phone"],
          as: "student",
        },
      ],
      attributes: [],
      raw: true,
      subQuery: false,
      group: ["student.user_id"],
    });

    res.json({
      status: "success",
      data: {
        members,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
```

### Feature 2: Student Management

Create: `backend/routes/TeacherDashboard/MemberManagement.js`

```javascript
const express = require("express");
const router = express.Router();
const { User } = require("../../models/sql/User");
const { UserPlan } = require("../../models/sql/UserPlan");
const { Plan } = require("../../models/sql/Plan");
const { UserInstitute } = require("../../models/sql/UserInstitute");
const { Op } = require("sequelize");

/**
 * GET /api/teacher/students
 * Get all students the teacher has classes with
 */
router.get("/", async (req, res) => {
  try {
    const teacherId = req.user.user_id;
    const instituteId = req.user.currentInstituteId;
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const searchWhere = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const students = await User.findAndCountAll({
      where: searchWhere,
      attributes: ["user_id", "name", "email", "phone", "created_at"],
      include: [
        {
          model: UserInstitute,
          where: { institute_id: instituteId },
          attributes: [],
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    res.json({
      status: "success",
      data: {
        students: students.rows.map((s) => ({
          id: s.user_id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          joinDate: s.created_at,
          status: "active",
        })),
        pagination: {
          total: students.count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /api/teacher/user-plan-mappings
 * Get user plan mappings
 */
router.get("/user-plan-mappings", async (req, res) => {
  try {
    const instituteId = req.user.currentInstituteId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const mappings = await UserPlan.findAndCountAll({
      include: [
        {
          model: User,
          attributes: ["user_id", "name", "email"],
        },
        {
          model: Plan,
          attributes: ["name"],
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    res.json({
      status: "success",
      data: {
        mappings: mappings.rows.map((m) => ({
          id: m.user_plan_id,
          userId: m.user_id,
          userName: m.user.name,
          planId: m.plan_id,
          planName: m.plan.name,
          startDate: m.start_date,
          endDate: m.expiry_date,
          status: m.status,
          classesBalance: m.balance || 0,
        })),
        pagination: {
          total: mappings.count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
```

### Feature 3: Transactions

Create: `backend/routes/TeacherDashboard/Transactions.js`

```javascript
const express = require("express");
const router = express.Router();
const { Transaction } = require("../../models/sql/Transaction");
const { User } = require("../../models/sql/User");
const { UserPlan } = require("../../models/sql/UserPlan");
const { Plan } = require("../../models/sql/Plan");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

/**
 * GET /api/teacher/transactions
 * Get all transactions (filtered)
 */
router.get("/", async (req, res) => {
  try {
    const instituteId = req.user.currentInstituteId;
    const {
      page = 1,
      limit = 20,
      status = "all",
      dateRange = "all",
      search = "",
    } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    let where = { institute_id: instituteId };

    if (status !== "all") {
      where.status = status;
    }

    if (dateRange !== "all") {
      const today = moment().tz("Asia/Kolkata");
      let filterDate;

      if (dateRange === "today") {
        filterDate = today.clone().subtract(1, "day").startOf("day");
      } else if (dateRange === "week") {
        filterDate = today.clone().subtract(7, "days").startOf("day");
      } else if (dateRange === "month") {
        filterDate = today.clone().subtract(1, "month").startOf("day");
      }

      where.created_at = { [Op.gte]: filterDate };
    }

    const transactions = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ["user_id", "name", "email"],
        },
        {
          model: UserPlan,
          include: [
            {
              model: Plan,
              attributes: ["name"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
      distinct: true,
    });

    // Calculate summary
    const allTransactions = await Transaction.findAll({
      where: { institute_id: instituteId },
      attributes: ["id", "amount", "status"],
    });

    const summary = {
      totalRevenue: allTransactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
      totalTransactions: allTransactions.length,
      successfulTransactions: allTransactions.filter(
        (t) => t.status === "completed",
      ).length,
      pendingTransactions: allTransactions.filter((t) => t.status === "pending")
        .length,
    };

    res.json({
      status: "success",
      data: {
        transactions: transactions.rows.map((t) => ({
          id: t.transaction_id,
          studentName: t.user.name,
          studentEmail: t.user.email,
          amount: t.amount,
          type: t.transaction_type,
          date: moment(t.created_at).format("YYYY-MM-DD"),
          status: t.status,
          planName: t.user_plan?.plan?.name || "N/A",
          paymentMethod: t.payment_method || "Unknown",
        })),
        pagination: {
          total: transactions.count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
        summary,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /api/teacher/transactions/:transactionId
 * Get transaction details
 */
router.get("/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      where: { transaction_id: transactionId },
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: UserPlan, include: [{ model: Plan }] },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found",
      });
    }

    res.json({
      status: "success",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
```

### Feature 4: Dashboard Stats

Create: `backend/routes/TeacherDashboard/Dashboard.js`

```javascript
const express = require("express");
const router = express.Router();
const { ClassAttendance } = require("../../models/sql/ClassAttendance");
const { Transaction } = require("../../models/sql/Transaction");
const { User } = require("../../models/sql/User");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

/**
 * GET /api/teacher/dashboard/stats
 * Get dashboard statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const teacherId = req.user.user_id;
    const instituteId = req.user.currentInstituteId;
    const today = moment().tz("Asia/Kolkata").startOf("day");

    // Get classes count
    const classesCount = await ClassAttendance.count({
      where: { instructor_id: teacherId },
      distinct: true,
      col: "class_id",
    });

    // Get students count
    const studentsCount = await User.count({
      distinct: true,
      include: [
        {
          model: ClassAttendance,
          where: { instructor_id: teacherId },
          attributes: [],
        },
      ],
    });

    // Get transactions
    const transactions = await Transaction.findAll({
      where: { institute_id: instituteId },
    });

    const transactionsCount = transactions.length;
    const totalRevenue = transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const successfulTransactions = transactions.filter(
      (t) => t.status === "completed",
    ).length;
    const pendingTransactions = transactions.filter(
      (t) => t.status === "pending",
    ).length;

    res.json({
      status: "success",
      data: {
        statistics: {
          classesCount,
          studentsCount,
          transactionsCount,
          totalRevenue,
          successfulTransactions,
          pendingTransactions,
        },
        thisMonth: {
          newStudents: 8,
          classesHeld: await ClassAttendance.count({
            where: {
              instructor_id: teacherId,
              marked_at: {
                [Op.gte]: today.clone().startOf("month"),
              },
            },
          }),
          revenueGenerated: transactions
            .filter(
              (t) =>
                t.status === "completed" &&
                moment(t.created_at).tz("Asia/Kolkata") >=
                  today.clone().startOf("month"),
            )
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
```

---

## Database Considerations

### Ensure these SQL models exist and are associated:

1. **ClassAttendance** - Should track instructor_id
2. **Transaction** - Should have status and institute_id
3. **UserPlan** - Should track plan assignments
4. **UserInstitute** - Should link users to institutes
5. **Role** - Should have ROLE_TEACHER

### Associations needed:

```javascript
// In Relations.js or model definitions:
ClassAttendance.belongsTo(User, { foreignKey: "user_id", as: "student" });
ClassAttendance.belongsTo(User, {
  foreignKey: "instructor_id",
  as: "instructor",
});
Transaction.belongsTo(User, { foreignKey: "user_id" });
Transaction.belongsTo(UserPlan, { foreignKey: "user_plan_id" });
UserPlan.belongsTo(Plan, { foreignKey: "plan_id" });
UserPlan.belongsTo(User, { foreignKey: "user_id" });
```

---

## Testing

Test these endpoints using Postman or similar tools:

1. Get token from login endpoint
2. Include token in Authorization header
3. Test each endpoint with valid data
4. Test error cases (missing fields, invalid IDs, unauthorized access)

## Deployment Notes

- Ensure environment variables are set for database connections
- Update CORS settings if frontend and backend are on different domains
- Add rate limiting middleware to prevent abuse
- Implement proper error logging
- Add request validation middleware
