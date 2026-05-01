# API Quick Reference - Teacher Dashboard

## All Endpoints at a Glance

### Base URL
```
http://localhost:5000/api/teacher
```

### Authentication Required
All endpoints require: `Authorization: Bearer {jwt_token}`

---

## Dashboard Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard/stats` | Get full dashboard statistics (classes, students, revenue, etc) |
| GET | `/dashboard/summary` | Get recent transactions and upcoming classes |
| GET | `/dashboard/health` | Health check endpoint |

---

## Class Management Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/classes` | Get all classes |
| POST | `/classes` | Create new class |
| GET | `/classes/:classId` | Get class details |
| POST | `/classes/:classId/join` | Join a class |
| POST | `/classes/:classId/attendance/log` | Log attendance |
| GET | `/classes/:classId/attendance/logs` | Get attendance records |
| GET | `/classes/:classId/members` | Get class members |

**POST /classes** Request Body:
```json
{
  "name": "string",
  "description": "string",
  "schedule": "string",
  "type": "recurring|onetime",
  "recurringDays": ["MON", "WED", "FRI"],
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "maxStudents": number
}
```

**POST /classes/:classId/attendance/log** Request Body:
```json
{
  "studentIds": [1, 2, 3],
  "status": "PRESENT|ABSENT",
  "timestamp": "ISO8601_datetime"
}
```

---

## Student Management Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/students` | Get all students (paginated, searchable) |
| GET | `/students/:studentId` | Get student details |
| PUT | `/students/:studentId` | Update student |
| DELETE | `/students/:studentId` | Delete student |
| GET | `/user-plan-mappings` | Get user plan assignments |

**Query Parameters for GET /students:**
```
?page=1              // Page number (default: 1)
&limit=20            // Items per page (default: 20)
&search=john         // Search by name/email
```

**PUT /students/:studentId** Request Body:
```json
{
  "name": "string",
  "phone": "string",
  "status": "active|inactive"
}
```

---

## Video Player Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/playlists` | Get all playlists |
| POST | `/playlists` | Create playlist |
| GET | `/playlists/:playlistId/videos` | Get videos in playlist |
| POST | `/video-watch-history` | Log watch history |

**POST /video-watch-history** Request Body:
```json
{
  "videoId": number,
  "studentId": number,
  "watchedDuration": number,
  "totalDuration": number,
  "percentageWatched": number
}
```

---

## Transaction Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/transactions` | Get transactions (paginated, filterable) |
| GET | `/transactions/:transactionId` | Get transaction details |
| GET | `/transactions/export/csv` | Export transactions as CSV |

**Query Parameters for GET /transactions:**
```
?page=1                          // Page number (default: 1)
&limit=20                        // Items per page (default: 20)
&status=completed|pending|failed // Filter by status (default: all)
&dateRange=today|week|month|all   // Filter by date (default: all)
&search=query                    // Search term
```

CSV Export Fields:
```
ID, Name, Email, Amount, Type, Date, Status, Plan, Payment Method
```

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {},
  "code": 200,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
```
UNAUTHORIZED  - Missing or invalid token (401)
FORBIDDEN     - User lacks required role (403)
NOT_FOUND     - Resource not found (404)
VALIDATION_ERROR - Invalid request data (400)
SERVER_ERROR  - Internal server error (500)
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |

---

## Common Request Examples

### Get Dashboard Data
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/teacher/dashboard/stats
```

### Create a Class
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Yoga",
    "description": "Beginner yoga",
    "schedule": "Mon Wed Fri",
    "type": "recurring",
    "recurringDays": ["MON", "WED", "FRI"],
    "startTime": "06:00",
    "endTime": "07:00",
    "maxStudents": 30
  }' \
  http://localhost:5000/api/teacher/classes
```

### Get Students with Search
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/teacher/students?page=1&limit=20&search=john"
```

### Log Attendance
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": [1, 2, 3],
    "status": "PRESENT",
    "timestamp": "2024-04-30T06:00:00Z"
  }' \
  http://localhost:5000/api/teacher/classes/1/attendance/log
```

### Get Transactions (Filtered)
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/teacher/transactions?page=1&limit=10&status=completed&dateRange=month"
```

### Export CSV
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/teacher/transactions/export/csv" \
  -o transactions.csv
```

---

## Frontend Integration

The frontend should use the API service already created at:
```
frontend/src/services/teacherApi.js
```

All backend endpoints are already mapped in this service file.

**Usage Example:**
```javascript
import teacherApi from '@/services/teacherApi';

// Get dashboard stats
const stats = await teacherApi.getDashboardStats();

// Get classes
const classes = await teacherApi.getClasses();

// Create class
const newClass = await teacherApi.createClass(classData);

// Get students
const students = await teacherApi.getStudents(page, limit, search);
```

---

## Important Notes

1. **Authentication:** All routes are protected with JWT token and role verification
2. **Role:** User must have `ROLE_TEACHER` to access any endpoint
3. **Timezone:** All timestamps stored in Asia/Kolkata timezone
4. **Pagination:** Max 100 items per page allowed
5. **Filtering:** Case-insensitive search
6. **CSV Export:** Only works for transactions endpoint
7. **Data Isolation:** Teachers can only see their own data

---

## File Locations

| Component | File |
|-----------|------|
| Middleware | `backend/middleware/verifyTeacherRole.js` |
| Routes | `backend/routes/TeacherDashboard/` |
| Main Router | `backend/routes/TeacherDashboard.js` |
| Server Integration | `backend/server.js` |
| Frontend Service | `frontend/src/services/teacherApi.js` |
| API Docs | `docs/API_DOCUMENTATION.md` |
| Setup Guide | `BACKEND_SETUP_GUIDE.md` |
| Testing Guide | `TESTING_GUIDE.md` |

---

## Troubleshooting Quick Links

| Issue | Check |
|-------|-------|
| 404 on /api/teacher/* | Server.js has router registered |
| 401 Unauthorized | Authorization header present and valid |
| 403 Forbidden | User has ROLE_TEACHER role |
| 500 Internal Error | Server logs, database connection |
| CSV download fails | csv-stringify installed, endpoint path correct |
| No data returned | Database models and associations correct |
| Pagination not working | page and limit parameters provided |
| Search not working | searchable fields in query |

---

**Quick Links:**
- 📚 [Full API Documentation](../docs/API_DOCUMENTATION.md)
- 🔧 [Backend Setup Guide](../BACKEND_SETUP_GUIDE.md)
- 🧪 [Testing Guide](../TESTING_GUIDE.md)
- 📋 [Implementation Guide](../BACKEND_IMPLEMENTATION_GUIDE.md)
- 🎨 [Dashboard README](../README_TEACHER_DASHBOARD.md)

---

**Last Updated:** April 30, 2026
**Status:** Ready for Production Testing
