import { Add, Remove } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import { withAuth } from "../../../utils/withAuth";

function RegisterNewCustomizedPlan() {
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [userType, setUserType] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allInstitutes, setAllInstitutes] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [selectedInstitutes, setSelectedInstitutes] = useState([]);
  const [watchHours, setWatchHours] = useState(null);
  const [planValidity, setPlanValidity] = useState(null);
  const [prices, setPrices] = useState([]);
  const [chosenPlaylists, setChosenPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(10);

  useEffect(() => {
    console.log("allocations are :", allocations);
  }, [allocations]);

  const handleAddAllocation = () => {
    setAllocations([...allocations, { startDay: "", endDay: "" }]);
  };

  const handleRemoveAllocation = (index) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleAllocationChange = (index, field, value) => {
    setAllocations((prevAllocations) => {
      const newAllocations = [...prevAllocations];
      newAllocations[index][field] = value;

      return newAllocations;
    });
  };

  const handleEndDayChange = (index, value) => {
    setAllocations((prevAllocations) => {
      const newAllocations = [...prevAllocations];
      newAllocations[index]["endDay"] = value;

      // if (newAllocations[index + 1]) {
      // 	newAllocations[index + 1]["startDay"] = parseInt(value, 10) + 1;
      // }

      return newAllocations;
    });
  };

  // const handlePlaylistSelect = (index, playlist) => {
  //   const newAllocations = [...allocations];
  //   newAllocations[index].playlist = playlist;
  //   setAllocations(newAllocations);
  // };

  const handlePlaylistSelect = (index, playlist_id) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], playlist_id };
    setAllocations(newAllocations);
  };

  const filteredPlaylists = searchQuery
    ? allPlaylists.filter((playlist) =>
        playlist.playlist_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPlaylists;

  const handleNeedsChange = (event) => {
    setSelectedNeeds(event.target.value);
  };

  const handleModeChange = (event) => {
    setUserType(event.target.value);
  };

  const handleWatchChange = (event) => {
    setWatchHours(event.target.value);
  };

  const handleValidityChange = (event) => {
    setPlanValidity(Number(event.target.value));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/currency/get-all",
          method: "GET",
        });
        const data = response.data;
        console.log(data.currencies);
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
        const response = await Fetch({
          url: "/content/playlists/getAllPlaylists",
          method: "GET",
        });
        const data = response.data;
        setAllPlaylists(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-students",
          method: "GET",
        });
        const data = response.data;
        setAllStudents(data.users);
        setAllInstitutes([]);
      } catch (err) {
        console.log(err);
      }
    };
    const fetchData1 = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-institutes",
          method: "GET",
        });
        const data = response.data;
        setAllInstitutes(data.userInstituteData);
        setAllStudents([]);
      } catch (err) {
        console.log(err);
      }
    };
    if (userType === "student") {
      fetchData();
    } else if (userType === "institute") {
      fetchData1();
    }
  }, [userType]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = getFormData(event);
      formData["selectedNeeds"] = selectedNeeds;
      formData["watchHours"] = Number(watchHours);
      formData["planValidity"] = Number(planValidity);

      if (userType === "student") {
        formData["students"] = selectedStudents;
        formData["institutes"] = [];
      } else if (userType === "institute") {
        formData["institutes"] = selectedInstitutes;
        formData["students"] = [];
      }
      formData["prices"] = prices;

      formData["playlists"] = allocations.map((allo) => ({
        [allo.playlist_id]: [allo.startDay, allo.endDay],
      }));

      const res = await Fetch({
        url: "/customPlan/addCustomPlan",
        method: "POST",
        data: formData,
      });

      if (res.status === 200) {
        toast("New custom plan registered successfully!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectAllStudents = (event) => {
    if (event.target.checked) {
      const newSelected = allStudents.map((student) => student.user_id);
      setSelectedStudents(newSelected);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectOneStudent = (event, id) => {
    const selectedIndex = selectedStudents.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStudents, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedStudents.slice(1));
    } else if (selectedIndex === selectedStudents.length - 1) {
      newSelected = newSelected.concat(selectedStudents.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedStudents.slice(0, selectedIndex),
        selectedStudents.slice(selectedIndex + 1)
      );
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAllInstitutes = (event) => {
    if (event.target.checked) {
      const newSelected = allInstitutes.map(
        (institute) => institute.institute_id
      );
      setSelectedInstitutes(newSelected);
    } else {
      setSelectedInstitutes([]);
    }
  };

  const handleSelectOneInstitute = (event, id) => {
    const selectedIndex = selectedInstitutes.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedInstitutes, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedInstitutes.slice(1));
    } else if (selectedIndex === selectedInstitutes.length - 1) {
      newSelected = newSelected.concat(selectedInstitutes.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedInstitutes.slice(0, selectedIndex),
        selectedInstitutes.slice(selectedIndex + 1)
      );
    }
    setSelectedInstitutes(newSelected);
  };

  const handlePriceChange = (currency, value) => {
    setPrices({
      ...prices,
      [currency]: value,
    });
  };

  return (
    <AdminPageWrapper heading="Plan Management - Register Customized Plan">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          "& .MuiTextField-root": {
            mb: 2,
          },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#F0F5FF",
          },
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
          "&:hover": {
            boxShadow: 3,
          },
        }}
      >
        <Typography>Plan Name</Typography>
        <TextField
          name="plan_name"
          label="Enter Plan Name"
          variant="outlined"
          fullWidth
        />

        <br />
        <Typography>Choose Plan Requirements</Typography>
        <FormControl fullWidth>
          <InputLabel id="yoga-needs-label">
            Custom Plan Requirements
          </InputLabel>
          <Select
            labelId="yoga-label"
            multiple
            value={selectedNeeds}
            onChange={handleNeedsChange}
            required
          >
            <MenuItem value="Knee Pain">Knee Pain</MenuItem>
            <MenuItem value="Back Pain">Back Pain</MenuItem>
            <MenuItem value="Neck Pain">Neck Pain</MenuItem>
            <MenuItem value="Pranayama">Pranayama</MenuItem>
            <MenuItem value="Thyroid">Thyroid</MenuItem>

            <MenuItem value="Pre Natal Yoga">Pre Natal Yoga</MenuItem>
          </Select>
        </FormControl>
        <br />
        <Typography>Select User Type</Typography>
        <Select
          fullWidth
          placeholder="institute"
          onChange={handleModeChange}
          id="user_type"
        >
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="institute">Institute</MenuItem>
        </Select>
        <br />
        {userType === "student" && (
          <div>
            {" "}
            <Box
              sx={{
                "& .MuiTextField-root": {
                  mb: 2,
                },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F0F5FF",
                },
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
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              All Students
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedStudents.length > 0 &&
                            selectedStudents.length < allStudents.length
                          }
                          checked={
                            allStudents.length > 0 &&
                            selectedStudents.length === allStudents.length
                          }
                          onChange={handleSelectAllStudents}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allStudents.map((student) => {
                      const isItemSelected =
                        selectedStudents.indexOf(student.user_id) !== -1;
                      return (
                        <TableRow
                          key={student.user_id}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) =>
                                handleSelectOneStudent(event, student.user_id)
                              }
                            />
                          </TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <br />
                <Button fullWidth variant="contained" color="primary">
                  Assign
                </Button>
              </TableContainer>
            </Box>
          </div>
        )}
        {userType === "institute" && (
          <div>
            {" "}
            <Box
              sx={{
                "& .MuiTextField-root": {
                  mb: 2,
                },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F0F5FF",
                },
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
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              All Institutes
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedInstitutes.length > 0 &&
                            selectedInstitutes.length < allInstitutes.length
                          }
                          checked={
                            allInstitutes.length > 0 &&
                            selectedInstitutes.length === allInstitutes.length
                          }
                          onChange={handleSelectAllInstitutes}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allInstitutes.map((institute) => {
                      const isItemSelected =
                        selectedInstitutes.indexOf(
                          institute.institute.institute_id
                        ) !== -1;
                      return (
                        <TableRow
                          key={institute.institute.institute_id}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) =>
                                handleSelectOneInstitute(
                                  event,
                                  institute.institute.institute_id
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>{institute.institute.name}</TableCell>
                          <TableCell>{institute.institute.email}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <br />
                <Button fullWidth variant="contained" color="primary">
                  Assign
                </Button>
              </TableContainer>
            </Box>
          </div>
        )}
        <br />
        <Typography>Watch Hours</Typography>
        <Select fullWidth onChange={handleWatchChange} id="watch_hours">
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
          //   placeholder="institute"
          onChange={handleValidityChange}
          id="no_of_days"
        >
          <MenuItem value="10">10 Days</MenuItem>
          <MenuItem value="20">20 Days</MenuItem>
          <MenuItem value="30">30 Days</MenuItem>
          <MenuItem value="40">40 Days</MenuItem>
          <MenuItem value="50">50 Days</MenuItem>
          <MenuItem value="60">60 Days</MenuItem>
          <MenuItem value="70">70 Days</MenuItem>
          <MenuItem value="80">80 Days</MenuItem>
          <MenuItem value="90">90 Days</MenuItem>
        </Select>
        <br />
        <Typography variant="h5">Enter Prices</Typography>
        {currencies.map((currency) => (
          <TextField
            key={currency.currency_id}
            label={`Price in ${currency.name}`}
            type="number"
            value={prices[currency.currency_id] || ""}
            onChange={(e) =>
              handlePriceChange(currency.currency_id, e.target.value)
            }
            fullWidth
            sx={{ mt: 2 }}
          />
        ))}
        <br />
        <Typography>Allocate Playlists to Days</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddAllocation}
        >
          Add Allocation
        </Button>
        {/* {allocations.map((allocation, index) => (
          <Card key={index} style={{ marginTop: "16px" }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Select
                    fullWidth
                    value={
                      allocation.playlist ? allocation.playlist.playlist_id : ""
                    }
                    onChange={(e) =>
                      handlePlaylistSelect(
                        index,
                        filteredPlaylists.find(
                          (p) => p.playlist_id === e.target.value
                        )
                      )
                    }
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Playlist
                    </MenuItem>
                    {filteredPlaylists.map((playlist) => (
                      <MenuItem
                        key={playlist.playlist_id}
                        value={playlist.playlist_id}
                      >
                        {playlist.playlist_name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Start Day"
                    value={allocation.startDay}
                    onChange={(e) =>
                      handleAllocationChange(index, "startDay", e.target.value)
                    }
                    inputProps={{ min: 1, max: planValidity }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="End Day"
                    value={allocation.endDay}
                    onChange={(e) =>
                      handleAllocationChange(index, "endDay", e.target.value)
                    }
                    inputProps={{ min: 1, max: planValidity }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton onClick={() => handleRemoveAllocation(index)}>
                    <Remove />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))} */}

        {allocations.map((allocation, index) => (
          <Card key={index} style={{ marginTop: "16px" }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                {/* <Grid item xs={12} md={4}>
                  <Select
                    fullWidth
                    value={
                      allocation.playlist ? allocation.playlist.playlist_id : ""
                    }
                    onChange={(e) =>
                      handlePlaylistSelect(
                        index,
                        filteredPlaylists.find(
                          (p) => p.playlist_id === e.target.value
                        )
                      )
                    }
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Playlist
                    </MenuItem>
                    {filteredPlaylists.map((playlist) => (
                      <MenuItem
                        key={playlist.playlist_id}
                        value={playlist.playlist_id}
                      >
                        {playlist.playlist_name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid> */}

                <Grid item xs={12} md={4}>
                  <Select
                    fullWidth
                    value={allocation.playlist_id || ""}
                    onChange={(e) =>
                      handlePlaylistSelect(index, e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Playlist
                    </MenuItem>
                    {filteredPlaylists.map((playlist) => (
                      <MenuItem
                        key={playlist.playlist_id}
                        value={playlist.playlist_id}
                      >
                        {playlist.playlist_name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Select
                    fullWidth
                    value={allocation.startDay}
                    onChange={(e) =>
                      handleAllocationChange(index, "startDay", e.target.value)
                    }
                    displayEmpty
                    inputProps={{
                      min: 1,
                      max: planValidity,
                    }}
                  >
                    {[...Array(planValidity).keys()].map((day) => (
                      <MenuItem key={day + 1} value={day + 1}>
                        {day + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Select
                    fullWidth
                    value={allocation.endDay}
                    onChange={(e) => handleEndDayChange(index, e.target.value)}
                    displayEmpty
                    inputProps={{
                      min: 1,
                      max: planValidity,
                    }}
                  >
                    {[...Array(planValidity).keys()].map((day) => (
                      <MenuItem key={day + 1} value={day + 1}>
                        {day + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton onClick={() => handleRemoveAllocation(index)}>
                    <Remove />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
          {" "}
          Submit
        </Button>
      </Box>
    </AdminPageWrapper>
  );
}

export default withAuth(RegisterNewCustomizedPlan, ROLE_ROOT);
