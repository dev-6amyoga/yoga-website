import { Card, Input, Select, Spacer, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
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
  InputLabel,
} from "@mui/material";

function RegisterNewPlan() {
  const navigate = useNavigate();
  const [isChecked, setChecked] = useState(true);
  const notify = (x) => toast(x);
  const [selfVoiceStatus, setSelfVoiceStatus] = useState(true);
  const handler = (value) => {
    setSelfVoiceStatus(value);
  };
  const [userType, setUserType] = useState("");
  const handler1 = (value) => {
    setUserType(value);
  };
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleCheckboxChange = () => {
    setChecked(!isChecked);
    console.log(!isChecked);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-students",
          method: "GET",
        });
        const data = response.data;
        setAllStudents(data.users);
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
        setAllStudents(data.userInstituteData);
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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = allStudents.map(
        (student) => student.user_id || student.institute_id
      );
      setSelectedStudents(newSelected);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectOne = (event, id) => {
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

  const handleAssign = () => {
    console.log(selectedStudents);
    toast("Plan assigned to selected users!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const plan_name = document.querySelector("#plan_name").value;
    const playlist_6am = 1;
    const instituteplaylist_count = document.querySelector(
      "#institute_playlist_count"
    ).value;
    const institute_playlist_creation = isChecked ? 1 : 0;
    const teacher_count = document.querySelector("#teacher_count").value;
    const new_plan = {
      name: plan_name,
      has_basic_playlist: playlist_6am,
      playlist_creation_limit: instituteplaylist_count,
      number_of_teachers: teacher_count,
      has_self_audio_upload: selfVoiceStatus,
      has_playlist_creation: institute_playlist_creation,
      plan_user_type: userType,
      plan_validity: 0,
    };

    try {
      const response = await Fetch({
        url: "/plan/register",
        method: "POST",
        body: new_plan,
      });
      if (response?.status === 200) {
        notify("New Plan added successfully");
        console.log(response.data.plan);
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        const errorData = response.data;
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isSelected = (id) => selectedStudents.indexOf(id) !== -1;

  const [selectedMode, setSelectedMode] = useState(null);
  const handleModeChange = (event) => {
    setSelectedMode(event.target.value);
  };

  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const handleNeedsChange = (event) => {
    setSelectedNeeds(event.target.value);
  };
  return (
    <AdminPageWrapper heading="Plan Management - Register New Plan">
      <Card>
        <Text h3>Register New Plan</Text>
        <hr />
        <Spacer h={1} />

        <form className="flex flex-col gap-1" onSubmit={handleSubmit}>
          <Typography variant="h5">Plan Name:</Typography>
          <Input fullWidth id="plan_name" />
          <br />
          <Typography>Allow Playlist Creation</Typography>
          <Checkbox
            id="institute_playlist_creation"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <br />
          <Typography variant="h5">Institute Playlist Count:</Typography>
          <Input fullWidth id="institute_playlist_count" />
          <br />
          <Typography variant="h5">Self Voice Enabled?</Typography>
          <Select placeholder="Yes" onChange={handleModeChange} id="self_voice">
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
          <br />
          <Typography variant="h5">Teacher Count:</Typography>
          <Input fullWidth id="teacher_count" />
          <br />
          <Typography variant="h5">User Type</Typography>
          <Select
            placeholder="institute"
            onChange={handleModeChange}
            id="user_type"
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="institute">Institute</MenuItem>
          </Select>
          <br />
          <Button
            value="general"
            variant={selectedMode === "general" ? "contained" : "outlined"}
            onClick={handleModeChange}
          >
            General
          </Button>
          <Button
            value="customization"
            variant={
              selectedMode === "customization" ? "contained" : "outlined"
            }
            onClick={handleModeChange}
          >
            Customization
          </Button>
          {selectedMode === "customization" && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel sx={{ color: "grey.200" }} id="yoga-needs-label">
                Select Your Yoga Needs
              </InputLabel>
              <Select
                sx={{
                  color: "grey.200",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "grey.200",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "grey.200",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "grey.200",
                  },
                  ".MuiSvgIcon-root": { fill: "grey.200 !important" },
                }}
                labelId="yoga-needs-label"
                multiple
                value={selectedNeeds}
                onChange={handleNeedsChange}
                renderValue={(selected) => selected.join(", ")}
              >
                <MenuItem value="Knee Pain">Knee Pain</MenuItem>
                <MenuItem value="Back Pain">Back Pain</MenuItem>
                <MenuItem value="Neck Pain">Neck Pain</MenuItem>
                <MenuItem value="Pre Natal Yoga">Pre Natal Yoga</MenuItem>
              </Select>
            </FormControl>
          )}
          <br />
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
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allStudents.map((student) => {
                  const isItemSelected =
                    selectedStudents.indexOf(
                      student.user_id || student.institute_id
                    ) !== -1;
                  return (
                    <TableRow
                      key={student.user_id || student.institute_id}
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) =>
                            handleSelectOne(
                              event,
                              student.user_id || student.institute_id
                            )
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
            <Button onClick={handleAssign} variant="contained" color="primary">
              Assign
            </Button>
          </TableContainer>
          <br />
          <Button type="submit">Submit</Button>
        </form>
      </Card>
    </AdminPageWrapper>
  );
}

export default withAuth(RegisterNewPlan, ROLE_ROOT);
