import App from "../App";
import PageWrapper from "../components/Common/PageWrapper";
import NotFound from "../pages/common/NotFound";
import Unauthorized from "../pages/common/Unauthorized";
import Privacy from "../pages/general/Privacy";
import TermsAndConditions from "../pages/general/TermsAndConditions";
import PlansAndPricing from "../pages/general/PlansAndPricing";
import Cancellations from "../pages/general/Cancellations";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const ContactCard = () => {
  const contactMethods = [
    {
      icon: <LocalPhoneOutlinedIcon />,
      label: "Phone",
      value: "+91 98448 54007",
      href: "tel:+919844854007",
      action: "Call us",
    },
    {
      icon: <EmailOutlinedIcon />,
      label: "Email",
      value: "dev.6amyoga@gmail.com",
      href: "mailto:dev.6amyoga@gmail.com",
      action: "Send email",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        bgcolor: "#f7f8fb",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <Stack spacing={3} sx={{ height: "100%" }}>
              <Box>
                <Chip
                  label="Contact"
                  sx={{
                    mb: 2,
                    bgcolor: "#e8f2ef",
                    color: "#1f6f5b",
                    fontWeight: 700,
                  }}
                />
                <Typography
                  component="h1"
                  sx={{
                    color: "#101828",
                    fontSize: { xs: 34, md: 48 },
                    fontWeight: 800,
                    lineHeight: 1.08,
                    mb: 2,
                  }}
                >
                  We are here to help.
                </Typography>
                <Typography
                  sx={{
                    color: "#5f6b7a",
                    fontSize: { xs: 16, md: 18 },
                    lineHeight: 1.7,
                    maxWidth: 480,
                  }}
                >
                  Reach out for plan support, class access, billing questions,
                  or help getting started with 6AM Yoga.
                </Typography>
              </Box>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid #dfe5ec",
                  borderRadius: 2,
                  mt: "auto",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ color: "#1f6f5b", mt: 0.5 }}>
                      <AccessTimeOutlinedIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#101828" }}>
                        Support Hours
                      </Typography>
                      <Typography sx={{ color: "#667085", mt: 0.5 }}>
                        Monday to Saturday, 9:00 AM to 6:00 PM IST
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #dfe5ec",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography
                  component="h2"
                  sx={{
                    color: "#101828",
                    fontSize: 24,
                    fontWeight: 800,
                    mb: 1,
                  }}
                >
                  Contact Details
                </Typography>
                <Typography sx={{ color: "#667085", mb: 3 }}>
                  Choose the option that works best for you.
                </Typography>

                <Grid container spacing={2}>
                  {contactMethods.map((method) => (
                    <Grid item xs={12} sm={6} key={method.label}>
                      <Card
                        elevation={0}
                        sx={{
                          height: "100%",
                          border: "1px solid #e5eaf0",
                          borderRadius: 2,
                          bgcolor: "#ffffff",
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2}>
                            <Box sx={{ color: "#2563eb" }}>{method.icon}</Box>
                            <Box>
                              <Typography
                                sx={{ color: "#667085", fontSize: 14 }}
                              >
                                {method.label}
                              </Typography>
                              <Typography
                                sx={{
                                  color: "#101828",
                                  fontWeight: 700,
                                  mt: 0.5,
                                  wordBreak: "break-word",
                                }}
                              >
                                {method.value}
                              </Typography>
                            </Box>
                            <Button
                              href={method.href}
                              variant="outlined"
                              fullWidth
                              sx={{
                                borderColor: "#cfd8e3",
                                color: "#101828",
                                textTransform: "none",
                                fontWeight: 700,
                              }}
                            >
                              {method.action}
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ color: "#1f6f5b", mt: 0.5 }}>
                    <LocationOnOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#101828", fontWeight: 800 }}>
                      Operating and Registered Address
                    </Typography>
                    <Typography
                      sx={{ color: "#5f6b7a", mt: 1, lineHeight: 1.8 }}
                    >
                      2nd Phase, Hari Villu, 1st Floor,
                      <br />
                      2nd Cross Rd, near Hosa Road, Amrita Nagar,
                      <br />
                      Halanayakanahalli, Karnataka, India - 560035
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export const GeneralRoutes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about-us",
    element: <PageWrapper>NOT IMPLEMENTED</PageWrapper>,
  },
  {
    path: "/contact-us",
    element: (
      <PageWrapper>
        <ContactCard />
      </PageWrapper>
    ),
  },
  {
    path: "/pricing",
    element: <PlansAndPricing />,
  },
  {
    path: "/terms-and-conditions",
    element: <TermsAndConditions />,
  },
  {
    path: "/cancellations",
    element: <Cancellations />,
  },
  {
    path: "/privacy",
    element: <Privacy />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
