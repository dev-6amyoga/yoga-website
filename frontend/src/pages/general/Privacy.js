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
    title: "Data Collection and Usage",
    text: "The Teacher collects personal information such as name, email address, and other relevant details to provide and manage classes. This information is used for class management and communication.",
  },
  {
    title: "Third-Party Interactions",
    text: "The Teacher may use third-party services for class management and related purposes. Please refer to those services for their individual privacy practices.",
  },
  {
    title: "Security and Protection",
    text: "Reasonable measures are taken to protect personal information, though no method of electronic transmission or storage can be guaranteed as completely secure.",
  },
  {
    title: "Consent and Updates",
    text: "By signing up for classes with the Teacher, you consent to the collection and use of information described here. Updates may be posted from time to time.",
  },
];

function Privacy() {
  return (
    <PageWrapper>
      <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: "#f7f8fb" }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Chip label="Policy" sx={{ mb: 2, fontWeight: 800 }} />
              <Typography
                component="h1"
                sx={{
                  color: "#101828",
                  fontSize: { xs: 34, md: 48 },
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Privacy Policy
              </Typography>
              <Typography sx={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}>
                This policy explains how information is collected, used, and
                protected when you participate in online or offline classes
                through the 6AM Yoga platform.
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
                      Contact
                    </Typography>
                    <Typography sx={{ color: "#5f6b7a", mt: 0.75 }}>
                      For privacy questions, email dev.6amyoga@gmail.com or
                      call +91 98448 54007.
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

export default Privacy;
