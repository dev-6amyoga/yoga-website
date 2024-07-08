import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Box,
  Card,
  Container,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import ChangePassword from "../../components/student/UserSettings/ChangePassword";
import UpdateContactDetails from "../../components/student/UserSettings/UpdateContactDetails";
import UpdateProfile from "../../components/student/UserSettings/UpdateProfile";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { withAuth } from "../../utils/withAuth";
import { UpdateEmailForm } from "../../components/student/UserSettings/UpdateEmailForm";
import UpdatePhoneForm from "../../components/student/UserSettings/UpdatePhoneForm";

function StudentProfile() {
  const user = useUserStore((state) => state.user);
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  useEffect(() => {
    setTabIndex(0);
  }, []);

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
            <Tab label="Profile" />
            <Tab label="Change Email" />
            <Tab label="Change Phone" />
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
            {tabIndex === 0 && <UpdateProfile />}
            {tabIndex === 1 && <UpdateEmailForm />}
            {tabIndex === 2 && <UpdatePhoneForm />}
            {tabIndex === 3 && <ChangePassword />}
          </Box>
        </Card>
      </Container>
    </StudentPageWrapper>
  );
}

export default withAuth(StudentProfile, ROLE_STUDENT);
