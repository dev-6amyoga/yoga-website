import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiClock,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";
import { getTeacherClasses } from "../../api/teacherApi";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
import "./ClassManagement.css";

export default function ClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getTeacherClasses();
      const apiClasses = response?.classes || [];
      const mapped = apiClasses.map((item) => ({
        id: item._id,
        name: item.class_name || item.name,
        description: item.class_desc || item.description || "",
        schedule: item.schedule || "TBD",
        students: item.allowed_students?.length || 0,
        status: item.status || "active",
        type: item.class_type || item.type || "recurring",
        date: item.createdAt ? new Date(item.createdAt) : new Date(),
      }));
      setClasses(mapped);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleJoinClass = (classId) => {
    navigate(`/teacher/class/${classId}`);
  };

  const handleLogAttendance = (classId) => {
    // Navigate to attendance logging page
    navigate(`/teacher/class/${classId}/attendance`);
  };

  const handleViewAttendanceLogs = (classId) => {
    navigate(`/teacher/class/${classId}/attendance-logs`);
  };

  const handleMemberDetails = (classId) => {
    navigate(`/teacher/class/${classId}/members`);
  };

  return (
    <TeacherPageWrapper heading="Class Management">
      <div className="class-management">
        {/* Header Actions */}
        <div className="management-header">
          <div className="search-bar">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/teacher/class/manage")}
            className="btn-primary"
          >
            <FiPlus size={20} />
            Create New Class
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Classes ({filteredClasses.length})
          </button>
          <button
            className={`tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active Classes
          </button>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="loading">Loading your classes...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No classes found</h3>
            <p>Create your first class to get started</p>
            <button onClick={() => navigate("/teacher/class/manage")}>
              Create Class
            </button>
          </div>
        ) : (
          <div className="classes-grid">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="class-card">
                <div className="class-header">
                  <h3>{classItem.name}</h3>
                  <span className={`status-badge ${classItem.status}`}>
                    {classItem.status}
                  </span>
                </div>

                <p className="class-description">{classItem.description}</p>

                <div className="class-meta">
                  <div className="meta-item">
                    <FiClock size={16} />
                    <span>{classItem.schedule}</span>
                  </div>
                  <div className="meta-item">
                    <FiUsers size={16} />
                    <span>{classItem.students} students</span>
                  </div>
                </div>

                <div className="class-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => handleJoinClass(classItem.id)}
                  >
                    <FiChevronRight size={16} />
                    Join Class
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => handleLogAttendance(classItem.id)}
                  >
                    Log Attendance
                  </button>
                </div>

                <div className="class-submenu">
                  <button
                    className="submenu-item"
                    onClick={() => handleViewAttendanceLogs(classItem.id)}
                  >
                    View Attendance Logs
                  </button>
                  <button
                    className="submenu-item"
                    onClick={() => handleMemberDetails(classItem.id)}
                  >
                    Member Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TeacherPageWrapper>
  );
}
