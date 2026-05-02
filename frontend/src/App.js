import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./components/Common/PageWrapper";

const featureCards = [
  {
    title: "Guided Yoga Practice",
    text: "Follow structured yoga sequences at your own pace with access to class content and self-practice tools.",
  },
  {
    title: "Teacher-Led Access",
    text: "Connect with teachers and institutions that manage plans, classes, attendance, and learning access.",
  },
  {
    title: "Simple Memberships",
    text: "Choose a plan that fits your practice needs and keep your yoga routine organized in one place.",
  },
];

const resourceLinks = [
  {
    title: "Plans and Pricing",
    text: "Review current student plan options and what each plan includes.",
    path: "/pricing",
    icon: <PaymentsOutlinedIcon />,
  },
  {
    title: "Contact Us",
    text: "Reach the 6AM Yoga team for support, class access, or billing help.",
    path: "/contact-us",
    icon: <ContactSupportOutlinedIcon />,
  },
  {
    title: "Privacy Policy",
    text: "Understand how personal information is collected and used.",
    path: "/privacy",
    icon: <PolicyOutlinedIcon />,
  },
  {
    title: "Terms and Conditions",
    text: "Read the terms that apply to using the platform and services.",
    path: "/terms-and-conditions",
    icon: <ReceiptLongOutlinedIcon />,
  },
];

const footerLinks = [
  { label: "Terms", href: "/terms-and-conditions" },
  { label: "Privacy", href: "/privacy" },
  { label: "Refunds", href: "/cancellations" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact-us" },
];

function App() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Box sx={{ bgcolor: "#f7f8fb" }}>
        <Box
          component="section"
          sx={{
            position: "relative",
            minHeight: { xs: "auto", md: "calc(100vh - 72px)" },
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            py: { xs: 6, md: 9 },
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={5} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <Chip
                    label="6AM Yoga Platform"
                    sx={{
                      width: "fit-content",
                      bgcolor: "#e8f2ef",
                      color: "#1f6f5b",
                      fontWeight: 800,
                    }}
                  />
                  <Box>
                    <Typography
                      component="h1"
                      sx={{
                        color: "#101828",
                        fontSize: { xs: 40, md: 64 },
                        fontWeight: 900,
                        lineHeight: 1,
                        mb: 2,
                      }}
                    >
                      My Yoga Teacher
                    </Typography>
                    <Typography
                      sx={{
                        color: "#5f6b7a",
                        fontSize: { xs: 17, md: 20 },
                        lineHeight: 1.7,
                        maxWidth: 620,
                      }}
                    >
                      A calm, structured way to learn yoga online, access
                      teacher-led programs, and build a self-guided practice
                      that fits your routine.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ pt: 1 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate("/auth")}
                      sx={{
                        bgcolor: "#1f6f5b",
                        borderRadius: 2,
                        px: 3,
                        py: 1.25,
                        textTransform: "none",
                        fontWeight: 800,
                        "&:hover": { bgcolor: "#185846" },
                      }}
                    >
                      Login or Register
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate("/pricing")}
                      sx={{
                        borderColor: "#cfd8e3",
                        color: "#182230",
                        borderRadius: 2,
                        px: 3,
                        py: 1.25,
                        textTransform: "none",
                        fontWeight: 800,
                      }}
                    >
                      View Plans
                    </Button>
                  </Stack>

                  <Stack spacing={1.25}>
                    {[
                      "Structured self-practice sequences",
                      "Teacher and institute-led access",
                      "Plan, class, and learning support",
                    ].map((item) => (
                      <Stack
                        key={item}
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                      >
                        <CheckCircleOutlineIcon
                          sx={{ color: "#1f6f5b", fontSize: 20 }}
                        />
                        <Typography sx={{ color: "#344054", fontWeight: 600 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 3,
                    overflow: "hidden",
                    minHeight: { xs: 360, md: 520 },
                    boxShadow: "0 28px 80px rgba(15, 23, 42, 0.18)",
                  }}
                >
                  <Box
                    component="video"
                    src="/frontpage_video.mp4"
                    poster="/img1.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    sx={{
                      width: "100%",
                      height: "100%",
                      minHeight: { xs: 360, md: 520 },
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.42))",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: 24,
                      right: 24,
                      bottom: 24,
                      color: "#fff",
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                      Practice from anywhere
                    </Typography>
                    <Typography sx={{ maxWidth: 420, mt: 0.75 }}>
                      Online yoga support for students, teachers, and
                      institutes.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box component="section" sx={{ py: { xs: 5, md: 8 }, bgcolor: "#fff" }}>
          <Container maxWidth="lg">
            <Grid container spacing={2.5}>
              {featureCards.map((feature) => (
                <Grid item xs={12} md={4} key={feature.title}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid #e5eaf0",
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        sx={{
                          color: "#101828",
                          fontSize: 20,
                          fontWeight: 800,
                          mb: 1,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography sx={{ color: "#667085", lineHeight: 1.7 }}>
                        {feature.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <Container maxWidth="lg">
            <Stack spacing={1.5} sx={{ mb: 4 }}>
              <Typography
                component="h2"
                sx={{
                  color: "#101828",
                  fontSize: { xs: 28, md: 38 },
                  fontWeight: 900,
                }}
              >
                Helpful information
              </Typography>
              <Typography sx={{ color: "#667085", maxWidth: 720 }}>
                Find the important pages in one place, including support,
                pricing, privacy, and usage terms.
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              {resourceLinks.map((resource) => (
                <Grid item xs={12} sm={6} md={3} key={resource.path}>
                  <Card
                    elevation={0}
                    onClick={() => navigate(resource.path)}
                    sx={{
                      height: "100%",
                      border: "1px solid #dfe5ec",
                      borderRadius: 2,
                      cursor: "pointer",
                      transition: "all 180ms ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.12)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ color: "#2563eb", mb: 2 }}>
                        {resource.icon}
                      </Box>
                      <Typography
                        sx={{ color: "#101828", fontWeight: 800, mb: 1 }}
                      >
                        {resource.title}
                      </Typography>
                      <Typography sx={{ color: "#667085", lineHeight: 1.65 }}>
                        {resource.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box component="footer" sx={{ bgcolor: "#101828", color: "#fff" }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography sx={{ fontWeight: 900 }}>My Yoga Teacher</Typography>
                <Typography sx={{ color: "#cbd5e1", mt: 0.5 }}>
                  © {new Date().getFullYear()} 6AM Yoga. All rights reserved.
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    underline="hover"
                    sx={{ color: "#e2e8f0", fontWeight: 700 }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Stack>
            <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.12)" }} />
            <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>
              For support, email dev.6amyoga@gmail.com or call +91 98448 54007.
            </Typography>
          </Container>
        </Box>
      </Box>
    </PageWrapper>
  );
}

export default App;
