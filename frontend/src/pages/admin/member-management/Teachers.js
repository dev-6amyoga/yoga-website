import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import Papa from "papaparse";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const appendToUsers = (newUserData) => {
    setUsers((prevUsers) => [...prevUsers, newUserData]);
  };

  useEffect(() => {
    if (teachers.length > 0) {
      const fetchUserDetails = async () => {
        const promises = teachers.map(async (teacher) => {
          const response = await Fetch({
            url: "/user/get-by-id",
            method: "POST",
            data: { user_id: teacher.user_id },
          });
          if (response && response.status === 200) {
            appendToUsers(response.data.user);
          } else {
            toast("Error fetching user details. Please retry.", {
              type: "error",
            });
          }
        });

        await Promise.all(promises);
        setLoading(false);
      };

      fetchUserDetails();
    }
  }, [teachers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-teachers",
          method: "GET",
        });
        const sortedUsers = response.data.users.sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });
        setTeachers(sortedUsers);
      } catch (err) {
        console.error(err);
        toast("Error fetching teachers. Please try again.", { type: "error" });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDownload = () => {
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "teachers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminPageWrapper heading="Member Management - Teachers">
      <Box sx={{ padding: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <TextField
            label="Search Teachers"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flex: 1, marginRight: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleDownload}>
            Download CSV
          </Button>
        </Box>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : filteredUsers.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Teacher Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>No teachers found.</Typography>
        )}
      </Box>
    </AdminPageWrapper>
  );
}

export default withAuth(Teachers, ROLE_ROOT);
