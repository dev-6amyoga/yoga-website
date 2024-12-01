import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { Fetch } from "../../../utils/Fetch";
import Papa from "papaparse";

function LoginHistory() {
  const [loginHistories, setLoginHistories] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userIdNameMap, setUserIdNameMap] = useState({});
  const [filteredHistories, setFilteredHistories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Fetch({ url: "/user/get-all-users" });
        const data = response.data.users;
        setAllUsers(data);
        const userIdNameMap = data.reduce((map, user) => {
          map[user.user_id] = user.name;
          return map;
        }, {});
        setUserIdNameMap(userIdNameMap);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLoginHistories = async () => {
      try {
        const response = await Fetch({ url: "/auth/get-login-history" });
        const data = response.data;

        // Transform and sort by most recent login
        const transformedData = data
          .map((history) => ({
            ...history,
            user_name: userIdNameMap[history.user_id] || "Unknown User",
          }))
          .sort((a, b) => new Date(b.created) - new Date(a.created));

        setLoginHistories(transformedData);
        setFilteredHistories(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching login history:", error);
      }
    };
    fetchLoginHistories();
  }, [userIdNameMap]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = loginHistories.filter((history) =>
      history.user_name.toLowerCase().includes(query)
    );
    setFilteredHistories(filtered);
  };

  const handleDownloadCSV = () => {
    const csvData = Papa.unparse(filteredHistories);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "login_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminPageWrapper heading="Member Management - Login History">
      <Box sx={{ padding: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <TextField
            label="Search by User Name"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ flex: 1, marginRight: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadCSV}
          >
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
        ) : filteredHistories.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>User Agent</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>OS</TableCell>
                  <TableCell>Browser</TableCell>
                  <TableCell>Date and Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistories.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>{history.user_id}</TableCell>
                    <TableCell>{history.user_name}</TableCell>
                    <TableCell>{history.ip}</TableCell>
                    <TableCell>{history.user_agent}</TableCell>
                    <TableCell>{history.platform}</TableCell>
                    <TableCell>{history.os}</TableCell>
                    <TableCell>{history.browser}</TableCell>
                    <TableCell>
                      {new Date(history.created).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box textAlign="center">
            <Typography>No login history found.</Typography>
          </Box>
        )}
      </Box>
    </AdminPageWrapper>
  );
}

export default withAuth(LoginHistory, ROLE_ROOT);
