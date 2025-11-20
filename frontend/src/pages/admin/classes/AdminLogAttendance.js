import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { Fetch } from "../../../utils/Fetch";

const emptyEntry = () => ({
  user_id: "",
  plan_id: "",
  user_plan_id: "",
  class_id: "",
  date: new Date().toISOString().slice(0, 16),
  attendance_status: "ATTENDED",
  join_time: "",
  leave_time: "",
  duration_minutes: "",
  instructor_id: "",
  remarks: "",
  device_id: "ADMIN_MANUAL",
  force: false,
});

export default function AdminLogAttendance() {
  const [entries, setEntries] = useState([emptyEntry()]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Dropdowns data
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await Fetch({
        url: "/user/get-all-students",
        method: "GET",
      });
      if (res.data.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await Fetch({
        url: "/zoom/api/classes",
        method: "GET",
      });
      if (Array.isArray(res.data)) {
        setClasses(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch user plan details when user is selected
  const handleUserSelect = async (index, userId) => {
    if (!userId) {
      updateEntry(index, "plan_id", "");
      updateEntry(index, "user_plan_id", "");
      return;
    }

    try {
      const res = await Fetch({
        url: "/user-plan/get-user-plan-by-id",
        method: "POST",
        data: { user_id: userId },
      });

      if (res.data.userPlan && res.data.userPlan.length > 0) {
        const activePlan =
          res.data.userPlan.find((up) => up.current_status === "ACTIVE") ||
          res.data.userPlan[0];
        updateEntry(index, {
          user_id: userId,
          plan_id: activePlan.plan_id,
          user_plan_id: activePlan.user_plan_id,
        });
      }
    } catch (err) {
      console.error("Failed to fetch user plan:", err);
    }
  };

  const updateEntry = (index, keyValue) => {
    const next = [...entries];
    Object.entries(keyValue).forEach(([key, value]) => {
      next[index][key] = value;
    });
    setEntries(next);
  };

  const addEntry = () => setEntries((s) => [...s, emptyEntry()]);
  const removeEntry = (index) =>
    setEntries((s) => s.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    for (const [i, en] of entries.entries()) {
      if (
        !en.user_id ||
        !en.plan_id ||
        !en.user_plan_id ||
        !en.class_id ||
        !en.date
      ) {
        setError(`Entry ${i + 1} missing required fields.`);
        return;
      }
    }

    const payloadEntries = entries.map((en) => ({
      ...en,
      join_time: en.join_time || null,
      leave_time: en.leave_time || null,
      duration_minutes: en.duration_minutes
        ? Number(en.duration_minutes)
        : null,
      force: !!en.force,
    }));

    setLoading(true);
    try {
      const res = await Fetch({
        url: "/class-attendance/admin/log-attendance",
        method: "POST",
        data: { entries: payloadEntries },
      });

      if (res.status === 200) {
        setResult(res.data);
        setError("");
      } else {
        setError(res.data.error || "Unknown server error");
        setResult(null);
      }
    } catch (err) {
      setError(err.message || "Network error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageWrapper heading={"Log Attendance Manually"}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3} mt={3}>
          {entries.map((entry, idx) => (
            <Card key={idx} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Entry {idx + 1}</Typography>

                  {/* Row 1: User Dropdown, Plan ID, User Plan ID */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>User</InputLabel>
                        <Select
                          label="User"
                          value={entry.user_id}
                          onChange={(e) =>
                            handleUserSelect(idx, Number(e.target.value))
                          }
                          disabled={loadingUsers}
                        >
                          {loadingUsers ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} />
                            </MenuItem>
                          ) : users.length > 0 ? (
                            users.map((user) => (
                              <MenuItem
                                key={user.user_id}
                                value={String(user.user_id)}
                              >
                                {user.name} ({user.user_id})
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No users available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Plan ID"
                        value={entry.plan_id}
                        disabled
                        helperText="Auto-populated from user"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="User Plan ID"
                        value={entry.user_plan_id}
                        disabled
                        helperText="Auto-populated from user"
                      />
                    </Grid>
                  </Grid>

                  {/* Row 2: Class Dropdown, Date, Status */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Class</InputLabel>
                        <Select
                          label="Class"
                          value={entry.class_id}
                          onChange={(e) =>
                            updateEntry(idx, { class_id: e.target.value })
                          }
                          disabled={loadingClasses}
                        >
                          {loadingClasses ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} />
                            </MenuItem>
                          ) : classes.length > 0 ? (
                            classes.map((cls) => (
                              <MenuItem
                                key={cls.zoom_class_id}
                                value={cls.zoom_class_id}
                              >
                                {cls.zoom_class_name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No classes available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="datetime-local"
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={entry.date}
                        onChange={(e) =>
                          updateEntry(idx, { date: e.target.value })
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          label="Status"
                          value={entry.attendance_status}
                          onChange={(e) =>
                            updateEntry(idx, {
                              attendance_status: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="ATTENDED">ATTENDED</MenuItem>
                          <MenuItem value="MISSED">MISSED</MenuItem>
                          <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Row 3 */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Join Time"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        value={entry.join_time}
                        onChange={(e) =>
                          updateEntry(idx, { join_time: e.target.value })
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Leave Time"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        value={entry.leave_time}
                        onChange={(e) =>
                          updateEntry(idx, { leave_time: e.target.value })
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Duration (minutes)"
                        value={entry.duration_minutes}
                        onChange={(e) =>
                          updateEntry(idx, { duration_minutes: e.target.value })
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* Row 4 */}
                  <Grid container spacing={2}>
                    {/* <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Instructor ID"
                        value={entry.instructor_id}
                        onChange={(e) =>
                          updateEntry(idx, { instructor_id: e.target.value })
                        }
                      />
                    </Grid> */}

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Remarks"
                        value={entry.remarks}
                        onChange={(e) =>
                          updateEntry(idx, { remarks: e.target.value })
                        }
                      />
                    </Grid>

                    {/* <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={entry.force}
                            onChange={(e) =>
                              updateEntry(idx, { force: e.target.checked })
                            }
                          />
                        }
                        label="Force"
                      />
                    </Grid> */}
                  </Grid>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeEntry(idx)}
                  >
                    Remove Entry
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={addEntry}>
              Add Entry
            </Button>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Stack>

          {error && <Typography color="error">{error}</Typography>}

          {result && (
            <Card variant="outlined">
              <CardContent>
                <Typography color="success.main">
                  {result.message || "Success"}
                </Typography>
                <pre
                  style={{ background: "#f5f5f5", padding: 8, marginTop: 8 }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </Stack>
      </form>
    </AdminPageWrapper>
  );
}
