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
  Autocomplete,
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

  const computeDuration = (join, leave) => {
    if (!join || !leave) return "";

    const [jh, jm] = join.split(":").map(Number);
    const [lh, lm] = leave.split(":").map(Number);

    const start = jh * 60 + jm;
    const end = lh * 60 + lm;

    if (end < start) return ""; // prevent negative duration

    return end - start;
  };

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
  const handleUserSelect = async (index, user) => {
    if (!user) {
      updateEntry(index, {
        user_id: "",
        plan_id: "",
        user_plan_id: "",
      });
      return;
    }

    try {
      const res = await Fetch({
        url: "/user-plan/get-user-plan-by-id",
        method: "POST",
        data: { user_id: user.user_id },
      });

      if (res.data.userPlan && res.data.userPlan.length > 0) {
        const activePlan =
          res.data.userPlan.find((up) => up.current_status === "ACTIVE") ||
          res.data.userPlan[0];
        updateEntry(index, {
          user_id: user.user_id,
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
    const updated = { ...next[index], ...keyValue };
    if ("join_time" in keyValue || "leave_time" in keyValue) {
      updated.duration_minutes = computeDuration(
        updated.join_time,
        updated.leave_time
      );
    }

    next[index] = updated;
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
        setEntries([emptyEntry()]);
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

  const getSelectedUser = (index) => {
    if (!entries[index].user_id) return null;
    return users.find((u) => u.user_id === entries[index].user_id) || null;
  };

  const isMobile = window.innerWidth < 600;

  return (
    <AdminPageWrapper heading={"Log Attendance Manually"}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={isMobile ? 2 : 3} mt={3}>
          {entries.map((entry, idx) => (
            <Card
              key={idx}
              variant="outlined"
              sx={{
                p: isMobile ? 1.5 : 2.5,
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                <Stack spacing={isMobile ? 1.5 : 2}>
                  <Typography variant="h6" fontSize={isMobile ? 16 : 20}>
                    Entry {idx + 1}
                  </Typography>

                  {/* Row 1 */}
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(option) =>
                          `${option.name} (${option.user_id})`
                        }
                        value={getSelectedUser(idx)}
                        onChange={(event, value) =>
                          handleUserSelect(idx, value)
                        }
                        loading={loadingUsers}
                        noOptionsText="No users found"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search User"
                            size={isMobile ? "small" : "medium"}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Plan ID"
                        value={entry.plan_id}
                        disabled
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="User Plan ID"
                        value={entry.user_plan_id}
                        disabled
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>

                  {/* Row 2 */}
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                      >
                        <InputLabel>Class</InputLabel>
                        <Select
                          label="Class"
                          value={entry.class_id}
                          onChange={(e) =>
                            updateEntry(idx, { class_id: e.target.value })
                          }
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
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                      >
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
                  <Grid container spacing={isMobile ? 1.5 : 2}>
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
                        size={isMobile ? "small" : "medium"}
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
                        size={isMobile ? "small" : "medium"}
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
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>

                  {/* Row 4 */}
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    <Grid item xs={12} sm={12}>
                      <TextField
                        fullWidth
                        label="Remarks"
                        value={entry.remarks}
                        onChange={(e) =>
                          updateEntry(idx, { remarks: e.target.value })
                        }
                        size={isMobile ? "small" : "medium"}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeEntry(idx)}
                    fullWidth={isMobile}
                  >
                    Remove Entry
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {/* Buttons */}
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            alignItems={isMobile ? "stretch" : "flex-start"}
          >
            <Button variant="contained" onClick={addEntry} fullWidth={isMobile}>
              Add Entry
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              fullWidth={isMobile}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Stack>

          {/* Error Message */}
          {error && (
            <Typography color="error" fontSize={isMobile ? 14 : 16}>
              {error}
            </Typography>
          )}

          {/* Result Card */}
          {result && (
            <Card variant="outlined" sx={{ mt: 2, p: isMobile ? 1 : 2 }}>
              <CardContent>
                <Typography color="success.main">
                  {result.message || "Success"}
                </Typography>

                <div
                  style={{
                    maxWidth: "100%",
                    overflowX: "auto",
                    marginTop: 8,
                    background: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </Stack>
      </form>
    </AdminPageWrapper>
  );
}
