import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/Common/PageWrapper";

const plans = [
  {
    name: "Solo Plan",
    duration: "1 Month",
    watchTime: "50 Hours Watch Time",
    price: "INR 2999 / $72 / 72 EUR",
    features: [
      "Validity for 30 days",
      "Monthly yoga sequence",
      "Warm up, suryanamaskara, yogasanas, and pranayama",
      "Designed for one student",
    ],
  },
  {
    name: "Family Plan",
    duration: "1 Month",
    watchTime: "100 Hours Watch Time",
    price: "INR 3999 / $96 / 96 EUR",
    features: [
      "Validity for 30 days",
      "Monthly yoga sequence",
      "Warm up, suryanamaskara, yogasanas, and pranayama",
      "Designed for shared family practice",
    ],
  },
];

function PlansAndPricing() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Box sx={{ py: { xs: 5, md: 8 }, bgcolor: "#f7f8fb" }}>
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <Box sx={{ maxWidth: 760 }}>
              <Chip label="Pricing" sx={{ mb: 2, fontWeight: 800 }} />
              <Typography
                component="h1"
                sx={{
                  color: "#101828",
                  fontSize: { xs: 34, md: 48 },
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Plans and Pricing
              </Typography>
              <Typography sx={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}>
                Choose a monthly plan for structured yoga practice with video
                access and guided sequences.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {plans.map((plan) => (
                <Grid item xs={12} md={6} key={plan.name}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid #dfe5ec",
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography
                            sx={{
                              color: "#101828",
                              fontSize: 26,
                              fontWeight: 900,
                            }}
                          >
                            {plan.name}
                          </Typography>
                          <Typography sx={{ color: "#667085", mt: 0.5 }}>
                            {plan.duration} · {plan.watchTime}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            color: "#1f6f5b",
                            fontSize: { xs: 24, md: 30 },
                            fontWeight: 900,
                          }}
                        >
                          {plan.price}
                        </Typography>

                        <Stack spacing={1.25}>
                          {plan.features.map((feature) => (
                            <Stack
                              key={feature}
                              direction="row"
                              spacing={1.25}
                              alignItems="flex-start"
                            >
                              <CheckCircleOutlineIcon
                                sx={{ color: "#1f6f5b", fontSize: 20, mt: 0.2 }}
                              />
                              <Typography sx={{ color: "#344054" }}>
                                {feature}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          variant="contained"
                          onClick={() => navigate("/auth")}
                          sx={{
                            bgcolor: "#1f6f5b",
                            borderRadius: 2,
                            py: 1.25,
                            textTransform: "none",
                            fontWeight: 800,
                            "&:hover": { bgcolor: "#185846" },
                          }}
                        >
                          Get Started
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ bgcolor: "#fff", border: "1px solid #dfe5ec", borderRadius: 2, p: 3 }}>
              <Typography sx={{ color: "#101828", fontWeight: 800 }}>
                Questions about plans?
              </Typography>
              <Typography sx={{ color: "#667085", mt: 0.75 }}>
                Contact us at +91 98448 54007 or write to
                dev.6amyoga@gmail.com.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  );
}

export default PlansAndPricing;
