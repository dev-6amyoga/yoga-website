import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { Fetch } from "../../../utils/Fetch";

export default function AttendanceByClass() {
  const isMobile = useMediaQuery("(max-width:600px)");

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [selectedClassIndex, setSelectedClassIndex] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  const [classUsers, setClassUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [cronTime, setCronTime] = useState("00:00");
  const [cronLoading, setCronLoading] = useState(false);
  const [cronMessage, setCronMessage] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await Fetch({
        url: "/zoom/api/classes",
        method: "GET",
      });

      const grouped = groupClasses(res.data || []);
      setClasses(grouped);
    } catch (e) {
      console.error("Failed to fetch classes", e);
    }
    setLoadingClasses(false);
  };

  const loadClassUsers = async (classIds) => {
    if (!classIds || classIds.length === 0) return;
    setLoadingUsers(true);

    try {
      const res = await Fetch({
        url: "/user/get-class-users",
        method: "POST",
        data: { class_ids: classIds },
      });

      // Fetch user plans and attendance data
      const usersWithPlans = await Promise.all(
        (res.data.users || []).map(async (user) => {
          try {
            const planRes = await Fetch({
              url: "/user-plan/get-user-plan-by-id",
              method: "POST",
              data: { user_id: user.user_id },
            });
            const plans = planRes.data.userPlan || [];
            const activePlan = plans.find((p) => p.current_status === "ACTIVE");
            let hasActivePlan = !!activePlan;
            let activePlanDetails = {};

            // Extract plan details if active plan exists
            if (activePlan && activePlan.plan) {
              activePlanDetails = {
                name: activePlan.plan.name,
                validity_from: activePlan.validity_from,
                validity_to: activePlan.validity_to,
              };
            }

            // Fetch attendance data to get class balance
            let classesRemaining = 0;
            try {
              const attendanceRes = await Fetch({
                url: `/class-attendance/api/attendance/${user.user_id}`,
                method: "GET",
              });

              if (attendanceRes.data && attendanceRes.data.length > 0) {
                // Find userPlanAttendance that matches the active plan's user_plan_id
                let userPlanAttendance = null;

                if (activePlan) {
                  // Search through all attendance records to find one matching the active plan
                  for (const record of attendanceRes.data) {
                    if (
                      record.userPlanAttendance &&
                      record.userPlanAttendance.status === "ACTIVE"
                    ) {
                      userPlanAttendance = record.userPlanAttendance;
                      break;
                    }
                  }
                }

                if (userPlanAttendance) {
                  classesRemaining =
                    userPlanAttendance.classes_allowed -
                    userPlanAttendance.classes_attended;
                }
              }
            } catch (e) {
              console.error("Failed to fetch attendance data", e);
            }

            // If classes remaining is 0, treat as no active plan
            if (classesRemaining === 0) {
              hasActivePlan = false;
            }

            return {
              ...user,
              hasActivePlan,
              classesRemaining,
              activePlanDetails,
            };
          } catch (e) {
            console.error("Failed to fetch plan for user", e);
            return {
              ...user,
              hasActivePlan: false,
              classesRemaining: 0,
              activePlanDetails: {},
            };
          }
        })
      );

      const sortedUsers = usersWithPlans.sort((a, b) => {
        if (a.hasActivePlan !== b.hasActivePlan) {
          return a.hasActivePlan ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      setClassUsers(sortedUsers);
    } catch (e) {
      console.error("Failed to load class users", e);
    }

    setLoadingUsers(false);
  };

  const groupClasses = (classes) => {
    const map = {};

    classes.forEach((c) => {
      const times = Array.isArray(c.recurring_start_time)
        ? c.recurring_start_time
        : [c.recurring_start_time];

      times.forEach((time) => {
        const key = `${c.zoom_class_name}__${time}`;

        if (!map[key]) {
          map[key] = {
            label: `${c.zoom_class_name} (${time})`,
            class_name: c.zoom_class_name,
            start_time: time,
            class_ids: [],
          };
        }

        map[key].class_ids.push(c.zoom_class_id);
      });
    });

    return Object.values(map);
  };

  const handleClassChange = (index) => {
    const group = classes[index];
    setSelectedClassIndex(index);
    setSelectedClassName(group.class_name);

    setSelectedStartTime(group.start_time);
    handleStartTimeChange(group.start_time);
    setSelectedUsers([]);

    loadClassUsers(group.class_ids);
  };

  const handleStartTimeChange = (time) => {
    setSelectedStartTime(time);

    if (!time) return;

    const [h, m] = time.split(":").map(Number);
    const minutes = h * 60 + m;
    const end = minutes + 60;
    const endH = String(Math.floor(end / 60)).padStart(2, "0");
    const endM = String(end % 60).padStart(2, "0");

    setEndTime(`${endH}:${endM}`);
    setDuration(60);
  };

  const toggleUser = (user) => {
    const exists = selectedUsers.find((u) => u.user_id === user.user_id);
    if (exists) {
      setSelectedUsers((prev) =>
        prev.filter((u) => u.user_id !== user.user_id)
      );
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const filteredUsers = classUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (
      !selectedClassName ||
      !selectedStartTime ||
      selectedUsers.length === 0 ||
      !selectedDate
    )
      return alert("Missing fields");

    const payload = {
      entries: {
        class_name: selectedClassName,
        class_type: "recurring",
        join_time: selectedStartTime,
        leave_time: endTime,
        duration_minutes: duration,
        date: selectedDate,
        users: selectedUsers.map((u) => ({
          user_id: u.user_id,
          plan_id: u.plan_id,
          user_plan_id: u.user_plan_id,
        })),
        institute_id: 3,
      },
    };

    try {
      await Fetch({
        url: "/class-attendance/admin/log-attendance-by-class",
        method: "POST",
        data: payload,
      });
      alert("Attendance saved!");
      setSelectedUsers([]);
    } catch (e) {
      console.error(e);
      alert("Error submitting attendance");
    }
  };

  const handleTriggerCron = async () => {
    setCronLoading(true);
    setCronMessage("");
    try {
      const res = await Fetch({
        url: "/cron/update-plan-statuses",
        method: "POST",
      });
      setCronMessage({
        type: "success",
        text: `Cron job executed successfully. ${res.data.userPlansUpdated} plans updated, ${res.data.attendanceRecordsUpdated} attendance records updated, ${res.data.emailsSent} emails sent.`,
      });
    } catch (e) {
      console.error("Failed to trigger cron job", e);
      setCronMessage({
        type: "error",
        text: "Failed to trigger cron job. Please try again.",
      });
    }
    setCronLoading(false);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: isMobile ? 1 : 2,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: isMobile ? 1 : 2 }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} mb={2}>
          Enter Attendance by Class
        </Typography>

        {/* CRON JOB CONTROLS */}
        <Card
          variant="outlined"
          sx={{
            p: isMobile ? 1.5 : 2,
            mb: 3,
            backgroundColor: "#f9f9f9",
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            Update Plan Statuses and Send Email Notifications
          </Typography>

          <Grid container spacing={isMobile ? 1.5 : 2} alignItems="flex-end">
            {/* <Grid item xs={12} sm={4}> 
               <TextField
                fullWidth
                label="Daily Run Time (IST)"
                type="time"
                value={cronTime}
                onChange={(e) => setCronTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size={isMobile ? "small" : "medium"}
                helperText="Default: 12:00 AM"
              />
            </Grid> */}

            <Grid item xs={12} sm={8}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTriggerCron}
                  disabled={cronLoading}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  {cronLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Running...
                    </>
                  ) : (
                    "Trigger Now"
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {cronMessage && (
            <Alert
              severity={cronMessage.type}
              sx={{ mt: 2 }}
              onClose={() => setCronMessage("")}
            >
              {cronMessage.text}
            </Alert>
          )}
        </Card>

        {/* CLASS SELECTION */}
        <Grid container spacing={isMobile ? 1.5 : 2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Class</InputLabel>
              <Select
                label="Class"
                value={selectedClassIndex}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                {loadingClasses ? (
                  <MenuItem>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  classes.map((c, i) => (
                    <MenuItem key={i} value={i}>
                      {c.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Class Name"
              value={selectedClassName}
              size={isMobile ? "small" : "medium"}
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedDate}
              size={isMobile ? "small" : "medium"}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Time"
              value={selectedStartTime}
              size={isMobile ? "small" : "medium"}
              disabled
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              label="End Time"
              value={endTime}
              size={isMobile ? "small" : "medium"}
              disabled
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              label="Duration"
              value={duration}
              size={isMobile ? "small" : "medium"}
              disabled
            />
          </Grid>
        </Grid>

        {/* USER SEARCH */}
        {selectedClassIndex !== "" && (
          <>
            <Typography
              mt={3}
              mb={1}
              fontWeight={600}
              variant={isMobile ? "body2" : "body1"}
            >
              Students in this class
            </Typography>

            <TextField
              fullWidth
              placeholder="Search student..."
              value={search}
              size={isMobile ? "small" : "medium"}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            {loadingUsers ? (
              <CircularProgress />
            ) : (
              <List
                dense={isMobile}
                sx={{
                  maxHeight: isMobile ? 250 : 300,
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: 1,
                }}
              >
                {filteredUsers.length === 0 && (
                  <Typography p={1}>No students found</Typography>
                )}

                {filteredUsers.map((u) => (
                  <ListItem
                    key={u.user_id}
                    disablePadding={isMobile}
                    secondaryAction={
                      <Checkbox
                        checked={
                          !!selectedUsers.find(
                            (sel) => sel.user_id === u.user_id
                          )
                        }
                        onChange={() => toggleUser(u)}
                      />
                    }
                    sx={{
                      border: !u.hasActivePlan ? "2px solid red" : "none",
                      borderRadius: 1,
                      mb: !u.hasActivePlan ? 1 : 0,
                      backgroundColor: !u.hasActivePlan
                        ? "rgba(255, 0, 0, 0.05)"
                        : "transparent",
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={
                          !!selectedUsers.find(
                            (sel) => sel.user_id === u.user_id
                          )
                        }
                        onChange={() => toggleUser(u)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${u.name} (ID: ${u.user_id})${!u.hasActivePlan ? " ⚠️ No Active Plan" : ""}`}
                      primaryTypographyProps={{
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: !u.hasActivePlan ? 600 : 400,
                        color: !u.hasActivePlan ? "error" : "inherit",
                      }}
                      secondary={`Phone: ${u.phone || "N/A"} | Classes Remaining: ${u.classesRemaining || 0}`}
                      secondaryTypographyProps={{
                        fontSize: isMobile ? 11 : 12,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {/* SELECTED USERS */}
        {selectedUsers.length > 0 && (
          <>
            <Typography mt={3} mb={1} fontWeight={600}>
              Selected Students ({selectedUsers.length})
            </Typography>

            <div style={{ overflowX: "auto" }}>
              <Table
                size="small"
                sx={{
                  minWidth: isMobile ? 600 : "100%",
                  border: "1px solid #eee",
                }}
              >
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Plan Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Validity From
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Validity To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Classes Remaining
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}> Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}> Email ID</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedUsers.map((u) => {
                    // Find the active plan details
                    const activePlanDetails = u.activePlanDetails || {};
                    const planName = activePlanDetails.name || "N/A";
                    const validityFrom = activePlanDetails.validity_from
                      ? new Date(
                          activePlanDetails.validity_from
                        ).toLocaleDateString()
                      : "N/A";
                    const validityTo = activePlanDetails.validity_to
                      ? new Date(
                          activePlanDetails.validity_to
                        ).toLocaleDateString()
                      : "N/A";

                    return (
                      <TableRow key={u.user_id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{planName}</TableCell>
                        <TableCell>{validityFrom}</TableCell>
                        <TableCell>{validityTo}</TableCell>
                        <TableCell>{u.classesRemaining || 0}</TableCell>
                        <TableCell>{u.phone || "N/A"}</TableCell>
                        <TableCell>{u.email || "N/A"}</TableCell>
                        <TableCell align="center">
                          <Button
                            color="error"
                            size={isMobile ? "small" : "medium"}
                            onClick={() =>
                              setSelectedUsers((prev) =>
                                prev.filter((x) => x.user_id !== u.user_id)
                              )
                            }
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* SUBMIT */}
        <Stack mt={3} direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            size={isMobile ? "small" : "medium"}
            fullWidth={isMobile}
            disabled={
              selectedClassIndex === "" ||
              !selectedStartTime ||
              !selectedDate ||
              selectedUsers.length === 0
            }
            onClick={handleSubmit}
          >
            Submit Attendance
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
