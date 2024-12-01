import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import { Fetch } from "../../../utils/Fetch";
import Papa from "papaparse";

function UserPlanPage() {
  const [userPlans, setUserPlans] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [userIdNameMap, setUserIdNameMap] = useState({});
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-all-user-plans",
        });
        const data = response.data;
        setUserPlans(data.userplans);

        const userDetailsPromises = data.userplans.map((userPlan) =>
          Fetch({
            url: "/user/get-by-id",
            method: "POST",
            data: { user_id: userPlan.user_id },
          }).then((response) => response.data)
        );
        const userDetailsArray = await Promise.all(userDetailsPromises);
        setUserDetails(userDetailsArray);

        const userIdNameMapping = {};
        userDetailsArray.forEach((user) => {
          userIdNameMapping[user.user.user_id] = user.user.name;
        });
        setUserIdNameMap(userIdNameMapping);

        // Sort plans by most recent (validity_from)
        const sortedPlans = data.userplans.sort(
          (a, b) => new Date(b.validity_from) - new Date(a.validity_from)
        );
        setFilteredPlans(sortedPlans);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user plans or details:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = userPlans.filter((plan) =>
      (userIdNameMap[plan.user_id] || "").toLowerCase().includes(query)
    );
    setFilteredPlans(filtered);
  };

  const handleDownloadCSV = () => {
    const csvData = Papa.unparse(filteredPlans);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "user_plans.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columnsDataTable = useMemo(
    () => [
      {
        accessorKey: "user_id",
        header: ({ column }) => (
          <SortableColumn column={column}>User Name</SortableColumn>
        ),
        cell: ({ row }) => {
          const userId = row.original.user_id;
          return userIdNameMap[userId] || "Loading...";
        },
      },
      {
        accessorKey: "plan_id",
        header: ({ column }) => (
          <SortableColumn column={column}>Plan ID</SortableColumn>
        ),
      },
      {
        accessorKey: "validity_from",
        header: ({ column }) => (
          <SortableColumn column={column}>Start Date</SortableColumn>
        ),
      },
      {
        accessorKey: "validity_to",
        header: ({ column }) => (
          <SortableColumn column={column}>End Date</SortableColumn>
        ),
      },
    ],
    [userIdNameMap]
  );

  return (
    <AdminPageWrapper heading="Member Management - User Plans">
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
        ) : filteredPlans.length > 0 ? (
          <Paper>
            <DataTable columns={columnsDataTable} data={filteredPlans} />
          </Paper>
        ) : (
          <Box textAlign="center">
            <Typography>No user plans found.</Typography>
          </Box>
        )}
      </Box>
    </AdminPageWrapper>
  );
}

export default withAuth(UserPlanPage, ROLE_ROOT);
