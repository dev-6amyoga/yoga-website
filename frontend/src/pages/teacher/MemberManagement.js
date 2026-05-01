import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiChevronDown,
} from "react-icons/fi";
import { getStudents, getUserPlanMappings } from "../../api/teacherApi";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
import "./MemberManagement.css";

export default function MemberManagement() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [userPlanMappings, setUserPlanMappings] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchUserPlanMappings();
  }, [searchTerm]);

  const fetchMembers = async () => {
    try {
      const response = await getStudents(1, 20, searchTerm);
      setStudents(response?.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchUserPlanMappings = async () => {
    try {
      const response = await getUserPlanMappings(1, 20);
      setUserPlanMappings(response?.mappings || []);
    } catch (error) {
      console.error("Error fetching mappings:", error);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMappings = userPlanMappings.filter(
    (m) =>
      m.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.planName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <TeacherPageWrapper heading="Member Management">
      <div className="member-management">
        {/* Header */}
        <div className="management-header">
          <div className="search-bar">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder={
                activeTab === "students"
                  ? "Search students..."
                  : "Search plans..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <FiUsers size={18} />
            Students ({students.length})
          </button>
          <button
            className={`tab ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => setActiveTab("plans")}
          >
            <FiFileText size={18} />
            User Plan Mappings ({userPlanMappings.length})
          </button>
        </div>

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="tab-content">
            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <FiUsers size={48} />
                <h3>No students found</h3>
                <p>Your students will appear here once they join</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Join Date</th>
                      <th>Classes Attended</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-info">
                            <img src={student.avatar} alt={student.name} />
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>{student.phone}</td>
                        <td>{student.joinDate}</td>
                        <td>
                          <span className="badge">
                            {student.classesAttended}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${student.status}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="action-icon" title="Edit">
                              <FiEdit2 size={16} />
                            </button>
                            <button className="action-icon" title="Remove">
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* User Plan Mappings Tab */}
        {activeTab === "plans" && (
          <div className="tab-content">
            {filteredMappings.length === 0 ? (
              <div className="empty-state">
                <FiFileText size={48} />
                <h3>No plan mappings found</h3>
                <p>Plan mappings will appear here</p>
              </div>
            ) : (
              <div className="mappings-grid">
                {filteredMappings.map((mapping) => (
                  <div key={mapping.id} className="mapping-card">
                    <div className="mapping-header">
                      <h4>{mapping.userName}</h4>
                      <span className={`status-badge ${mapping.status}`}>
                        {mapping.status.replace("-", " ")}
                      </span>
                    </div>

                    <div className="mapping-details">
                      <div className="detail-row">
                        <span className="label">Plan Name:</span>
                        <span className="value">{mapping.planName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Start Date:</span>
                        <span className="value">{mapping.startDate}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">End Date:</span>
                        <span className="value">{mapping.endDate}</span>
                      </div>
                      <div className="detail-row highlight">
                        <span className="label">Classes Balance:</span>
                        <span className="value">{mapping.classesBalance}</span>
                      </div>
                    </div>

                    <div className="mapping-actions">
                      <button className="btn-small primary">Edit</button>
                      <button className="btn-small secondary">Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherPageWrapper>
  );
}
