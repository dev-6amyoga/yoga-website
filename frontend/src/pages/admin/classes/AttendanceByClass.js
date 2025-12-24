import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ListItem,
  ListItemText,
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
import { useVirtualizer } from "@tanstack/react-virtual";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  const [cronLoading, setCronLoading] = useState(false);
  const [cronMessage, setCronMessage] = useState("");

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* -------------------- API -------------------- */

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await Fetch({ url: "/zoom/api/classes", method: "GET" });
      setClasses(groupClasses(res.data || []));
    } catch (e) {
      console.error(e);
    }
    setLoadingClasses(false);
  };

  const loadClassUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await Fetch({ url: "/user/get-class-users", method: "GET" });
      setClassUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingUsers(false);
  };

  /* -------------------- HELPERS -------------------- */

  const groupClasses = (classes) => {
    const map = {};
    classes.forEach((c) => {
      const times = Array.isArray(c.recurring_start_time)
        ? c.recurring_start_time
        : [c.recurring_start_time];

      times.forEach((time) => {
        const key = `${c.zoom_class_name}_${time}`;
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
    setSelectedUserIds(new Set());
    loadClassUsers();
  };

  const handleStartTimeChange = (time) => {
    if (!time) return;
    const [h, m] = time.split(":").map(Number);
    const end = h * 60 + m + 60;
    setEndTime(
      `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(
        end % 60
      ).padStart(2, "0")}`
    );
    setDuration(60);
  };

  const toggleUser = useCallback((userId) => {
    setSelectedUserIds((prev) => {
      const copy = new Set(prev);
      copy.has(userId) ? copy.delete(userId) : copy.add(userId);
      return copy;
    });
  }, []);

  /* -------------------- MEMOIZED DATA -------------------- */

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return classUsers;
    const s = debouncedSearch.toLowerCase();
    return classUsers.filter((u) => u.name.toLowerCase().includes(s));
  }, [classUsers, debouncedSearch]);

  const selectedUsers = useMemo(() => {
    return classUsers.filter((u) => selectedUserIds.has(u.user_id));
  }, [classUsers, selectedUserIds]);

  /* -------------------- VIRTUAL ROW -------------------- */

  const parentRef = React.useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isMobile ? 88 : 64),
    overscan: 10,
  });

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    if (!selectedUsers.length) return alert("No users selected");

    await Fetch({
      url: "/class-attendance/admin/log-attendance-by-class",
      method: "POST",
      data: {
        entries: {
          class_name: selectedClassName,
          class_type: "recurring",
          join_time: selectedStartTime,
          leave_time: endTime,
          duration_minutes: duration,
          date: selectedDate,
          institute_id: 3,
          users: selectedUsers.map((u) => ({
            user_id: u.user_id,
            plan_id: u.plan_id,
            user_plan_id: u.user_plan_id,
          })),
        },
      },
    });

    alert("Attendance saved!");
    setSelectedUserIds(new Set());
  };

  /* -------------------- UI -------------------- */

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">Enter Attendance by Class</Typography>

        {/* CLASS SELECT */}
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClassIndex}
                label="Class"
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
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* USERS */}
        {selectedClassIndex !== "" && (
          <>
            <TextField
              fullWidth
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mt: 2, mb: 1 }}
            />

            {loadingUsers ? (
              <CircularProgress />
            ) : (
              <div
                ref={parentRef}
                style={{
                  height: isMobile ? 250 : 350,
                  overflow: "auto",
                  border: "1px solid #eee",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const u = filteredUsers[virtualRow.index];
                    const noPlan =
                      u.classes_allowed === 0 || u.classes_allowed === null;
                    const checked = selectedUserIds.has(u.user_id);

                    return (
                      <div
                        key={u.user_id}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <ListItem
                          secondaryAction={
                            <Checkbox
                              checked={checked}
                              onChange={() => toggleUser(u.user_id)}
                            />
                          }
                          sx={{
                            border: noPlan ? "2px solid red" : "none",
                            backgroundColor: noPlan
                              ? "rgba(255,0,0,0.05)"
                              : "transparent",
                          }}
                        >
                          <ListItemText
                            primary={`${u.name} (ID: ${u.user_id})${
                              noPlan ? " ⚠️ No Active Plan" : ""
                            }`}
                            secondary={`Phone: ${u.phone || "N/A"} | Remaining: ${
                              u.classes_remaining || 0
                            }`}
                          />
                        </ListItem>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* SELECTED TABLE */}
        {selectedUsers.length > 0 && (
          <>
            <Typography mt={3} fontWeight={600}>
              Selected Students ({selectedUsers.length})
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Validity</TableCell>
                  <TableCell>Remaining</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedUsers.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.plan_name}</TableCell>
                    <TableCell>
                      {u.validity_from
                        ? new Date(u.validity_from).toLocaleDateString()
                        : "N/A"}{" "}
                      –{" "}
                      {u.validity_to
                        ? new Date(u.validity_to).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{u.classes_remaining || 0}</TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        onClick={() => toggleUser(u.user_id)}
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

        <Stack mt={3} alignItems="flex-end">
          <Button
            variant="contained"
            disabled={!selectedUsers.length}
            onClick={handleSubmit}
          >
            Submit Attendance
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
