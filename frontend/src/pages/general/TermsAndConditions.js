import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import PageWrapper from "../../components/Common/PageWrapper";

const sections = [
  {
    title: "Acceptance of Terms",
    text: "By accessing this website, you agree to these Terms and Conditions and to comply with applicable laws and regulations.",
  },
  {
    title: "Use of the Platform",
    text: "The platform enables access to online content and classes facilitated by 6AM Yoga, teachers, or institutions. Users must follow the rules and guidelines set by their teacher and the platform.",
  },
  {
    title: "Student Responsibilities",
    text: "Students are responsible for maintaining the required equipment, internet connection, and appropriate practice environment for accessing classes and videos.",
  },
  {
    title: "Payments",
    text: "Payments for services must be made through the platform or as directed by the teacher. All payments are subject to plan and service terms.",
  },
  {
    title: "Intellectual Property",
    text: "Class materials, videos, and related content remain the intellectual property of their rightful owners and may not be distributed or reproduced without permission.",
  },
  {
    title: "Disclaimers and Liability",
    text: "6AM Yoga and the Teacher disclaim warranties to the extent permitted by law and are not liable for damages arising from platform use.",
  },
];

function TermsAndConditions() {
  return (
    <PageWrapper>
      <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: "#f7f8fb" }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Chip label="Legal" sx={{ mb: 2, fontWeight: 800 }} />
              <Typography
                component="h1"
                sx={{
                  color: "#101828",
                  fontSize: { xs: 34, md: 48 },
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Terms and Conditions
              </Typography>
              <Typography sx={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}>
                Please read these terms before using the 6AM Yoga platform or
                participating in teacher-led classes.
              </Typography>
            </Box>

            <Card elevation={0} sx={{ border: "1px solid #dfe5ec", borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  {sections.map((section) => (
                    <Box key={section.title}>
                      <Typography sx={{ color: "#101828", fontWeight: 800, mb: 1 }}>
                        {section.title}
                      </Typography>
                      <Typography sx={{ color: "#5f6b7a", lineHeight: 1.8 }}>
                        {section.text}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ bgcolor: "#f2f6f5", borderRadius: 2, p: 2.5 }}>
                    <Typography sx={{ color: "#101828", fontWeight: 800 }}>
                      Questions
                    </Typography>
                    <Typography sx={{ color: "#5f6b7a", mt: 0.75 }}>
                      For questions about these terms, email
                      dev.6amyoga@gmail.com or call +91 98448 54007.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  );
}

export default TermsAndConditions;
