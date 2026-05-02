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

const policies = [
  "Subscriptions once taken cannot be cancelled under normal circumstances.",
  "Fees once paid will not be refunded under normal circumstances.",
  "Special circumstances may be reviewed case by case depending on the situation.",
  "The final decision taken by 6AM Yoga will apply.",
];

function Cancellations() {
  return (
    <PageWrapper>
      <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: "#f7f8fb" }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Chip label="Refund Policy" sx={{ mb: 2, fontWeight: 800 }} />
              <Typography
                component="h1"
                sx={{
                  color: "#101828",
                  fontSize: { xs: 34, md: 48 },
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Cancellations and Refunds
              </Typography>
              <Typography sx={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}>
                This page explains the cancellation and refund policy for
                student subscriptions and plan purchases.
              </Typography>
            </Box>

            <Card elevation={0} sx={{ border: "1px solid #dfe5ec", borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2}>
                  {policies.map((policy, index) => (
                    <Box
                      key={policy}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        p: 2,
                        border: "1px solid #e5eaf0",
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "#e8f2ef",
                          color: "#1f6f5b",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography sx={{ color: "#344054", lineHeight: 1.7 }}>
                        {policy}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Box sx={{ bgcolor: "#f2f6f5", borderRadius: 2, p: 2.5, mt: 3 }}>
                  <Typography sx={{ color: "#101828", fontWeight: 800 }}>
                    Need help?
                  </Typography>
                  <Typography sx={{ color: "#5f6b7a", mt: 0.75 }}>
                    For billing questions, email dev.6amyoga@gmail.com or call
                    +91 98448 54007.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  );
}

export default Cancellations;
