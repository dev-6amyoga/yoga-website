import React, { useEffect, useMemo, useState } from "react";
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
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Fetch } from "../../utils/Fetch";
import useUserStore from "../../store/UserStore";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const response = await Fetch({
          url: `/class-attendance/api/attendance/${user.user_id}`,
          method: "GET",
        });
        // ensure sorted newest first
        const data = (response.data || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setAttendanceData(data);
      } catch (err) {
        setError("Failed to fetch attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user]);

  const stats = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return null;
    const userPlanAttendance =
      attendanceData.find((r) => r.userPlanAttendance) ||
      attendanceData[0]?.userPlanAttendance ||
      null;
    //console.log(userPlanAttendance);

    const totalAllowed = userPlanAttendance
      ? Number(userPlanAttendance.userPlanAttendance.classes_allowed || 0)
      : null;

    const classesAttended = userPlanAttendance
      ? Number(userPlanAttendance.userPlanAttendance.classes_attended || 0)
      : null;

    const classesRemaining = totalAllowed - classesAttended;

    const percentUsed =
      totalAllowed && totalAllowed > 0
        ? Math.round((classesAttended / totalAllowed) * 100)
        : null;

    const lastAttended = attendanceData[0]
      ? new Date(attendanceData[0].date)
      : null;

    const weekdayCounts = new Array(7).fill(0);
    attendanceData.forEach((r) => {
      const d = new Date(r.date);
      weekdayCounts[d.getDay()] += 1;
    });

    let streak = 0;
    const datesSet = new Set(
      attendanceData.map((r) => new Date(r.date).toISOString().slice(0, 10))
    );
    let dayCursor = new Date().toISOString().slice(0, 10);
    while (datesSet.has(dayCursor)) {
      streak++;
      const dt = new Date(dayCursor + "T00:00:00");
      dt.setDate(dt.getDate() - 1);
      dayCursor = dt.toISOString().slice(0, 10);
    }

    return {
      userPlanAttendance,
      totalAllowed,
      classesAttended,
      classesRemaining,
      percentUsed,
      lastAttended,
      weekdayCounts,
      streak,
    };
  }, [attendanceData]);

  if (loading)
    return (
      <StudentPageWrapper heading={"Attendance History"}>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </StudentPageWrapper>
    );
  if (error)
    return (
      <StudentPageWrapper heading={"Attendance History"}>
        <Box sx={{ p: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </StudentPageWrapper>
    );

  return (
    <StudentPageWrapper heading={"Attendance History"}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Plan / Summary</Typography>

                {!stats ? (
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    No attendance data found.
                  </Typography>
                ) : (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {/* PLAN NAME */}
                    <Typography variant="body2" color="text.secondary">
                      Plan:{" "}
                      {stats.userPlanAttendance?.plan_id
                        ? `Plan #${stats.userPlanAttendance.plan_id}`
                        : "—"}{" "}
                      {attendanceData[0]?.plan?.name
                        ? `— ${attendanceData[0].plan.name}`
                        : ""}
                    </Typography>

                    {/* CLASSES ATTENDED */}
                    <Box>
                      <Typography variant="caption">
                        Classes attended
                      </Typography>
                      <Typography variant="h5">
                        {stats.classesAttended}
                      </Typography>
                    </Box>

                    {/* CLASSES ALLOWED */}
                    <Box>
                      <Typography variant="caption">Classes allowed</Typography>{" "}
                      <Typography variant="h5">
                        {stats.totalAllowed ?? "Unlimited"}
                      </Typography>
                    </Box>

                    {/* CLASSES REMAINING */}
                    <Box>
                      <Typography variant="caption">
                        Classes remaining
                      </Typography>
                      <Typography variant="h5">
                        {stats.totalAllowed === null
                          ? "—"
                          : stats.classesRemaining ?? 0}
                      </Typography>
                    </Box>

                    {/* PROGRESS BAR */}
                    {stats.totalAllowed !== null && (
                      <Box sx={{ width: "100%" }}>
                        <LinearProgress
                          variant="determinate"
                          value={stats.percentUsed}
                        />
                        <Typography variant="caption">
                          {stats.percentUsed}% used
                        </Typography>
                      </Box>
                    )}

                    <Divider />

                    {/* LAST ATTENDED */}
                    <Box>
                      <Typography variant="caption">Last attended</Typography>
                      <Typography variant="body2">
                        {stats.lastAttended
                          ? stats.lastAttended.toLocaleString()
                          : "—"}
                      </Typography>
                    </Box>

                    {/* STREAK */}
                    <Box>
                      <Typography variant="caption">
                        Current streak (days)
                      </Typography>
                      <Typography variant="body2">{stats.streak}</Typography>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Attendance by weekday</Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "end", mt: 2 }}>
                  {stats ? (
                    (() => {
                      const max = Math.max(...stats.weekdayCounts, 1);
                      return weekdayLabels.map((label, i) => {
                        const val = stats.weekdayCounts[i] || 0;
                        const height = Math.round((val / max) * 120) + 8; // px
                        return (
                          <Box
                            key={label}
                            sx={{ textAlign: "center", width: 36 }}
                          >
                            <Box
                              sx={{
                                height,
                                bgcolor: "primary.main",
                                borderRadius: 1,
                                mb: 1,
                                transition: "height 0.2s ease",
                              }}
                            />
                            <Typography variant="caption">{label}</Typography>
                            <Typography variant="caption" display="block">
                              {val}
                            </Typography>
                          </Box>
                        );
                      });
                    })()
                  ) : (
                    <Typography variant="body2">No data</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detailed records
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Join time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceData.map((record) => (
                        <TableRow
                          key={record.id || `${record.user_id}-${record.date}`}
                        >
                          <TableCell>
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {record.class?.zoom_class_name ??
                              `#${record.class_id}`}
                          </TableCell>
                          <TableCell>
                            {record.plan?.name ?? record.plan_id ?? "—"}
                          </TableCell>
                          <TableCell>{record.attendance_status}</TableCell>
                          <TableCell>
                            {record.join_time
                              ? new Date(record.join_time).toLocaleTimeString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </StudentPageWrapper>
  );
}
