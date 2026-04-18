import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Alert,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";

function EditUserDetails() {
  const [students, setStudents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);
      const response = await Fetch({
        url: "/user/get-all-students",
        method: "GET",
      });
      const data = response.data;
      const sortedUsers = data.users.sort((a, b) => {
        return new Date(b.created) - new Date(a.created);
      });
      setStudents(sortedUsers);
      setFilteredData(sortedUsers);
      setPage(0); // Reset to first page
      setFetchingStudents(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
      setFetchingStudents(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setPage(0); // Reset to first page on search

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.username.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term),
      );
      setFilteredData(filtered);
    }, 300);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      username: student.username,
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Update profile (name and username)
      console.log("Updating profile with data:", {
        user_id: selectedStudent.user_id,
        name: formData.name,
        username: formData.username,
      });
      await Fetch({
        url: "/user/update-profile",
        method: "POST",
        data: {
          user_id: selectedStudent.user_id,
          name: formData.name,
          username: formData.username,
        },
      });

      // Update password if provided
      if (formData.password) {
        await Fetch({
          url: "/user/reset-password",
          method: "POST",
          data: {
            user_id: selectedStudent.user_id,
            new_password: formData.password,
            confirm_new_password: formData.confirmPassword,
          },
        });
      }

      toast.success("User details updated successfully");
      handleDialogClose();
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update user details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Memoized paginated data to avoid recalculating on every render
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPage]);

  return (
    <AdminPageWrapper heading="Member Management - Edit User Details">
      <Box
        sx={{ marginBottom: 3, display: "flex", gap: 2, alignItems: "center" }}
      >
        <TextField
          label="Search by name, username, or email"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ maxWidth: 400 }}
        />
        <Box sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
          Total: {filteredData.length} student
          {filteredData.length !== 1 ? "s" : ""}
        </Box>
      </Box>

      <Card sx={{ padding: 2 }}>
        {fetchingStudents ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: "600px", overflowY: "auto" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((student) => (
                      <TableRow key={student.user_id}>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleEditClick(student)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        sx={{ textAlign: "center", py: 3 }}
                      >
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User Details - {selectedStudent?.name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Leave password fields empty to keep the current password unchanged.
          </Alert>

          <TextField
            autoFocus
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            error={!!errors.username}
            helperText={errors.username}
          />

          <TextField
            label="New Password (Optional)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  );
}

export default withAuth(EditUserDetails, ROLE_ROOT);
