import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Remove, Add } from "@mui/icons-material";
import { Fetch } from "../../../utils/Fetch";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { withAuth } from "../../../utils/withAuth";

function ViewAllCustomPlans() {
  const [customPlans, setCustomPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [userType, setUserType] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [allInstitutes, setAllInstitutes] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [selectedInstitutes, setSelectedInstitutes] = useState([]);
  const [watchHours, setWatchHours] = useState(null);
  const [planValidity, setPlanValidity] = useState(null);
  const [prices, setPrices] = useState([]);
  const [chosenPlaylists, setChosenPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(10);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNeedsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      selectedNeeds: e.target.value,
    }));
  };

  const handleModeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      userType: e.target.value,
    }));
  };

  const handleWatchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      watchHours: e.target.value,
    }));
  };

  const handleValidityChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      planValidity: e.target.value,
    }));
  };

  const handlePriceChange = (currencyId, value) => {
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [currencyId]: value,
      },
    }));
  };

  const handlePlaylistSelect = (index, value) => {
    const newAllocations = [...formData.allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      playlist_id: value,
    };
    setFormData((prev) => ({
      ...prev,
      allocations: newAllocations,
    }));
  };

  const handleAllocationChange = (index, field, value) => {
    const newAllocations = [...formData.allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      allocations: newAllocations,
    }));
  };

  const handleEndDayChange = (index, value) => {
    handleAllocationChange(index, "endDay", value);
  };

  const handleRemoveAllocation = (index) => {
    const newAllocations = formData.allocations.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      allocations: newAllocations,
    }));
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

  return (
    <AdminPageWrapper heading="Plan Management - View Customized Plans">
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
            {customPlans.map((plan) => (
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
                          // Find the matching playlist from allPlaylists using playlistId
                          const matchingPlaylist = allPlaylists.find(
                            (p) => p.playlist_id === parseInt(playlistId) // Convert playlistId to number if necessary
                          );

                          return (
                            <div key={playlistId}>
                              Playlist{" "}
                              {matchingPlaylist?.playlist_name || "Unknown"}:{" "}
                              {/* {playlistData.asanas.join(", ")} */}
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
              onChange={handleInputChange}
            />

            <Typography>Plan Description</Typography>
            <TextField
              name="plan_description"
              label="Enter Plan Description"
              variant="outlined"
              fullWidth
              value={formData.plan_description}
              onChange={handleInputChange}
            />

            <br />
            <Typography>Choose Plan Requirements</Typography>
            <FormControl fullWidth>
              <InputLabel id="yoga-needs-label">
                Custom Plan Requirements
              </InputLabel>
              <Select
                labelId="yoga-needs-label"
                multiple
                name="selectedNeeds"
                value={formData.selectedNeeds}
                onChange={handleNeedsChange}
                required
              >
                <MenuItem value="Knee Pain">Knee Pain</MenuItem>
                <MenuItem value="Back Pain">Back Pain</MenuItem>
                <MenuItem value="Neck Pain">Neck Pain</MenuItem>
                <MenuItem value="Pranayama">Pranayama</MenuItem>
                <MenuItem value="Thyroid">Thyroid</MenuItem>
                <MenuItem value="Parkinsons">Parkinsons</MenuItem>
                <MenuItem value="Pre Natal Yoga">Pre Natal Yoga</MenuItem>
              </Select>
            </FormControl>

            <br />
            <Typography>Select User Type</Typography>
            <Select
              fullWidth
              name="userType"
              value={formData.userType}
              onChange={handleModeChange}
              id="user_type"
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="institute">Institute</MenuItem>
            </Select>
            <br />
            <Typography>Watch Hours</Typography>
            <Select
              fullWidth
              name="watchHours"
              value={formData.watchHours}
              onChange={handleWatchChange}
              id="watch_hours"
            >
              <MenuItem value="10">10 Hours</MenuItem>
              <MenuItem value="20">20 Hours</MenuItem>
              <MenuItem value="30">30 Hours</MenuItem>
              <MenuItem value="40">40 Hours</MenuItem>
              <MenuItem value="50">50 Hours</MenuItem>
            </Select>

            <br />
            <Typography>Number of days</Typography>
            <Select
              fullWidth
              name="planValidity"
              value={formData.planValidity}
              onChange={handleValidityChange}
              id="no_of_days"
            >
              {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((day) => (
                <MenuItem key={day} value={day}>
                  {day} Days
                </MenuItem>
              ))}
            </Select>

            <br />
            <Typography variant="h5">Enter Prices</Typography>
            {currencies.map((currency) => (
              <TextField
                key={currency.currency_id}
                label={`Price in ${currency.name}`}
                type="number"
                value={formData.prices[currency.currency_id] || ""}
                onChange={(e) =>
                  handlePriceChange(currency.currency_id, e.target.value)
                }
                fullWidth
                sx={{ mt: 2 }}
              />
            ))}
            <br />
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "grey.600",
                "&:hover": { backgroundColor: "grey.500" },
                color: "white",
              }}
            >
              Submit
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
