import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import Papa from "papaparse";
import { Fetch } from "../../../utils/Fetch";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";

function ViewAllCustomPlans() {
  const [customPlans, setCustomPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [formData, setFormData] = useState({
    plan_name: "",
    plan_description: "",
    selectedNeeds: [],
    userType: "",
    watchHours: "",
    planValidity: "",
    prices: {},
    allocations: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/currency/get-all",
          method: "GET",
        });
        const data = response.data;
        setCurrencies(data.currencies);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playlistsResponse] = await Promise.all([
          Fetch({ url: "/content/playlists/getAllPlaylists" }),
        ]);
        setAllPlaylists(playlistsResponse.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/customPlan/getAllCustomPlans",
          method: "GET",
        });
        const data = response.data;
        setCustomPlans(data.custom_plans);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (planId) => {
    const plan = customPlans.find((p) => p._id.$oid === planId);
    if (plan) {
      setFormData({
        plan_name: plan.plan_name,
        plan_description: plan.plan_description,
        selectedNeeds: plan.selectedNeeds,
        userType: plan.userType || "student",
        watchHours: plan.watchHours,
        planValidity: plan.planValidity,
        prices: plan.prices,
        allocations: plan.allocations,
      });
      setSelectedPlan(plan);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Fetch({
        url: `/customPlan/editCustomPlan/${selectedPlan._id}`,
        method: "PUT",
        body: formData,
      });
      handleClose();
    } catch (err) {
      console.log(err);
    }
  };

  // Filter customPlans based on the search term
  const filteredPlans = customPlans.filter((plan) => {
    return plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDownloadCSV = () => {
    const csvData = customPlans.map((plan) => ({
      ID: plan.custom_plan_id,
      Name: plan.plan_name,
      Description: plan.plan_description,
      "Selected Needs": plan.selectedNeeds.join(", "),
      Prices: plan.prices
        .map((price) => `${price.currency_id}: ${price.amount}`)
        .join(", "),
      Playlists: plan.playlists
        .map((playlist) => playlist.playlist_name)
        .join(", "),
      Validity: plan.planValidity,
      Students: plan.students.join(", "),
      "Watch Hours": plan.watchHours,
    }));

    // Convert the data to CSV format
    const csv = Papa.unparse(csvData);
    // Trigger download
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csv)}`;
    link.target = "_blank";
    link.download = "custom_plans.csv";
    link.click();
  };

  return (
    <AdminPageWrapper heading="Plan Management - View Customized Plans">
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          label="Search Plans"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          sx={{ maxWidth: 400 }}
        />
        <Button variant="contained" color="primary" onClick={handleDownloadCSV}>
          Download CSV
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Plan Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Selected Needs</TableCell>
              <TableCell>Prices</TableCell>
              <TableCell>Playlists</TableCell>
              <TableCell>Validity</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Watch Hours</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlans.map((plan) => (
              <TableRow key={plan._id.$oid}>
                <TableCell>{plan.custom_plan_id}</TableCell>
                <TableCell>{plan.plan_name}</TableCell>
                <TableCell>{plan.plan_description}</TableCell>
                <TableCell>{plan.selectedNeeds.join(", ")}</TableCell>
                <TableCell>
                  {plan.prices.map((price, index) => (
                    <div key={index}>
                      {Object.entries(price).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {plan.playlists.map((playlist, index) => (
                    <div key={index}>
                      {Object.entries(playlist).map(
                        ([playlistId, playlistData]) => {
                          const matchingPlaylist = allPlaylists.find(
                            (p) => p.playlist_id === parseInt(playlistId)
                          );
                          return (
                            <div key={playlistId}>
                              Playlist{" "}
                              {matchingPlaylist?.playlist_name || "Unknown"}
                            </div>
                          );
                        }
                      )}
                    </div>
                  ))}
                </TableCell>
                <TableCell>{plan.planValidity} days</TableCell>
                <TableCell>{plan.students.join(", ")}</TableCell>
                <TableCell>{plan.watchHours} hours</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(plan._id.$oid)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Custom Plan</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              "& .MuiTextField-root": { mb: 2 },
              "& .MuiOutlinedInput-root": { backgroundColor: "#F0F5FF" },
              p: 3,
              border: "1px solid",
              borderColor: "#AAC0DB",
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "justify",
              boxShadow: 0,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: 3 },
            }}
          >
            <Typography>Plan Name</Typography>
            <TextField
              name="plan_name"
              label="Enter Plan Name"
              variant="outlined"
              fullWidth
              value={formData.plan_name}
              onChange={(e) =>
                setFormData({ ...formData, plan_name: e.target.value })
              }
            />

            {/* Add other form fields here */}
            <Button type="submit" variant="contained">
              Finish
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  );
}

export default withAuth(ViewAllCustomPlans, ROLE_ROOT);
