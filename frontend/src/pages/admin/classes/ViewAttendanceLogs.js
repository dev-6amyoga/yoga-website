import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  Typography,
  Stack,
  Paper,
  TableContainer,
  Checkbox,
} from "@mui/material";
import { Fetch } from "../../../utils/Fetch";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import TeacherPageWrapper from "../../../components/Common/TeacherPageWrapper";
export default function ViewAttendanceLogs({ adminRole = false }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [classes, setClasses] = useState([]);
  const [classGroupMap, setClassGroupMap] = useState({}); // Maps classKey to array of zoom_class_ids
  const [selectedClassKey, setSelectedClassKey] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState(new Set());
  const [allClasses, setAllClasses] = useState([]);

  // Dialog states
  const [addStudentDialog, setAddStudentDialog] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [addStudentSearchQuery, setAddStudentSearchQuery] = useState("");
  const [addStudentPage, setAddStudentPage] = useState(0);
  const [addStudentRowsPerPage, setAddStudentRowsPerPage] = useState(25);

  const [transferDialog, setTransferDialog] = useState(false);
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [availableClassesForTransferDate, setAvailableClassesForTransferDate] =
    useState([]);
  const [transferClassGroupMap, setTransferClassGroupMap] = useState({});
  const [transferTargetClassKey, setTransferTargetClassKey] = useState("");

  // Confirmation dialogs
  const [confirmAddDialog, setConfirmAddDialog] = useState(false);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState(false);
  const [confirmRemoveAllDialog, setConfirmRemoveAllDialog] = useState(false);
  const [confirmTransferDialog, setConfirmTransferDialog] = useState(false);
  const [operationDetails, setOperationDetails] = useState(null);

  useEffect(() => {
    fetchClassesForDate();
    fetchAllClasses();
  }, [selectedDate]);

  useEffect(() => {
    if (selectedClassKey) {
      fetchAttendees();
    }
  }, [selectedClassKey]);

  const fetchAllClasses = async () => {
    try {
      const res = await Fetch({ url: "/zoom/api/classes", method: "GET" });
      setAllClasses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClassesForDate = async () => {
    setLoading(true);
    try {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();

      const res = await Fetch({ url: "/zoom/api/classes", method: "GET" });
      const rawClasses = res.data || [];

      // Filter classes for this day
      const classesOnDay = rawClasses.filter((c) =>
        c.recurring_days?.includes(dayOfWeek),
      );

      // Group by class name and start time (deduplicates)
      const groupMap = {};
      const uniqueClasses = [];

      classesOnDay.forEach((c) => {
        const key = `${c.zoom_class_name}_${c.recurring_start_time}`;
        if (!groupMap[key]) {
          groupMap[key] = [];
          uniqueClasses.push({
            key,
            zoom_class_name: c.zoom_class_name,
            recurring_start_time: c.recurring_start_time,
            class_type: c.class_type,
            plan_id: c.plan_id,
          });
        }
        groupMap[key].push(c.zoom_class_id);
      });

      setClasses(uniqueClasses);
      setClassGroupMap(groupMap);
      setSelectedClassKey("");
      setAttendees([]);
      setSelectedAttendees(new Set());
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const nextDay = new Date(startOfDay);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get all class_ids for this class key
      const classIds = classGroupMap[selectedClassKey] || [];

      const res = await Fetch({
        url: "/class-attendance/get-by-class-date",
        method: "POST",
        data: {
          class_ids: classIds,
          date: selectedDate,
        },
      });

      setAttendees(res.data.attendance || []);
      setSelectedAttendees(new Set());
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch attendees");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransferClasses = async (dateStr) => {
    try {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();

      const res = await Fetch({ url: "/zoom/api/classes", method: "GET" });
      const rawClasses = res.data || [];

      // Filter classes for this day
      const classesOnDay = rawClasses.filter((c) =>
        c.recurring_days?.includes(dayOfWeek),
      );

      // Group by class name and start time (deduplicates)
      const groupMap = {};
      const uniqueClasses = [];

      classesOnDay.forEach((c) => {
        const key = `${c.zoom_class_name}_${c.recurring_start_time}`;
        if (!groupMap[key]) {
          groupMap[key] = [];
          uniqueClasses.push({
            key,
            zoom_class_name: c.zoom_class_name,
            recurring_start_time: c.recurring_start_time,
            class_type: c.class_type,
            plan_id: c.plan_id,
          });
        }
        groupMap[key].push(c.zoom_class_id);
      });

      setAvailableClassesForTransferDate(uniqueClasses);
      setTransferClassGroupMap(groupMap);
      setTransferTargetClassKey("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch transfer classes");
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const res = await Fetch({
        url: "/user/get-all-students",
        method: "GET",
      });

      const attendeeIds = new Set(attendees.map((a) => a.user_id));
      const available = res.data.users.filter(
        (u) => !attendeeIds.has(u.user_id),
      );
      setAvailableStudents(available);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch available students");
    }
  };

  const handleAddStudentsDialog = () => {
    setAddStudentSearchQuery("");
    setAddStudentPage(0);
    fetchAvailableStudents();
    setAddStudentDialog(true);
  };

  const handleAddStudentsClick = () => {
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student");
      return;
    }

    const studentsToAdd = Array.from(selectedStudents)
      .map((userId) => availableStudents.find((s) => s.user_id === userId))
      .filter(Boolean);

    const selectedClass = classes.find((c) => c.key === selectedClassKey);

    setOperationDetails({
      type: "add",
      students: studentsToAdd,
      className: selectedClass.zoom_class_name,
      date: selectedDate,
    });
    setConfirmAddDialog(true);
  };

  const handleAddStudents = async () => {
    if (!operationDetails || operationDetails.type !== "add") return;

    try {
      const selectedClass = classes.find((c) => c.key === selectedClassKey);

      // For each student, fetch their active plan before adding
      const studentsToAdd = [];
      for (const student of operationDetails.students) {
        try {
          // Fetch student's active plan
          const planRes = await Fetch({
            url: "/user-plan/get-active-user-plan-by-id",
            method: "POST",
            data: {
              user_id: student.user_id,
            },
          });

          const activePlan = planRes.data?.[0]; // Returns an array
          studentsToAdd.push({
            user_id: student.user_id,
            plan_id: activePlan?.plan_id || null,
            user_plan_id: activePlan?.user_plan_id || null,
          });
        } catch (e) {
          // If no active plan found, add with null values
          console.warn(`No active plan found for user ${student.user_id}`, e);
          studentsToAdd.push({
            user_id: student.user_id,
            plan_id: null,
            user_plan_id: null,
          });
        }
      }

      await Fetch({
        url: "/class-attendance/admin/log-attendance-by-class",
        method: "POST",
        data: {
          entries: {
            class_name: selectedClass.zoom_class_name,
            class_type: selectedClass.class_type,
            join_time: selectedClass.recurring_start_time,
            date: selectedDate,
            institute_id: 3,
            users: studentsToAdd,
          },
        },
      });

      toast.success("Students added successfully");
      setConfirmAddDialog(false);
      setAddStudentDialog(false);
      setSelectedStudents(new Set());
      setOperationDetails(null);
      fetchAttendees();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to add students");
      setConfirmAddDialog(false);
    }
  };

  const handleRemoveStudentClick = (userId) => {
    const student = attendees.find((a) => a.user_id === userId);
    setOperationDetails({
      type: "remove",
      students: [student],
    });
    setConfirmRemoveDialog(true);
  };

  const handleRemoveStudent = async () => {
    if (!operationDetails || operationDetails.type !== "remove") return;

    try {
      const classIds = classGroupMap[selectedClassKey] || [];
      const userId = operationDetails.students[0].user_id;

      await Fetch({
        url: "/class-attendance/delete",
        method: "POST",
        data: {
          user_id: userId,
          class_ids: classIds,
          date: selectedDate,
        },
      });

      toast.success("Student removed successfully");
      setConfirmRemoveDialog(false);
      setOperationDetails(null);
      fetchAttendees();
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove student");
      setConfirmRemoveDialog(false);
    }
  };

  const handleRemoveAllStudentsClick = () => {
    setOperationDetails({
      type: "removeAll",
      students: attendees,
    });
    setConfirmRemoveAllDialog(true);
  };

  const handleRemoveAllStudents = async () => {
    if (!operationDetails || operationDetails.type !== "removeAll") return;

    try {
      const classIds = classGroupMap[selectedClassKey] || [];
      for (const attendee of operationDetails.students) {
        await Fetch({
          url: "/class-attendance/delete",
          method: "POST",
          data: {
            user_id: attendee.user_id,
            class_ids: classIds,
            date: selectedDate,
          },
        });
      }

      toast.success("All students removed successfully");
      setConfirmRemoveAllDialog(false);
      setOperationDetails(null);
      fetchAttendees();
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove all students");
      setConfirmRemoveAllDialog(false);
    }
  };

  const handleTransferDialogOpen = () => {
    if (selectedAttendees.size === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setTransferDialog(true);
  };

  const handleTransferStudentsClick = () => {
    if (!transferTargetClassKey) {
      toast.error("Please select a target class");
      return;
    }

    const selectedClass = availableClassesForTransferDate.find(
      (c) => c.key === transferTargetClassKey,
    );
    const studentsToTransfer = attendees.filter((a) =>
      selectedAttendees.has(a.user_id),
    );
    const currentClass = classes.find((c) => c.key === selectedClassKey);

    setOperationDetails({
      type: "transfer",
      students: studentsToTransfer,
      fromClass: currentClass?.zoom_class_name,
      toClass: selectedClass?.zoom_class_name,
      targetClass: selectedClass,
      transferDate: transferDate,
    });
    setTransferDialog(false);
    setConfirmTransferDialog(true);
  };

  const handleTransferStudents = async () => {
    if (!operationDetails || operationDetails.type !== "transfer") return;

    try {
      const targetClass = operationDetails.targetClass;
      const studentsToTransfer = operationDetails.students;
      const transferDate = operationDetails.transferDate;

      // Add to new class with transfer date
      // The backend will resolve the correct class_id based on plan_id
      await Fetch({
        url: "/class-attendance/admin/log-attendance-by-class",
        method: "POST",
        data: {
          entries: {
            class_name: targetClass.zoom_class_name,
            class_type: targetClass.class_type,
            join_time: targetClass.recurring_start_time,
            date: transferDate,
            institute_id: 3,
            users: studentsToTransfer.map((s) => ({
              user_id: s.user_id,
              plan_id: s.plan_id || 999,
              user_plan_id: s.user_plan_id || 999,
            })),
          },
        },
      });

      // Remove from old class (using original selected date)
      const classIds = classGroupMap[selectedClassKey] || [];
      for (const student of studentsToTransfer) {
        await Fetch({
          url: "/class-attendance/delete",
          method: "POST",
          data: {
            user_id: student.user_id,
            class_ids: classIds,
            date: selectedDate,
          },
        });
      }

      toast.success("Students transferred successfully");
      setConfirmTransferDialog(false);
      setTransferTargetClassKey("");
      setTransferDate(new Date().toISOString().split("T")[0]);
      setSelectedAttendees(new Set());
      setOperationDetails(null);
      fetchAttendees();
    } catch (e) {
      console.error(e);
      toast.error("Failed to transfer students");
      setConfirmTransferDialog(false);
    }
  };

  // Filter students based on search query
  const filteredAddStudents = useMemo(() => {
    if (!addStudentSearchQuery.trim()) return availableStudents;
    const query = addStudentSearchQuery.toLowerCase();
    return availableStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.user_id?.toString().includes(query),
    );
  }, [availableStudents, addStudentSearchQuery]);

  // Paginate filtered students
  const paginatedAddStudents = useMemo(() => {
    const start = addStudentPage * addStudentRowsPerPage;
    return filteredAddStudents.slice(start, start + addStudentRowsPerPage);
  }, [filteredAddStudents, addStudentPage, addStudentRowsPerPage]);

  const handleSelectAttendee = (userId) => {
    const newSelected = new Set(selectedAttendees);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedAttendees(newSelected);
  };

  const handleSelectStudent = (userId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedStudents(newSelected);
  };
  const Wrapper = adminRole ? AdminPageWrapper : TeacherPageWrapper;

  return (
    <Wrapper heading="Class Management - View Attendance Logs">
      <Card sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Date and Class
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <TextField
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />

          {loading && classes.length === 0 ? (
            <CircularProgress />
          ) : classes.length > 0 ? (
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClassKey}
                label="Class"
                onChange={(e) => setSelectedClassKey(e.target.value)}
              >
                {classes.map((c) => (
                  <MenuItem key={c.key} value={c.key}>
                    {c.zoom_class_name} ({c.recurring_start_time})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Alert severity="info">No classes scheduled for this date</Alert>
          )}
        </Box>
      </Card>

      {/* ATTENDEES TABLE */}
      {selectedClassKey && (
        <Card sx={{ padding: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Attendees ({attendees.length})
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddStudentsDialog}
                >
                  + Add Student
                </Button>

                {selectedAttendees.size > 0 && (
                  <>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        const studentsToRemove = attendees.filter((a) =>
                          selectedAttendees.has(a.user_id),
                        );
                        setOperationDetails({
                          type: "removeSelected",
                          students: studentsToRemove,
                        });
                        setConfirmRemoveDialog(true);
                      }}
                    >
                      Remove Selected ({selectedAttendees.size})
                    </Button>

                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleTransferDialogOpen}
                    >
                      Transfer Selected ({selectedAttendees.size})
                    </Button>
                  </>
                )}

                {attendees.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleRemoveAllStudentsClick}
                  >
                    Remove All
                  </Button>
                )}
              </Stack>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedAttendees.size > 0 &&
                            selectedAttendees.size < attendees.length
                          }
                          checked={
                            attendees.length > 0 &&
                            selectedAttendees.size === attendees.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttendees(
                                new Set(attendees.map((a) => a.user_id)),
                              );
                            } else {
                              setSelectedAttendees(new Set());
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>User ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone No.</TableCell>
                      <TableCell>Join Time</TableCell>
                      <TableCell>Attendance Type</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendees.length > 0 ? (
                      attendees.map((attendee) => (
                        <TableRow key={attendee.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedAttendees.has(attendee.user_id)}
                              onChange={() =>
                                handleSelectAttendee(attendee.user_id)
                              }
                            />
                          </TableCell>
                          <TableCell>{attendee.user_id}</TableCell>
                          <TableCell>{attendee.user_name}</TableCell>
                          <TableCell>{attendee.user_phone}</TableCell>
                          <TableCell>
                            {attendee.join_time
                              ? new Date(
                                  attendee.join_time,
                                ).toLocaleTimeString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <span
                              style={{
                                backgroundColor:
                                  attendee.device_id === "ADMIN_MANUAL"
                                    ? "#ffebee"
                                    : "#e8f5e9",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: "500",
                                color:
                                  attendee.device_id === "ADMIN_MANUAL"
                                    ? "#c62828"
                                    : "#2e7d32",
                              }}
                            >
                              {attendee.device_id === "ADMIN_MANUAL"
                                ? "Offline"
                                : "Online"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                handleRemoveStudentClick(attendee.user_id)
                              }
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          sx={{ textAlign: "center", py: 3 }}
                        >
                          No attendees for this class
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Card>
      )}

      {/* ADD STUDENT DIALOG */}
      <Dialog
        open={addStudentDialog}
        onClose={() => setAddStudentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Students to Class</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 0 }}>
          {/* Search Box */}
          <TextField
            placeholder="Search by name, email, or ID..."
            fullWidth
            size="small"
            value={addStudentSearchQuery}
            onChange={(e) => {
              setAddStudentSearchQuery(e.target.value);
              setAddStudentPage(0); // Reset to first page on search
            }}
            sx={{ mb: 2 }}
            variant="outlined"
          />

          {/* Results Info */}
          <Typography
            variant="caption"
            sx={{ color: "gray", mb: 1, display: "block" }}
          >
            Showing {paginatedAddStudents.length} of{" "}
            {filteredAddStudents.length} available students
          </Typography>

          {/* Table */}
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 50 }}>
                    <Checkbox
                      indeterminate={
                        paginatedAddStudents.some((s) =>
                          selectedStudents.has(s.user_id),
                        ) &&
                        paginatedAddStudents.some(
                          (s) => !selectedStudents.has(s.user_id),
                        )
                      }
                      checked={
                        paginatedAddStudents.length > 0 &&
                        paginatedAddStudents.every((s) =>
                          selectedStudents.has(s.user_id),
                        )
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelected = new Set(selectedStudents);
                          paginatedAddStudents.forEach((s) =>
                            newSelected.add(s.user_id),
                          );
                          setSelectedStudents(newSelected);
                        } else {
                          const newSelected = new Set(selectedStudents);
                          paginatedAddStudents.forEach((s) =>
                            newSelected.delete(s.user_id),
                          );
                          setSelectedStudents(newSelected);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAddStudents.map((student) => (
                  <TableRow key={student.user_id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.has(student.user_id)}
                        onChange={() => handleSelectStudent(student.user_id)}
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Select
              size="small"
              value={addStudentRowsPerPage}
              onChange={(e) => {
                setAddStudentRowsPerPage(e.target.value);
                setAddStudentPage(0);
              }}
              sx={{ width: 100 }}
            >
              <MenuItem value={10}>10 rows</MenuItem>
              <MenuItem value={25}>25 rows</MenuItem>
              <MenuItem value={50}>50 rows</MenuItem>
              <MenuItem value={100}>100 rows</MenuItem>
            </Select>
            <Typography variant="caption">
              Page {addStudentPage + 1} of{" "}
              {Math.ceil(filteredAddStudents.length / addStudentRowsPerPage) ||
                1}
            </Typography>
            <Stack direction="row" gap={1}>
              <Button
                size="small"
                disabled={addStudentPage === 0}
                onClick={() => setAddStudentPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="small"
                disabled={
                  addStudentPage >=
                  Math.ceil(
                    filteredAddStudents.length / addStudentRowsPerPage,
                  ) -
                    1
                }
                onClick={() => setAddStudentPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ mt: 2 }}>
          <Button
            onClick={() => {
              setAddStudentDialog(false);
              setAddStudentSearchQuery("");
              setAddStudentPage(0);
              setSelectedStudents(new Set());
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddStudentsClick}
            disabled={selectedStudents.size === 0}
          >
            Add {selectedStudents.size > 0 ? selectedStudents.size : ""} Student
            {selectedStudents.size !== 1 ? "s" : ""}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TRANSFER DIALOG */}
      <Dialog
        open={transferDialog}
        onClose={() => setTransferDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Transfer {selectedAttendees.size} Student
          {selectedAttendees.size !== 1 ? "s" : ""}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Transfer Date Picker */}
          <TextField
            label="Select Transfer Date"
            type="date"
            value={transferDate}
            onChange={(e) => {
              setTransferDate(e.target.value);
              setTransferTargetClassKey(""); // Reset class selection when date changes
              fetchTransferClasses(e.target.value);
            }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Target Class Selector */}
          <FormControl
            fullWidth
            disabled={
              !transferDate || availableClassesForTransferDate.length === 0
            }
          >
            <InputLabel>Target Class</InputLabel>
            <Select
              value={transferTargetClassKey}
              label="Target Class"
              onChange={(e) => setTransferTargetClassKey(e.target.value)}
            >
              {availableClassesForTransferDate
                .filter((c) => c.key !== selectedClassKey)
                .map((c) => (
                  <MenuItem key={c.key} value={c.key}>
                    {c.zoom_class_name} ({c.recurring_start_time})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {availableClassesForTransferDate.length === 0 && transferDate && (
            <Typography variant="caption" color="warning.main">
              No classes scheduled on this date
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setTransferDialog(false);
              setTransferTargetClassKey("");
              setTransferDate(new Date().toISOString().split("T")[0]);
              setAvailableClassesForTransferDate([]);
              setTransferClassGroupMap({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTransferStudentsClick}
            disabled={!transferTargetClassKey}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM ADD STUDENTS DIALOG */}
      <Dialog
        open={confirmAddDialog}
        onClose={() => setConfirmAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Confirm Adding Students
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
              <strong>Class:</strong> {operationDetails?.className}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              <strong>Date:</strong> {operationDetails?.date}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Students to be added ({operationDetails?.students?.length}):
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto", pl: 1 }}>
              {operationDetails?.students?.map((student) => (
                <Typography
                  key={student.user_id}
                  variant="body2"
                  sx={{ mb: 1 }}
                >
                  • {student.name} ({student.email})
                </Typography>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddStudents}
          >
            Confirm Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM REMOVE DIALOG */}
      <Dialog
        open={
          confirmRemoveDialog &&
          operationDetails?.type !== "removeSelected" &&
          operationDetails?.type !== "removeAll"
        }
        onClose={() => setConfirmRemoveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Confirm Removing Student
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              <strong>Date:</strong> {selectedDate}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Student to be removed:
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto", pl: 1 }}>
              {operationDetails?.students?.map((student) => (
                <Typography
                  key={student.user_id}
                  variant="body2"
                  sx={{ mb: 1 }}
                >
                  • {student.user_name} ({student.user_email})
                </Typography>
              ))}
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "#d32f2f", fontStyle: "italic" }}
            >
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveStudent}
          >
            Confirm Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM REMOVE SELECTED DIALOG */}
      <Dialog
        open={
          confirmRemoveDialog && operationDetails?.type === "removeSelected"
        }
        onClose={() => setConfirmRemoveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Confirm Removing Selected Students
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              <strong>Date:</strong> {selectedDate}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Students to be removed ({operationDetails?.students?.length}):
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto", pl: 1 }}>
              {operationDetails?.students?.map((student) => (
                <Typography
                  key={student.user_id}
                  variant="body2"
                  sx={{ mb: 1 }}
                >
                  • {student.user_name} ({student.user_email})
                </Typography>
              ))}
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "#d32f2f", fontStyle: "italic" }}
            >
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveStudent}
          >
            Confirm Remove All
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM REMOVE ALL DIALOG */}
      <Dialog
        open={confirmRemoveAllDialog}
        onClose={() => setConfirmRemoveAllDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#d32f2f" }}>
          Confirm Removing All Students
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              <strong>Date:</strong> {selectedDate}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              All students will be removed from this class (
              {operationDetails?.students?.length} students):
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto", pl: 1 }}>
              {operationDetails?.students?.map((student) => (
                <Typography
                  key={student.user_id}
                  variant="body2"
                  sx={{ mb: 1 }}
                >
                  • {student.user_name} ({student.user_email})
                </Typography>
              ))}
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 2, color: "#d32f2f", fontStyle: "italic" }}
            >
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveAllDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveAllStudents}
          >
            Confirm Remove All
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM TRANSFER DIALOG */}
      <Dialog
        open={confirmTransferDialog}
        onClose={() => setConfirmTransferDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#f57c00" }}>
          Confirm Transferring Students
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
              <strong>From Date:</strong> {selectedDate}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              <strong>From Class:</strong> {operationDetails?.fromClass}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              <strong>To Class:</strong> {operationDetails?.toClass}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              <strong>To Date:</strong> {operationDetails?.transferDate}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Students to be transferred ({operationDetails?.students?.length}):
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto", pl: 1 }}>
              {operationDetails?.students?.map((student) => (
                <Typography
                  key={student.user_id}
                  variant="body2"
                  sx={{ mb: 1 }}
                >
                  • {student.user_name} ({student.user_email})
                </Typography>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTransferDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleTransferStudents}
          >
            Confirm Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Wrapper>
  );
}
