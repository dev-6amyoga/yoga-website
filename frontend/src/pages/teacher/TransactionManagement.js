import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiDownload,
  FiFilter,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import { getTransactions, exportTransactions } from "../../api/teacherApi";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
import "./TransactionManagement.css";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
  });
  const filteredTransactions = transactions;

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, statusFilter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions(
        1,
        20,
        statusFilter,
        dateRange,
        searchTerm,
      );
      setTransactions(response?.transactions || []);
      setSummary(
        response?.summary || {
          totalRevenue: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
          pendingTransactions: 0,
        },
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportTransactions(dateRange);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        "transactions-" + new Date().toISOString().slice(0, 10) + ".csv",
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting transactions:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="status-icon completed" />;
      case "pending":
        return <FiClock className="status-icon pending" />;
      case "failed":
        return <FiXCircle className="status-icon failed" />;
      default:
        return null;
    }
  };

  return (
    <TeacherPageWrapper heading="Transaction Management">
      <div className="transaction-management">
        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card total-revenue">
            <div className="card-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="card-content">
              <p className="card-label">Total Revenue</p>
              <h3 className="card-value">
                {formatCurrency(summary.totalRevenue)}
              </h3>
              <p className="card-meta">
                {summary.successfulTransactions} successful transactions
              </p>
            </div>
          </div>

          <div className="summary-card total-transactions">
            <div className="card-icon">
              <FiDollarSign size={32} />
            </div>
            <div className="card-content">
              <p className="card-label">Total Transactions</p>
              <h3 className="card-value">{summary.totalTransactions}</h3>
              <p className="card-meta">All time transactions</p>
            </div>
          </div>

          <div className="summary-card successful">
            <div className="card-icon">
              <FiCheckCircle size={32} />
            </div>
            <div className="card-content">
              <p className="card-label">Successful</p>
              <h3 className="card-value">{summary.successfulTransactions}</h3>
              <p className="card-meta">
                {(
                  (summary.successfulTransactions / summary.totalTransactions) *
                  100
                ).toFixed(1)}
                % success rate
              </p>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="card-icon">
              <FiClock size={32} />
            </div>
            <div className="card-content">
              <p className="card-label">Pending</p>
              <h3 className="card-value">{summary.pendingTransactions}</h3>
              <p className="card-meta">Awaiting review or confirmation</p>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="filters-section">
          <div className="search-filters">
            <div className="search-bar">
              <FiSearch size={20} />
              <input
                type="text"
                placeholder="Search by student name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          <button className="btn-export" onClick={handleExport}>
            <FiDownload size={18} />
            Export
          </button>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <FiDollarSign size={48} />
            <h3>No transactions found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Student</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <span className="txn-id">{transaction.id}</span>
                    </td>
                    <td>
                      <div className="student-cell">
                        <FiUser size={16} />
                        <div>
                          <p className="student-name">
                            {transaction.studentName}
                          </p>
                          <p className="student-email">
                            {transaction.studentEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{transaction.planName}</td>
                    <td className="amount">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>
                      <div className="date-cell">
                        <FiCalendar size={14} />
                        {transaction.date}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(transaction.status)}
                        <span className={`status-text ${transaction.status}`}>
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>{transaction.paymentMethod}</td>
                    <td>
                      <button className="action-link">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Info */}
        {filteredTransactions.length > 0 && (
          <div className="pagination-info">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </div>
        )}
      </div>
    </TeacherPageWrapper>
  );
}
