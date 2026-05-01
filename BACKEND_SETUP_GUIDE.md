# Teacher Dashboard Backend - Setup & Installation Guide

## Overview

The backend API for the Teacher Dashboard is now fully implemented and integrated into your Express.js server. All routes are registered and ready to use.

## Installation

### 1. Install Required Dependencies

Check if you need to install the `csv-stringify` package (used for CSV export):

```bash
cd backend
npm install csv-stringify
```

If `csv-stringify` is already installed, skip this step.

### 2. Verify Database Models

Ensure these SQL models exist in your database:

- `User` - User table with `user_id`, `name`, `email`, `phone`, `created_at`
- `ClassAttendance` - Attendance tracking with `class_id`, `user_id`, `instructor_id`, `attendance_status`, `marked_at`
- `Transaction` - Transaction table with `transaction_id`, `user_id`, `user_plan_id`, `amount`, `status`, `created_at`
- `UserPlan` - Plan assignments with `user_plan_id`, `user_id`, `plan_id`, `start_date`, `expiry_date`, `balance`, `status`
- `Plan` - Plan definitions with `plan_id`, `name`, `total_classes`
- `UserInstitute` - User-institute mapping with `user_id`, `institute_id`
- `UserInstitutePlanRole` - User roles with `user_id`, `institute_id`, `role_id`
- `Role` - Roles table with `role_id`, `name` (should include ROLE_TEACHER)

### 3. Verify MongoDB Models

Ensure the `Class` model exists in MongoDB with fields:

- `teacher_id`, `class_name`, `class_desc`, `class_type`, `schedule`, `recurrance_days`, `recurring_class_start_time`, `recurring_class_end_time`, `max_students`, `allowed_students`, `status`

### 4. Environment Setup

Ensure `.env` file has these settings:

```
MONGO_SRV_URL=your_mongo_connection_string
DATABASE_URL=your_sequelize_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=development|production
```

## API Routes

### Base URL

```
http://localhost:5000/api/teacher
```

### Authentication

All routes require JWT token in Authorization header:

```
Authorization: Bearer {jwt_token}
```

### Class Management Endpoints

#### 1. Get All Classes

```
GET /api/teacher/classes
```

Returns all classes for the logged-in teacher

#### 2. Create New Class

```
POST /api/teacher/classes
Body: {
  "name": "string",
  "description": "string",
  "schedule": "string",
  "type": "recurring|onetime",
  "recurringDays": ["MON", "WED"],
  "startTime": "06:00",
  "endTime": "07:00",
  "maxStudents": 30
}
```

#### 3. Get Class Details

```
GET /api/teacher/classes/:classId
```

#### 4. Join Class

```
POST /api/teacher/classes/:classId/join
```

#### 5. Log Attendance

```
POST /api/teacher/classes/:classId/attendance/log
Body: {
  "studentIds": [1, 2, 3],
  "status": "PRESENT|ABSENT",
  "timestamp": "2024-04-30T06:00:00Z"
}
```

#### 6. Get Attendance Logs

```
GET /api/teacher/classes/:classId/attendance/logs?page=1&limit=20
```

#### 7. Get Class Members

```
GET /api/teacher/classes/:classId/members
```

### Member Management Endpoints

#### 1. Get All Students

```
GET /api/teacher/students?page=1&limit=20&search=
```

#### 2. Get Student Details

```
GET /api/teacher/students/:studentId
```

#### 3. Update Student

```
PUT /api/teacher/students/:studentId
Body: {
  "name": "string",
  "phone": "string",
  "status": "active|inactive"
}
```

#### 4. Delete Student

```
DELETE /api/teacher/students/:studentId
```

#### 5. Get User Plan Mappings

```
GET /api/teacher/user-plan-mappings?page=1&limit=20
```

### Video Player Endpoints

#### 1. Get Playlists

```
GET /api/teacher/playlists
```

#### 2. Create Playlist

```
POST /api/teacher/playlists
Body: {
  "name": "string",
  "description": "string"
}
```

#### 3. Get Playlist Videos

```
GET /api/teacher/playlists/:playlistId/videos
```

#### 4. Log Watch History

```
POST /api/teacher/video-watch-history
Body: {
  "videoId": 1,
  "studentId": 1,
  "watchedDuration": 900,
  "totalDuration": 930,
  "percentageWatched": 96.8
}
```

### Transaction Endpoints

#### 1. Get All Transactions

```
GET /api/teacher/transactions?page=1&limit=20&status=all&dateRange=all&search=
```

Query Parameters:

- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20)
- `status`: all|completed|pending|failed (default: all)
- `dateRange`: all|today|week|month (default: all)
- `search`: Search term for student/transaction ID

#### 2. Get Transaction Details

```
GET /api/teacher/transactions/:transactionId
```

#### 3. Export Transactions as CSV

```
GET /api/teacher/transactions/export/csv?dateRange=month
```

Returns CSV file download

### Dashboard Endpoints

#### 1. Get Dashboard Statistics

```
GET /api/teacher/dashboard/stats
```

Returns:

- Classes count, active classes
- Students count
- Total revenue, transactions
- Success rate
- This month stats
- Trends

#### 2. Get Dashboard Summary

```
GET /api/teacher/dashboard/summary
```

Returns:

- Recent transactions
- Upcoming classes

#### 3. Health Check

```
GET /api/teacher/health
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "status": "error",
  "message": "Error message here",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `SERVER_ERROR` - Internal server error

## File Structure

```
backend/
├── middleware/
│   └── verifyTeacherRole.js (NEW)
├── routes/
│   ├── TeacherDashboard.js (NEW)
│   └── TeacherDashboard/
│       ├── ClassManagement.js (NEW)
│       ├── MemberManagement.js (NEW)
│       ├── VideoPlayer.js (NEW)
│       ├── Transactions.js (NEW)
│       └── Dashboard.js (NEW)
└── server.js (UPDATED)
```

## Testing Endpoints

### Using Postman

1. **Set up collection variables:**
   - Base URL: `http://localhost:5000/api/teacher`
   - Token: `{your_jwt_token}`

2. **Sample requests:**

Get all classes:

```
GET http://localhost:5000/api/teacher/classes
Headers: Authorization: Bearer {token}
```

Create class:

```
POST http://localhost:5000/api/teacher/classes
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
Body: {
  "name": "Morning Yoga",
  "description": "Beginner yoga class",
  "schedule": "Mon, Wed, Fri 6:00 AM",
  "type": "recurring",
  "recurringDays": ["MON", "WED", "FRI"],
  "startTime": "06:00",
  "endTime": "07:00",
  "maxStudents": 30
}
```

Log attendance:

```
POST http://localhost:5000/api/teacher/classes/{classId}/attendance/log
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json
Body: {
  "studentIds": [1, 2, 3],
  "status": "PRESENT",
  "timestamp": "2024-04-30T06:00:00Z"
}
```

Get transactions:

```
GET http://localhost:5000/api/teacher/transactions?page=1&limit=10&status=completed&dateRange=month
Headers: Authorization: Bearer {token}
```

## Troubleshooting

### Issue: "Unauthorized" error on all endpoints

**Solution:**

- Verify JWT token is valid
- Check token is included in Authorization header
- Ensure `authenticateToken` middleware is configured correctly

### Issue: "Forbidden" error on all endpoints

**Solution:**

- Verify user has TEACHER role
- Check `UserInstitutePlanRole` table has entry for user with ROLE_TEACHER
- Verify user's `institute_id` is correct

### Issue: MongoDB connection errors

**Solution:**

- Verify `MONGO_SRV_URL` in `.env`
- Check MongoDB server is running
- Verify connection string is correct

### Issue: CSV export not working

**Solution:**

- Ensure `csv-stringify` is installed
- Check endpoint path: `/api/teacher/transactions/export/csv`
- Verify browser allows file downloads

## Performance Considerations

1. **Pagination:** All list endpoints support pagination (default: 20 items per page)
2. **Caching:** Consider caching dashboard stats (they're expensive to calculate)
3. **Indexes:** Create database indexes on:
   - `ClassAttendance.instructor_id`
   - `Transaction.status`
   - `Transaction.created_at`
   - `UserPlan.user_id`

## Security Considerations

1. **Authentication:** All routes protected with JWT token verification
2. **Role Authorization:** All routes check for TEACHER role
3. **Data Isolation:** Teachers can only see their own data
4. **Input Validation:** All inputs are validated before processing
5. **CORS:** Configure CORS settings in server.js for frontend domain

## Next Steps

1. ✅ Backend API endpoints created
2. ✅ Routes registered in server.js
3. ⏳ Test all endpoints with Postman
4. ⏳ Connect frontend to backend (frontend API service already prepared)
5. ⏳ Add database models if missing
6. ⏳ Configure proper error handling
7. ⏳ Add logging and monitoring
8. ⏳ Deploy to production

## Support

For issues or questions:

1. Check the API_DOCUMENTATION.md for endpoint specs
2. Review error messages and error codes
3. Check database model associations
4. Verify middleware setup
5. Check environment variables

---

**Created:** April 30, 2026
**Status:** Ready for Testing
