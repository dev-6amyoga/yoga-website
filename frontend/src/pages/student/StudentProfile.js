import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import ChangePassword from "../../components/student/UserSettings/ChangePassword";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { validateEmail, validatePhone } from "../../utils/formValidation";
import getFormData from "../../utils/getFormData";
import { withAuth } from "../../utils/withAuth";

function StudentProfile() {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };
  const user = useUserStore((state) => state.user);
  // const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [update, setUpdate] = useState(false);
  const [isEmailUpdate, setIsEmailUpdate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const closeUpdateHandler = (event) => {
    setUpdate(false);
  };

  useEffect(() => {
    Fetch({
      url: "/user/get-by-id",
      method: "POST",
      data: {
        user_id: user?.user_id,
      },
    }).then((res) => {
      if (res && res.status === 200) {
        setUserData(res.data.user);
      } else {
        toast("Error fetching profile details; retry", {
          type: "error",
        });
      }
    });
  }, [user]);

  const [formData, setFormData] = useState({
    name_profile: "",
    username_profile: "",
    email_profile: "",
    phone_profile: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
    } else {
      const formData = getFormData(e);
      if (
        formData.name_profile === "" &&
        formData.email_profile === "" &&
        formData.phone_profile === "" &&
        formData.username_profile === ""
      ) {
        toast("No changes to save!");
      } else if (
        formData.name_profile === userData.name &&
        formData.email_profile === userData.email &&
        formData.phone_profile === userData.phone &&
        formData.username_profile === userData.username
      ) {
        toast("No changes to save!");
      } else {
        setUpdate(true);
        setUpdateData(formData);
        setIsEditing(false);
      }
    }
  };

  const updateProfile = async () => {
    setUpdate(false);
    const updateData1 = {
      user_id: user?.user_id,
      name:
        updateData.name_profile !== ""
          ? updateData.name_profile
          : userData.name,
      username:
        updateData.username_profile !== ""
          ? updateData.username_profile
          : userData.username,

      email:
        updateData.email_profile !== ""
          ? updateData.email_profile
          : userData.email,
      phone:
        updateData.phone_profile !== ""
          ? updateData.phone_profile
          : userData.phone,
    };

    if (updateData.phone_profile) {
      const [validPhone, phoneError] = validatePhone(updateData.phone_profile);
      if (!validPhone) {
        toast(phoneError.message, { type: "error" });
        return;
      }
    }

    if (updateData.email_profile) {
      const [validEmail, emailError] = validateEmail(updateData.email_profile);
      if (!validEmail) {
        toast(emailError.message, { type: "error" });
        return;
      }
    }

    if (
      updateData.email_profile !== "" &&
      updateData.email_profile !== userData.email
    ) {
      setIsEmailUpdate(true);
      toast("Email Update");
    }
    setIsEditing(false);
    console.log(updateData1, "to be updated!");
    Fetch({
      url: "/user/update-profile",
      method: "POST",
      data: {
        user_id: updateData1.user_id,
        username: updateData1.username,
        name: updateData1.name,
        phone: updateData1.phone,
        email: updateData1.email,
      },
    })
      .then((res) => {
        console.log(res);
        toast("Updated!", { type: "success" });
      })
      .catch((err) => {
        toast(`Error : ${err.response.data.error}`, {
          type: "error",
        });
      });
  };

  const sendEmail = async () => {
    Fetch({
      url: "/update-request/register",
      method: "POST",
      data: {
        user_id: userData.user_id,
        username: userData.username,
        name: userData.name,
        old_email: userData.email,
        new_email: updateData.email_profile,
        phone: userData.phone,
        request_date: new Date(),
        is_approved: false,
      },
    })
      .then((res) => {
        console.log(res);
        toast("Update sent successfully", { type: "success" });
      })
      .catch((err) => {
        toast(`Error : ${err.response.data.error}`, {
          type: "error",
        });
      });
  };

  return (
    <StudentPageWrapper>
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Card sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <PersonIcon />
            </Avatar>
            <Typography variant="h4">Hello {user?.name}</Typography>
            <Typography variant="body1">
              Welcome to your profile page!
            </Typography>
          </Box>

          <Tabs value={tabIndex} onChange={handleTabChange} centered>
            <Tab label="Update Profile" />
            <Tab label="Change Password" />
          </Tabs>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {tabIndex === 0 && (
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <TextField
                  name="name_profile"
                  fullWidth
                  placeholder={formData.name_profile || userData?.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  name="username_profile"
                  placeholder={userData?.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="email_profile"
                  placeholder={userData?.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="phone_profile"
                  placeholder={userData?.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                  }}
                >
                  {isEditing ? (
                    <>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        sx={{ mr: 2 }} // Add right margin to the "Save" button
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outlined"
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outlined"
                      startIcon={<EditIcon />}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </form>
            )}

            {tabIndex === 1 && <ChangePassword />}
          </Box>
        </Card>
      </Container>

      {/* Update Confirmation Dialog */}
      <Dialog open={update} onClose={closeUpdateHandler}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Do you really wish to update your profile?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdate(false)}>No</Button>
          <Button onClick={updateProfile} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Update Request Card */}
      {isEmailUpdate && (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body1" align="center">
                We will send a request to the admin. Please
                <Button onClick={sendEmail} variant="contained" sx={{ ml: 1 }}>
                  Send A Request
                </Button>{" "}
                to update your Email ID.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      )}
    </StudentPageWrapper>
  );
}

export default withAuth(StudentProfile, ROLE_STUDENT);
