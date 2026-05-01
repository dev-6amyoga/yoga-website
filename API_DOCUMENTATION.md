# Teacher Dashboard API Documentation

This document outlines the API endpoints needed to support the new Teacher Dashboard system.

## Overview

The Teacher Dashboard system provides teachers with comprehensive management tools for:

- Class Management
- Student/Member Management
- Video Streaming and Playlist Management
- Transaction Tracking

## API Endpoints

### 1. Class Management APIs

#### Get All Classes for Teacher

```
GET /api/teacher/classes
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Morning Yoga Basics",
      "description": "Introduction to basic yoga poses",
      "schedule": "Mon, Wed, Fri - 6:00 AM",
      "students": 15,
      "status": "active",
      "type": "recurring",
      "date": "2024-04-28T00:00:00Z"
    }
  ]
}
```

#### Create New Class

```
POST /api/teacher/classes
Headers: Authorization: Bearer {token}
Body:
{
  "name": "string",
  "description": "string",
  "schedule": "string",
  "type": "recurring|onetime",
  "recurringDays": ["MON", "WED", "FRI"],
  "startTime": "06:00",
  "endTime": "07:00",
  "maxStudents": 30
}
Response:
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Morning Yoga Basics",
    ...
  }
}
```

#### Log Attendance

```
POST /api/teacher/classes/:classId/attendance/log
Headers: Authorization: Bearer {token}
Body:
{
  "studentIds": [1, 2, 3],
  "status": "PRESENT|ABSENT|MARKED_BY_INSTRUCTOR",
  "timestamp": "2024-04-28T06:00:00Z"
}
Response:
{
  "status": "success",
  "data": {
    "attendanceRecords": [...]
  }
}
```

#### Get Attendance Logs

```
GET /api/teacher/classes/:classId/attendance/logs?page=1&limit=20
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "logs": [
      {
        "date": "2024-04-28",
        "studentId": 1,
        "studentName": "Aarav Sharma",
        "status": "PRESENT",
        "markedBy": "SYSTEM"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### Get Class Member Details

```
GET /api/teacher/classes/:classId/members
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "members": [
      {
        "id": 1,
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "phone": "+91-9876543210",
        "joinDate": "2024-01-15",
        "classesAttended": 12,
        "status": "active"
      }
    ]
  }
}
```

#### Join Class

```
POST /api/teacher/classes/:classId/join
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "classId": 1,
    "joinedAt": "2024-04-28T06:00:00Z"
  }
}
```

---

### 2. Student/Member Management APIs

#### Get All Students

```
GET /api/teacher/students?page=1&limit=20&search=
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "students": [
      {
        "id": 1,
        "name": "Aarav Sharma",
        "email": "aarav@example.com",
        "phone": "+91-9876543210",
        "joinDate": "2024-01-15",
        "classesAttended": 12,
        "status": "active",
        "avatar": "https://..."
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### Get User Plan Mappings

```
GET /api/teacher/user-plan-mappings?page=1&limit=20
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "mappings": [
      {
        "id": 1,
        "userId": 1,
        "userName": "Aarav Sharma",
        "planId": 5,
        "planName": "Premium - 30 Days",
        "startDate": "2024-01-15",
        "endDate": "2024-02-14",
        "status": "active",
        "classesBalance": 10,
        "totalClasses": 30
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20
    }
  }
}
```

#### Update Student Information

```
PUT /api/teacher/students/:studentId
Headers: Authorization: Bearer {token}
Body:
{
  "name": "string",
  "phone": "string",
  "status": "active|inactive"
}
Response:
{
  "status": "success",
  "data": { ... }
}
```

#### Remove Student

```
DELETE /api/teacher/students/:studentId
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "message": "Student removed successfully"
}
```

---

### 3. Video Player APIs

#### Get Playlists

```
GET /api/teacher/playlists
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "playlists": [
      {
        "id": 1,
        "name": "Morning Yoga Basics",
        "description": "Introduction to basic yoga",
        "videoCount": 5,
        "totalDuration": "85 minutes"
      }
    ]
  }
}
```

#### Get Playlist Videos

```
GET /api/teacher/playlists/:playlistId/videos
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "videos": [
      {
        "id": 1,
        "title": "Warm-up Exercises",
        "duration": "15:30",
        "thumbnail": "https://...",
        "url": "https://...",
        "uploadDate": "2024-01-15"
      }
    ]
  }
}
```

#### Log Video Watch History

```
POST /api/teacher/video-watch-history
Headers: Authorization: Bearer {token}
Body:
{
  "videoId": 1,
  "studentId": 1,
  "watchedDuration": 900,
  "totalDuration": 930,
  "percentageWatched": 96.8
}
Response:
{
  "status": "success",
  "message": "Watch history recorded"
}
```

---

### 4. Transaction Management APIs

#### Get All Transactions

```
GET /api/teacher/transactions?page=1&limit=20&status=all&dateRange=all
Headers: Authorization: Bearer {token}
Query Parameters:
  - page: 1
  - limit: 20
  - status: all|completed|pending|failed
  - dateRange: all|today|week|month
  - search: (optional) search by student name/email/transaction ID

Response:
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "TXN001",
        "studentId": 1,
        "studentName": "Aarav Sharma",
        "studentEmail": "aarav@example.com",
        "amount": 4999,
        "type": "Plan Purchase",
        "date": "2024-04-28",
        "status": "completed",
        "planName": "Premium - 30 Days",
        "paymentMethod": "Credit Card",
        "invoiceUrl": "https://..."
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20
    },
    "summary": {
      "totalRevenue": 149970,
      "totalTransactions": 45,
      "successfulTransactions": 42,
      "pendingTransactions": 2,
      "failedTransactions": 1
    }
  }
}
```

#### Get Transaction Details

```
GET /api/teacher/transactions/:transactionId
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "id": "TXN001",
    "studentId": 1,
    "studentName": "Aarav Sharma",
    "amount": 4999,
    "type": "Plan Purchase",
    "date": "2024-04-28T10:30:00Z",
    "status": "completed",
    "planName": "Premium - 30 Days",
    "paymentMethod": "Credit Card",
    "transactionReference": "RAZORPAY_TXN_12345",
    "invoiceUrl": "https://...",
    "notes": ""
  }
}
```

#### Export Transactions (CSV)

```
GET /api/teacher/transactions/export?format=csv&dateRange=month
Headers: Authorization: Bearer {token}
Response: CSV file download
```

---

### 5. Dashboard Analytics APIs

#### Get Dashboard Statistics

```
GET /api/teacher/dashboard/stats
Headers: Authorization: Bearer {token}
Response:
{
  "status": "success",
  "data": {
    "statistics": {
      "classesCount": 5,
      "activeClasses": 3,
      "studentsCount": 45,
      "totalRevenue": 149970,
      "recentTransactions": 12,
      "pendingTransactions": 2
    },
    "thisMonth": {
      "newStudents": 8,
      "classesHeld": 18,
      "revenueGenerated": 49990
    },
    "topPerforming": [
      {
        "className": "Morning Yoga Basics",
        "studentCount": 22,
        "revenue": 25000
      }
    ]
  }
}
```

---

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer {jwt_token}
```

## Error Responses

All endpoints return consistent error responses:

```
{
  "status": "error",
  "message": "Error message here",
  "code": "ERROR_CODE",
  "data": null
}
```

Common error codes:

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- 1000 requests per hour per user
- 100 requests per minute per user

## Implementation Notes

1. **Database Models Needed**:
   - Extend existing ClassAttendance model if needed
   - Extend existing Transaction model
   - Create/update VideoWatchHistory model
   - Ensure UserPlan model tracks class balances

2. **Authorization**:
   - Ensure only TEACHER role can access these endpoints
   - Use institute_id to filter class/student/transaction data
   - Verify teacher-student relationship for operations

3. **Pagination**:
   - Default limit: 20
   - Max limit: 100
   - Implement offset-based pagination

4. **Sorting**:
   - Most recent first for transactions/logs
   - Alphabetical for students/classes by default

5. **Filtering**:
   - Date range filters should be timezone-aware (Asia/Kolkata)
   - Status filters should be case-insensitive

## Frontend Integration Notes

The frontend will call these endpoints from:

- `frontend/src/pages/teacher/TeacherDashboard.js`
- `frontend/src/pages/teacher/ClassManagement.js`
- `frontend/src/pages/teacher/MemberManagement.js`
- `frontend/src/pages/teacher/VideoPlayer.js`
- `frontend/src/pages/teacher/TransactionManagement.js`

Create an API service file at:
`frontend/src/api/teacherApi.js`

This service should wrap all these endpoints with proper error handling and loading states.
