import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Typography,
  MenuItem,
  FormControl,
  Box,
  TextField,
  Select,
  InputLabel,
  Tooltip,
  CardContent,
  Card,
  Grid,
  IconButton,
} from "@mui/material";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { useEffect, useState } from "react";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import AllPlaylists from "../../../components/content-management/AllPlaylists";
import { toast } from "react-toastify";
import { Add, Remove } from "@mui/icons-material";

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

  const handleAddPlaylist = (playlist) => {
    setChosenPlaylists([...chosenPlaylists, playlist]);
  };

  const handleRemovePlaylist = (playlistId) => {
    setChosenPlaylists(
      chosenPlaylists.filter((p) => p.playlist_id !== playlistId)
    );
  };

  const handleAddAllocation = () => {
    setAllocations([
      ...allocations,
      { playlist: null, startDay: "", endDay: "" },
    ]);
  };

  const handleRemoveAllocation = (index) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleAllocationChange = (index, field, value) => {
    const newAllocations = [...allocations];
    newAllocations[index][field] = value;
    setAllocations(newAllocations);
  };

  const handlePlaylistSelect = (index, playlist) => {
    const newAllocations = [...allocations];
    newAllocations[index].playlist = playlist;
    setAllocations(newAllocations);
  };

  const filteredPlaylists = searchQuery
    ? allPlaylists.filter((playlist) =>
        playlist.playlist_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPlaylists;

  // const handleAddPlaylist = (playlist) => {
  //   if (!chosenPlaylists.find((p) => p.playlist_id === playlist.playlist_id)) {
  //     setChosenPlaylists([...chosenPlaylists, playlist]);
  //   }
  // };

  // const handleRemovePlaylist = (playlistId) => {
  //   setChosenPlaylists(
  //     chosenPlaylists.filter((playlist) => playlist.playlist_id !== playlistId)
  //   );
  // };

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
    setPlanValidity(event.target.value);
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
    formData["playlists"] = chosenPlaylists;
    try {
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
        {/* <Typography>Choose Playlist(s) to allocate to the plan</Typography>
        <br />
        <div className="mb-4">
          <TextField
            label="Search Playlists"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-center gap-4 px-4 pb-4 max-h-72 overflow-x-auto">
          {filteredPlaylists.map((playlist) => {
            const isAdded = chosenPlaylists.some(
              (p) => p.playlist_id === playlist.playlist_id
            );

            return (
              <div
                key={playlist.playlist_id}
                id={playlist.playlist_id}
                className={
                  "w-80 border flex-shrink-0 flex flex-col items-center gap-2 p-2 hover:cursor-pointer hover:bg-blue-100 transition-colors bg-blue-100"
                }
              >
                <div className="flex flex-col gap-1">
                  <Tooltip title={playlist.playlist_name}>
                    <p className="font-medium text-sm">
                      {playlist.playlist_name.substring(0, 45)}..
                    </p>
                  </Tooltip>
                  <Button
                    variant="contained"
                    onClick={() =>
                      isAdded
                        ? handleRemovePlaylist(playlist.playlist_id)
                        : handleAddPlaylist(playlist)
                    }
                  >
                    {isAdded ? "Remove" : "Add"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <br />
        <div>
          <Typography>Chosen Playlists</Typography>
          <Card>
            {" "}
            {chosenPlaylists.map((playlist) => (
              <CardContent>
                <Typography>{playlist.playlist_name}</Typography>
              </CardContent>
            ))}
          </Card>
        </div>
        <br /> */}
        <Typography>Choose Playlist(s) to allocate to the plan</Typography>
        <br />
        {/* <div className="mb-4">
          <TextField
            label="Search Playlists"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}
        {/* <div className="flex flex-col items-center gap-4 px-4 pb-4 max-h-72 overflow-x-auto">
          {filteredPlaylists.map((playlist) => {
            const isAdded = chosenPlaylists.some(
              (p) => p.playlist_id === playlist.playlist_id
            );

            return (
              <div
                key={playlist.playlist_id}
                id={playlist.playlist_id}
                className={
                  "w-80 border flex-shrink-0 flex flex-col items-center gap-2 p-2 hover:cursor-pointer hover:bg-blue-100 transition-colors bg-blue-100"
                }
              >
                <div className="flex flex-col gap-1">
                  <Tooltip title={playlist.playlist_name}>
                    <p className="font-medium text-sm">
                      {playlist.playlist_name.substring(0, 45)}..
                    </p>
                  </Tooltip>
                  <Button
                    variant="contained"
                    onClick={() =>
                      isAdded
                        ? handleRemovePlaylist(playlist.playlist_id)
                        : handleAddPlaylist(playlist)
                    }
                  >
                    {isAdded ? "Remove" : "Add"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div> */}
        <br />
        <Typography>Allocate Playlists to Days</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddAllocation}
        >
          Add Allocation
        </Button>
        {allocations.map((allocation, index) => (
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
                    inputProps={{ min: 1, max: numberOfDays }}
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
                    inputProps={{ min: 1, max: numberOfDays }}
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
        ))}
        <br />
        {/* <div>
          <Typography>Chosen Playlists</Typography>
          <Card>
            {chosenPlaylists.map((playlist) => (
              <CardContent key={playlist.playlist_id}>
                <Typography>{playlist.playlist_name}</Typography>
              </CardContent>
            ))}
          </Card>
        </div> */}
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
