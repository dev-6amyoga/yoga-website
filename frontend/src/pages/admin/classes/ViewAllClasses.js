import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
} from "@mui/material";
import { Edit, Delete, ExpandMore, ExpandLess } from "@mui/icons-material";
import { Fetch } from "../../../utils/Fetch";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ViewAllClasses() {
  const [classes, setClasses] = useState([]);
  const [groupedClasses, setGroupedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [formData, setFormData] = useState({
    zoom_class_name: "",
    start_time: "",
    end_time: "",
    recurring_start_time: "",
    recurring_end_time: "",
    recurring_days: [],
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await Fetch({
        url: "/zoom/api/classes",
        method: "GET",
      });
      const classesData = res.data || [];
      setClasses(classesData);
      groupClasses(classesData);
    } catch (err) {
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const groupClasses = (classesData) => {
    const grouped = {};

    classesData.forEach((cls) => {
      // Create a unique key based on class name, institute_id, teacher_id, and recurring_start_time
      const key = `${cls.zoom_class_name}|${cls.institute_id}|${cls.teacher_id}|${cls.recurring_start_time}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...cls,
          plans: [],
        };
      }

      // Add the plan_id to the plans array
      if (cls.plan_id && !grouped[key].plans.includes(cls.plan_id)) {
        grouped[key].plans.push(cls.plan_id);
      }
    });

    setGroupedClasses(Object.values(grouped));
  };

  const handleEditClick = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      zoom_class_name: classItem.zoom_class_name,
      start_time: classItem.start_time ? classItem.start_time.slice(0, 16) : "",
      end_time: classItem.end_time ? classItem.end_time.slice(0, 16) : "",
      recurring_start_time: classItem.recurring_start_time || "",
      recurring_end_time: classItem.recurring_end_time || "",
      recurring_days: classItem.recurring_days || [],
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!formData.zoom_class_name.trim()) {
      toast.error("Class name is required");
      return;
    }

    try {
      const updatePayload = {
        zoom_class_name: formData.zoom_class_name,
      };

      if (editingClass.class_type === "one_time") {
        updatePayload.start_time = formData.start_time;
        updatePayload.end_time = formData.end_time;
      } else if (editingClass.class_type === "recurring") {
        updatePayload.recurring_start_time = formData.recurring_start_time;
        updatePayload.recurring_end_time = formData.recurring_end_time;
        updatePayload.recurring_days = formData.recurring_days;
      }

      const res = await Fetch({
        url: `/zoom/api/classes/${editingClass.zoom_class_id}`,
        method: "PUT",
        token: true,
        data: updatePayload,
      });

      if (res.status === 200) {
        toast.success("Class updated successfully");
        setEditDialogOpen(false);
        fetchClasses();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update class");
    }
  };

  const handleDeleteClick = (classId) => {
    setDeletingClassId(classId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await Fetch({
        url: `/zoom/api/classes/${deletingClassId}`,
        method: "DELETE",
        token: true,
      });

      if (res.status === 200) {
        toast.success("Class deleted successfully");
        setDeleteConfirmOpen(false);
        fetchClasses();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete class");
    } finally {
      setDeletingClassId(null);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleRecurringDay = (dayNum) => {
    setFormData((prev) => {
      const days = prev.recurring_days;
      if (days.includes(dayNum)) {
        return {
          ...prev,
          recurring_days: days.filter((d) => d !== dayNum),
        };
      } else {
        return {
          ...prev,
          recurring_days: [...days, dayNum],
        };
      }
    });
  };

  const toggleGroupExpand = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  if (loading) {
    return (
      <AdminPageWrapper heading="View All Classes">
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper heading="View All Classes">
      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell width="5%"></TableCell>
                <TableCell>Class Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Plans</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedClasses.map((groupItem, idx) => {
                const groupKey = `${groupItem.zoom_class_name}|${groupItem.institute_id}|${groupItem.teacher_id}|${groupItem.recurring_start_time}`;
                const isExpanded = expandedGroups[groupKey];
                const relatedClasses = classes.filter(
                  (cls) =>
                    cls.zoom_class_name === groupItem.zoom_class_name &&
                    cls.institute_id === groupItem.institute_id &&
                    cls.teacher_id === groupItem.teacher_id &&
                    cls.recurring_start_time === groupItem.recurring_start_time
                );

                return (
                  <React.Fragment key={idx}>
                    <TableRow sx={{ backgroundColor: "#fafafa" }}>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleGroupExpand(groupKey)}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {groupItem.zoom_class_name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={groupItem.class_type}
                          size="small"
                          color={
                            groupItem.class_type === "one_time"
                              ? "primary"
                              : "secondary"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {groupItem.class_type === "one_time" ? (
                          <>
                            <Typography variant="caption" display="block">
                              {new Date(groupItem.start_time).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              to {new Date(groupItem.end_time).toLocaleString()}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="caption" display="block">
                              {groupItem.recurring_days
                                ?.map((d) => weekdayLabels[d])
                                .join(", ")}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {groupItem.recurring_start_time} -{" "}
                              {groupItem.recurring_end_time}
                            </Typography>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
                        >
                          {groupItem.plans.map((planId) => (
                            <Chip
                              key={planId}
                              label={`Plan ${planId}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(groupItem)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteClick(groupItem.zoom_class_id)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row - Show all related classes */}
                    <TableRow>
                      <TableCell colSpan="6" sx={{ p: 0 }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Accessible by:
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Plan ID</TableCell>
                                  <TableCell>Zoom URL</TableCell>
                                  <TableCell>Meeting ID</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {relatedClasses.map((cls) => (
                                  <TableRow key={cls.zoom_class_id}>
                                    <TableCell>{cls.plan_id}</TableCell>
                                    <TableCell>
                                      <Tooltip title="Open Zoom URL">
                                        <Button
                                          size="small"
                                          variant="text"
                                          href={cls.zoom_url}
                                          target="_blank"
                                        >
                                          Join
                                        </Button>
                                      </Tooltip>
                                    </TableCell>
                                    <TableCell>{cls.zoom_meeting_id}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {groupedClasses.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="textSecondary">No classes found</Typography>
          </Box>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Class Name"
            fullWidth
            value={formData.zoom_class_name}
            onChange={(e) =>
              handleFormChange("zoom_class_name", e.target.value)
            }
            sx={{ mb: 2 }}
          />

          {editingClass?.class_type === "one_time" && (
            <>
              <TextField
                label="Start Time"
                type="datetime-local"
                fullWidth
                value={formData.start_time}
                onChange={(e) => handleFormChange("start_time", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="End Time"
                type="datetime-local"
                fullWidth
                value={formData.end_time}
                onChange={(e) => handleFormChange("end_time", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </>
          )}

          {editingClass?.class_type === "recurring" && (
            <>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={formData.recurring_start_time}
                onChange={(e) =>
                  handleFormChange("recurring_start_time", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={formData.recurring_end_time}
                onChange={(e) =>
                  handleFormChange("recurring_end_time", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Days
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {weekdayLabels.map((label, idx) => (
                  <Chip
                    key={idx}
                    label={label}
                    onClick={() => toggleRecurringDay(idx)}
                    color={
                      formData.recurring_days.includes(idx)
                        ? "primary"
                        : "default"
                    }
                    variant={
                      formData.recurring_days.includes(idx)
                        ? "filled"
                        : "outlined"
                    }
                  />
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this class? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  );
}
