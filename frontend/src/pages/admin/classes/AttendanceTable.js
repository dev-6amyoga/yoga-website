import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
} from "@mui/material";
import moment from "moment-timezone";

export default function AttendanceTable({ data }) {
  const isMobile = useMediaQuery("(max-width:600px)");

  // Format time to IST HH:mm
  const formatTimeIST = (isoString, markedBy) => {
    if (!isoString) return "N/A";

    // Check if marked_by is 'SYSTEM' - these are stored in UTC and need conversion
    if (markedBy === "SYSTEM") {
      // Convert UTC to IST and format as HH:mm
      const istTime = moment(isoString).tz("Asia/Kolkata");
      return istTime.format("HH:mm");
    }

    // For ADMIN_MANUAL and INSTRUCTOR, extract HH:mm directly from ISO string
    const timeMatch = isoString.match(/T(\d{2}):(\d{2}):/);
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`;
    }

    return "N/A";
  };

  // Format date to YYYY-MM-DD
  const formatDateIST = (isoString) => {
    if (!isoString) return "N/A";
    return moment(isoString).tz("Asia/Kolkata").format("YYYY-MM-DD");
  };

  return (
    <TableContainer component={Paper}>
      <Table size={isMobile ? "small" : "medium"}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>User Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Join Time (IST)</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Plan Validity</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Remaining Classes</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Marked By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.user?.name || "N/A"}</TableCell>
                <TableCell>{row.user?.email || "N/A"}</TableCell>
                <TableCell>{row.user?.phone || "N/A"}</TableCell>
                <TableCell>{formatDateIST(row.date)}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#1976d2" }}>
                  {formatTimeIST(row.join_time, row.marked_by)}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#d32f2f" }}>
                  {formatTimeIST(row.plan_last_day, row.marked_by)}
                </TableCell>

                <TableCell>{row.remaining_classes || 0}</TableCell>
                <TableCell>
                  <span
                    style={{
                      backgroundColor:
                        row.attendance_status === "ATTENDED"
                          ? "#4caf50"
                          : "#f44336",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {row.attendance_status}
                  </span>
                </TableCell>
                <TableCell>{row.marked_by || "N/A"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No attendance data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
