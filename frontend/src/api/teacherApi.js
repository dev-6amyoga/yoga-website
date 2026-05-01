import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const teacherApi = axios.create({
  baseURL: `${API_BASE_URL}/teacher`,
});

// Add auth token to requests
teacherApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle responses and errors
teacherApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || "An error occurred";
    throw new Error(message);
  },
);

/**
 * CLASS MANAGEMENT APIs
 */

// Get all classes for teacher
export const getTeacherClasses = () => {
  return teacherApi.get("/classes");
};

// Create new class
export const createClass = (classData) => {
  return teacherApi.post("/classes", classData);
};

// Join class
export const joinClass = (classId) => {
  return teacherApi.post(`/classes/${classId}/join`);
};

// Log attendance for a class
export const logAttendance = (classId, attendanceData) => {
  return teacherApi.post(`/classes/${classId}/attendance/log`, attendanceData);
};

// Get attendance logs for a class
export const getAttendanceLogs = (classId, page = 1, limit = 20) => {
  return teacherApi.get(`/classes/${classId}/attendance/logs`, {
    params: { page, limit },
  });
};

// Get class member details
export const getClassMembers = (classId) => {
  return teacherApi.get(`/classes/${classId}/members`);
};

/**
 * MEMBER/STUDENT MANAGEMENT APIs
 */

// Get all students
export const getStudents = (page = 1, limit = 20, search = "") => {
  return teacherApi.get("/students", {
    params: { page, limit, search },
  });
};

// Get user plan mappings
export const getUserPlanMappings = (page = 1, limit = 20) => {
  return teacherApi.get("/user-plan-mappings", {
    params: { page, limit },
  });
};

// Update student information
export const updateStudent = (studentId, data) => {
  return teacherApi.put(`/students/${studentId}`, data);
};

// Remove student
export const removeStudent = (studentId) => {
  return teacherApi.delete(`/students/${studentId}`);
};

/**
 * VIDEO PLAYER APIs
 */

// Get all playlists
export const getPlaylists = () => {
  return teacherApi.get("/playlists");
};

// Create a new playlist
export const createPlaylist = (playlistData) => {
  return teacherApi.post("/playlists", playlistData);
};

// Get videos in a playlist
export const getPlaylistVideos = (playlistId) => {
  return teacherApi.get(`/playlists/${playlistId}/videos`);
};

// Log video watch history
export const logVideoWatchHistory = (watchData) => {
  return teacherApi.post("/video-watch-history", watchData);
};

/**
 * TRANSACTION MANAGEMENT APIs
 */

// Get all transactions with filters
export const getTransactions = (
  page = 1,
  limit = 20,
  status = "all",
  dateRange = "all",
  search = "",
) => {
  return teacherApi.get("/transactions", {
    params: { page, limit, status, dateRange, search },
  });
};

// Get transaction details
export const getTransactionDetails = (transactionId) => {
  return teacherApi.get(`/transactions/${transactionId}`);
};

// Export transactions as CSV
export const exportTransactions = (dateRange = "month") => {
  return teacherApi.get("/transactions/export/csv", {
    params: { dateRange },
    responseType: "blob",
  });
};

/**
 * DASHBOARD APIs
 */

// Get dashboard statistics
export const getDashboardStats = () => {
  return teacherApi.get("/dashboard/stats");
};

// Get dashboard summary
export const getDashboardSummary = () => {
  return teacherApi.get("/dashboard/summary");
};

export default teacherApi;
