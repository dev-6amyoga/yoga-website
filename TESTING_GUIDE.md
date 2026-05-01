# Backend Testing Guide - Teacher Dashboard

## Quick Start Testing

This guide helps you test the newly implemented Teacher Dashboard backend APIs.

## Prerequisites

1. **Server running:** Node.js backend server should be running on `http://localhost:5000`
2. **JWT Token:** You need a valid JWT token for authentication
3. **Postman or cURL:** For testing API endpoints
4. **Database:** Ensure all required models exist in your database

## Getting Started

### 1. Start the Backend Server

```bash
cd backend
npm install          # If dependencies not installed
npm start            # or node server.js
```

Expected output:

```
Server running on port 5000
Connected to database...
```

### 2. Verify Routes are Registered

Check that the routes loaded by looking for lines in console:

```
Routes registered: /api/teacher
```

## Testing Authorization

### Create a Test JWT Token

If you don't have a JWT token, you can create one (ask your backend developer or auth team for a test token with `ROLE_TEACHER`).

Token should have payload like:

```json
{
  "user_id": 1,
  "email": "teacher@example.com",
  "role": "ROLE_TEACHER",
  "institute_id": 1,
  "iat": 1700000000,
  "exp": 1762000000
}
```

## Test Endpoints

### Method 1: Using Postman

#### Setup in Postman

1. Create a new Collection: "Teacher Dashboard"
2. Add Collection Variables:
   - `base_url` = `http://localhost:5000`
   - `api_path` = `/api/teacher`
   - `token` = `{your_jwt_token}`

3. Create requests with pattern:
   ```
   URL: {{base_url}}{{api_path}}{endpoint}
   Header: Authorization: Bearer {{token}}
   ```

#### Test Requests (in order)

**Request 1: Health Check**

```
GET /api/teacher/dashboard/health
Expected: 200 OK
Response: {
  "status": "success",
  "message": "Teacher dashboard service is healthy"
}
```

**Request 2: Get Dashboard Stats**

```
GET /api/teacher/dashboard/stats
Expected: 200 OK
Response: {
  "status": "success",
  "data": {
    "totalClasses": 5,
    "activeClasses": 2,
    "totalStudents": 45,
    "totalRevenue": 50000,
    ...
  }
}
```

**Request 3: Get All Classes**

```
GET /api/teacher/classes
Expected: 200 OK
Response: {
  "status": "success",
  "data": [...classes array],
  "pagination": {"page": 1, "limit": 20, "total": 5}
}
```

**Request 4: Create a Class**

```
POST /api/teacher/classes
Headers: Content-Type: application/json
Body: {
  "name": "Test Yoga Class",
  "description": "Test class description",
  "schedule": "Mon Wed Fri 6:00 AM",
  "type": "recurring",
  "recurringDays": ["MON", "WED", "FRI"],
  "startTime": "06:00",
  "endTime": "07:00",
  "maxStudents": 30
}
Expected: 201 Created
```

**Request 5: Get Students**

```
GET /api/teacher/students?page=1&limit=10
Expected: 200 OK
Response: {
  "status": "success",
  "data": [...students array]
}
```

**Request 6: Get Transactions**

```
GET /api/teacher/transactions?page=1&limit=10
Expected: 200 OK
Response: {
  "status": "success",
  "data": [...transactions],
  "summary": {"totalRevenue": 50000, "successRate": 96}
}
```

**Request 7: Export Transactions (CSV)**

```
GET /api/teacher/transactions/export/csv
Expected: 200 OK (file download)
```

**Request 8: Get Playlists**

```
GET /api/teacher/playlists
Expected: 200 OK
Response: {
  "status": "success",
  "data": [...playlists]
}
```

### Method 2: Using cURL

#### Test 1: Health Check

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/teacher/dashboard/health
```

#### Test 2: Get Classes

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/teacher/classes
```

#### Test 3: Create Class

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Class",
    "description": "Test",
    "schedule": "Mon Wed",
    "type": "recurring",
    "recurringDays": ["MON"],
    "startTime": "06:00",
    "endTime": "07:00",
    "maxStudents": 20
  }' \
  http://localhost:5000/api/teacher/classes
```

#### Test 4: Get Transactions

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/teacher/transactions?page=1&limit=10"
```

#### Test 5: Export CSV

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/teacher/transactions/export/csv" \
  -o transactions.csv
```

## Testing Authorization

### Test 1: Missing Token (Should fail)

```
GET /api/teacher/classes
(No Authorization header)

Expected: 401 Unauthorized
Response: {
  "status": "error",
  "message": "No token provided",
  "code": "UNAUTHORIZED"
}
```

### Test 2: Invalid Token (Should fail)

```
GET /api/teacher/classes
Authorization: Bearer invalid_token_here

Expected: 403 Forbidden
Response: {
  "status": "error",
  "message": "Invalid token",
  "code": "FORBIDDEN"
}
```

### Test 3: Non-Teacher User (Should fail if not teacher)

```
GET /api/teacher/classes
Authorization: Bearer {token_for_non_teacher_user}

Expected: 403 Forbidden
Response: {
  "status": "error",
  "message": "User does not have TEACHER role",
  "code": "FORBIDDEN"
}
```

## Validation Testing

### Test 1: Create class with missing fields

```
POST /api/teacher/classes
Body: {
  "name": "Test"
  // Missing other required fields
}

Expected: 400 Bad Request
Response: {
  "status": "error",
  "message": "Description is required",
  "code": "VALIDATION_ERROR"
}
```

### Test 2: Invalid class ID

```
GET /api/teacher/classes/invalid_id

Expected: 400 Bad Request or 404 Not Found
```

### Test 3: Pagination tests

```
GET /api/teacher/classes?page=1&limit=5
GET /api/teacher/classes?page=2&limit=5
GET /api/teacher/classes?page=999&limit=5
```

## Checklist

### ✅ Basic Tests

- [ ] Server starts successfully
- [ ] Routes are registered
- [ ] Health check endpoint works
- [ ] Authorization middleware works
- [ ] Role verification works

### ✅ Dashboard Tests

- [ ] GET /dashboard/stats returns data
- [ ] GET /dashboard/summary returns data
- [ ] Stats include all required fields

### ✅ Class Management Tests

- [ ] GET /classes returns list
- [ ] POST /classes creates new class
- [ ] GET /classes/:id returns detail
- [ ] POST /classes/:id/join works
- [ ] POST /classes/:id/attendance/log works
- [ ] GET /classes/:id/attendance/logs returns data
- [ ] GET /classes/:id/members returns data

### ✅ Student Management Tests

- [ ] GET /students returns list with pagination
- [ ] GET /students with search parameter works
- [ ] GET /students/:id returns detail
- [ ] PUT /students/:id updates student
- [ ] DELETE /students/:id removes student
- [ ] GET /user-plan-mappings returns data

### ✅ Video Tests

- [ ] GET /playlists returns list
- [ ] GET /playlists/:id/videos returns videos
- [ ] POST /video-watch-history logs history

### ✅ Transaction Tests

- [ ] GET /transactions returns list
- [ ] GET /transactions with filters works
- [ ] GET /transactions/:id returns detail
- [ ] GET /transactions/export/csv downloads file

### ✅ Error Tests

- [ ] Missing auth token returns 401
- [ ] Invalid token returns 403
- [ ] Non-teacher user returns 403
- [ ] Invalid data returns 400
- [ ] Invalid ID returns 404

## Debugging

### Issue: Cannot connect to server

```bash
# Check if server is running
curl http://localhost:5000

# If not, start server
cd backend
npm start
```

### Issue: 404 on /api/teacher endpoints

```bash
# Verify routes are registered in server.js
# Check that these lines exist:
# const teacherDashboardRouter = require('./routes/TeacherDashboard');
# app.use('/api/teacher', teacherDashboardRouter);
```

### Issue: 401/403 on all endpoints

```bash
# Verify token is valid
# Token should have ROLE_TEACHER role
# Check Authorization header format: "Bearer {token}"
```

### Issue: Database errors

```bash
# Check database connection
# Verify all required models exist
# Check that MongoDB and SQL databases are running
```

### View server logs

```bash
# Check console for error messages
# Look for middleware execution logs
# Verify query results
```

## Manual Testing Script

Create `test-endpoints.js` to automate testing:

```javascript
const axios = require("axios");

const TOKEN = "YOUR_JWT_TOKEN";
const BASE_URL = "http://localhost:5000/api/teacher";

const tests = [
  {
    name: "Health Check",
    method: "GET",
    path: "/dashboard/health",
  },
  {
    name: "Get Stats",
    method: "GET",
    path: "/dashboard/stats",
  },
  {
    name: "Get Classes",
    method: "GET",
    path: "/classes",
  },
  {
    name: "Get Students",
    method: "GET",
    path: "/students?page=1&limit=5",
  },
  {
    name: "Get Transactions",
    method: "GET",
    path: "/transactions?page=1&limit=5",
  },
];

async function runTests() {
  console.log("Starting API Tests...\n");

  for (const test of tests) {
    try {
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.path}`,
        headers: { Authorization: `Bearer ${TOKEN}` },
      };

      const response = await axios(config);
      console.log(`✅ ${test.name}: ${response.status} OK`);
    } catch (error) {
      console.log(
        `❌ ${test.name}: ${error.response?.status} ${error.message}`,
      );
    }
  }
}

runTests();
```

Run it with:

```bash
node test-endpoints.js
```

## Summary

After testing, you should have:

- ✅ All 17 endpoints responding
- ✅ Authorization and authentication working
- ✅ Data being returned in correct format
- ✅ Pagination working
- ✅ Filtering/search working
- ✅ Error handling working

Ready to proceed with frontend integration!
