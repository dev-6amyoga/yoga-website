import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { Fetch } from "../../../utils/Fetch";

export default function ViewAllClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Fetch({
      url: "/zoom/api/classes", // Your endpoint to get all classes
      method: "GET",
    })
      .then((res) => {
        setClasses(res.data);
      })
      .catch((err) => {
        console.log("Error fetching classes", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPageWrapper heading={"View All Classes"}>
      <Box sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 500,
              maxWidth: "100%",
              overflowX: "auto",
              overflowY: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Institute</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Time / Days</TableCell>
                  <TableCell>Zoom Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((row) => (
                  <TableRow key={row.zoom_class_id}>
                    <TableCell>{row.zoom_class_name}</TableCell>
                    <TableCell>
                      {row.class_type === "one_time" ? "One Time" : "Recurring"}
                    </TableCell>
                    <TableCell>{row.institute_id}</TableCell>
                    <TableCell>{row.teacher_id}</TableCell>
                    <TableCell>{row.plan_id}</TableCell>
                    <TableCell>
                      {row.class_type === "one_time" ? (
                        <>
                          {row.start_time
                            ? `${new Date(row.start_time).toLocaleDateString(
                                "en-GB",
                                {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}, ${new Date(row.start_time).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}`
                            : ""}
                          {" - "}
                          {row.end_time
                            ? `${new Date(row.end_time).toLocaleDateString(
                                "en-GB",
                                {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}, ${new Date(row.end_time).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}`
                            : ""}
                        </>
                      ) : (
                        <>
                          {Array.isArray(row.recurring_days)
                            ? row.recurring_days
                                .map(
                                  (d) =>
                                    [
                                      "Sun",
                                      "Mon",
                                      "Tue",
                                      "Wed",
                                      "Thu",
                                      "Fri",
                                      "Sat",
                                    ][d]
                                )
                                .join(", ")
                            : ""}
                          <br />
                          {row.recurring_start_time} - {row.recurring_end_time}
                        </>
                      )}
                    </TableCell>
                    <TableCell>{row.zoom_url}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </AdminPageWrapper>
  );
}
