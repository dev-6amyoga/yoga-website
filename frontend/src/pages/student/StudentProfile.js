import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import ChangePassword from "../../components/student/UserSettings/ChangePassword";
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
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        <Card
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 5 },
              bgcolor: "grey.50",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "primary.main",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {user?.name || "Your Profile"}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Manage your account details and security settings.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {user?.email}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Profile" />
              <Tab label="Email" />
              <Tab label="Phone" />
              <Tab label="Password" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {tabIndex === 0 && <UpdateProfile />}
            {tabIndex === 1 && <UpdateEmailForm />}
            {tabIndex === 2 && <UpdatePhoneForm />}
            {tabIndex === 3 && <ChangePassword />}
          </CardContent>
        </Card>
      </Container>
    </StudentPageWrapper>
  );
}

export default withAuth(StudentProfile, ROLE_STUDENT);
