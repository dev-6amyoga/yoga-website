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

  return (
    <AdminPageWrapper heading="Plan Management - Register New Plan">
      <Card>
        <Text h3>Register New Plan</Text>
        <hr />
        <Spacer h={1} />
        <form className="flex flex-col gap-1" onSubmit={handleSubmit}>
          <Typography h5>Plan Name:</Typography>
          <Input width="100%" id="plan_name"></Input>
          <br />
          <Typography> Allow Playlist Creation</Typography>
          <Checkbox
            id="institute_playlist_creation"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <br />

          <Typography h5>Institute Playlist Count:</Typography>
          <Input width="100%" id="institute_playlist_count"></Input>
          <br />

          <Typography h5>Self Voice Enabled?</Typography>
          <Select placeholder="Yes" onChange={handler} id="self_voice">
            <Select.Option value="Yes"> Yes </Select.Option>
            <Select.Option value="No"> No </Select.Option>
          </Select>
          <br />

          <Typography h5>Teacher Count:</Typography>
          <Input width="100%" id="teacher_count"></Input>
          <br />

          <Typography h5>User Type</Typography>
          <Select placeholder="institute" onChange={handler1} id="user_type">
            <Select.Option value="student"> Student </Select.Option>
            <Select.Option value="institute"> Institute </Select.Option>
          </Select>

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
                  {/* Add more columns as needed */}
                </TableRow>
              </TableHead>
              <TableBody>
                {allStudents.map((student) => {
                  const isItemSelected = isSelected(
                    student.user_id || student.institute_id
                  );
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

          <Button htmlType="submit">Submit</Button>
        </form>
      </Card>
    </AdminPageWrapper>
  );
}

export default withAuth(RegisterNewPlan, ROLE_ROOT);
