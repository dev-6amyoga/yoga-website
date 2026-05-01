import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiVideo,
  FiCreditCard,
  FiBook,
  FiChevronRight,
} from "react-icons/fi";
import { getDashboardStats } from "../../api/teacherApi";
import useUserStore from "../../store/UserStore";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [stats, setStats] = useState({
    classesCount: 0,
    studentsCount: 0,
    transactionsCount: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats({
        classesCount: response?.statistics?.classesCount || 0,
        studentsCount: response?.statistics?.studentsCount || 0,
        transactionsCount: response?.statistics?.totalTransactions || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const dashboardItems = [
    {
      id: "class-management",
      title: "Class Management",
      description: "Manage your classes and schedules",
      icon: FiBook,
      color: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      features: [
        "View all classes",
        "Join class",
        "Log attendance",
        "View logs",
      ],
      stats: stats.classesCount,
      onClick: () => navigate("/teacher/class-management"),
    },
    {
      id: "video-player",
      title: "Video Player",
      description: "Stream and manage class videos",
      icon: FiVideo,
      color: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      features: ["Stream videos", "Track playback", "Manage recordings"],
      onClick: () => navigate("/teacher/video-player"),
    },
    {
      id: "member-management",
      title: "Member Management",
      description: "Manage students and their plans",
      icon: FiUsers,
      color: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      features: ["Students list", "View plans", "Manage mappings"],
      stats: stats.studentsCount,
      onClick: () => navigate("/teacher/member-management"),
    },
    {
      id: "transaction-management",
      title: "Transaction Management",
      description: "View and manage all transactions",
      icon: FiCreditCard,
      color: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-600",
      features: ["View transactions", "Track payments", "Generate reports"],
      stats: stats.transactionsCount,
      onClick: () => navigate("/teacher/transaction-management"),
    },
  ];

  return (
    <TeacherPageWrapper>
      <div className="teacher-dashboard">
        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.name}! 👋</h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your classes today
            </p>
          </div>
          <div className="dashboard-quick-stats">
            <div className="stat-card">
              <FiBook size={24} />
              <div>
                <div className="stat-number">{stats.classesCount}</div>
                <div className="stat-label">Active Classes</div>
              </div>
            </div>
            <div className="stat-card">
              <FiUsers size={24} />
              <div>
                <div className="stat-number">{stats.studentsCount}</div>
                <div className="stat-label">Total Students</div>
              </div>
            </div>
            <div className="stat-card">
              <FiCreditCard size={24} />
              <div>
                <div className="stat-number">{stats.transactionsCount}</div>
                <div className="stat-label">Transactions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {dashboardItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`dashboard-card ${item.borderColor} ${item.color}`}
                onClick={item.onClick}
              >
                <div className="card-header">
                  <div className={`icon-container ${item.textColor}`}>
                    <IconComponent size={32} />
                  </div>
                  {item.stats && <div className="card-stat">{item.stats}</div>}
                </div>

                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>

                <div className="card-features">
                  {item.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <span className="feature-dot">•</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`card-action ${item.textColor}`}>
                  Access <FiChevronRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button
              onClick={() => navigate("/teacher/class/manage")}
              className="action-button create-class"
            >
              <span className="action-icon">+</span>
              <span>Create New Class</span>
            </button>
            <button
              onClick={() => navigate("/teacher/transactions")}
              className="action-button view-transactions"
            >
              <FiCreditCard size={18} />
              <span>View Transactions</span>
            </button>
            <button
              onClick={() => navigate("/teacher/playlist")}
              className="action-button manage-playlist"
            >
              <FiVideo size={18} />
              <span>Manage Playlist</span>
            </button>
            <button
              onClick={() => navigate("/teacher/invite")}
              className="action-button invite-students"
            >
              <FiUsers size={18} />
              <span>Invite Students</span>
            </button>
          </div>
        </div>
      </div>
    </TeacherPageWrapper>
  );
}
