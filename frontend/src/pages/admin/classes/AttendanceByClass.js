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
} from "@mui/material";
import { Fetch } from "../../../utils/Fetch";

export default function AttendanceByClass() {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [selectedClassIndex, setSelectedClassIndex] = useState(""); // Changed: store index
  const [selectedClassName, setSelectedClassName] = useState(""); // New: store class name
  const [selectedStartTime, setSelectedStartTime] = useState("");

  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  const [classUsers, setClassUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // fetch classes
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

  // load users enrolled in selected class
  const loadClassUsers = async (classIds) => {
    if (!classIds || classIds.length === 0) return;
    setLoadingUsers(true);

    try {
      const res = await Fetch({
        url: "/user/get-class-users",
        method: "POST",
        data: { class_ids: classIds }, // send array
      });

      setClassUsers(res.data.users || []);
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

  // When class changes → load times + users
  const handleClassChange = (index) => {
    const group = classes[index];
    console.log(group);
    setSelectedClassIndex(index);
    setSelectedClassName(group.class_name); // Set the class name

    // Auto-populate start time, end time, and duration
    setSelectedStartTime(group.start_time);
    handleStartTimeChange(group.start_time);
    setSelectedUsers([]);

    // Load users for ALL class_ids
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
    if (!selectedClass || !selectedStartTime || selectedUsers.length === 0)
      return alert("Missing fields");

    const payload = {
      class_name: selectedClassName,
      class_type: "recurring",
      join_time: selectedStartTime,
      leave_time: endTime,
      duration_minutes: duration,
      users: selectedUsers.map((u) => ({
        user_id: u.user_id,
        plan_id: u.plan_id,
        user_plan_id: u.user_plan_id,
      })),
      institute_id: 3,
    };

    try {
      const res = await Fetch({
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

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Enter Attendance by Class
        </Typography>

        {/* Row 1 - Class & Time */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
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

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Class Name"
              value={selectedClassName}
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Time"
              value={selectedStartTime}
              disabled
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField fullWidth label="End Time" value={endTime} disabled />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField fullWidth label="Duration" value={duration} disabled />
          </Grid>
        </Grid>

        {/* User Search */}
        {selectedClassIndex !== "" && (
          <>
            <Typography mt={3} mb={1} fontWeight={600}>
              Students in this class
            </Typography>

            <TextField
              fullWidth
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />

            {loadingUsers ? (
              <CircularProgress />
            ) : (
              <List
                dense
                sx={{
                  maxHeight: 250,
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
                    disablePadding
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
                      primary={`${u.name} (${u.user_id})`}
                      secondary={`Plan: ${u.plan_id} | UserPlan: ${u.user_plan_id}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}

        {/* Selected users table */}
        {selectedUsers.length > 0 && (
          <>
            <Typography mt={3} mb={1} fontWeight={600}>
              Selected Students
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Plan ID</TableCell>
                  <TableCell>User Plan ID</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedUsers.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.plan_id}</TableCell>
                    <TableCell>{u.user_plan_id}</TableCell>
                    <TableCell>
                      <Button
                        color="error"
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
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* Submit button */}
        <Stack mt={3} direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={
              selectedClassIndex === "" ||
              !selectedStartTime ||
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
