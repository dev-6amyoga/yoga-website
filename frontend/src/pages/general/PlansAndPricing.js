import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/Common/PageWrapper";
import { Fetch } from "../../utils/Fetch";

const formatPricing = (pricing = []) => {
  if (!pricing.length) return "Pricing unavailable";

  return pricing
    .map((price) => {
      const tag = price.currency?.short_tag || "";
      const amount = Number(price.denomination || 0).toLocaleString("en-IN");
      return `${tag} ${amount}`.trim();
    })
    .join(" / ");
};

const getPlanFeatures = (plan) =>
  [
    plan.description,
    plan.plan_validity_days
      ? `Validity for ${plan.plan_validity_days} days`
      : null,
    plan.has_zoom_classes
      ? `${plan.number_of_zoom_classes || 0} live Zoom classes`
      : null,
    plan.watch_time_limit
      ? `${plan.watch_time_limit} hours watch time`
      : null,
    plan.has_basic_playlist ? "Basic playlist access included" : null,
    plan.has_playlist_creation
      ? `${plan.playlist_creation_limit || 0} playlist creations`
      : null,
    plan.has_self_audio_upload ? "Self audio upload included" : null,
    plan.number_of_teachers
      ? `Supports up to ${plan.number_of_teachers} teachers`
      : null,
  ].filter(Boolean);

function PlansAndPricing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await Fetch({
          url: "/plan/get-all-institute-plans",
          method: "GET",
        });
        setPlans(response.data?.plans || []);
      } catch (err) {
        console.error("Failed to fetch institute plans:", err);
        setError("Unable to load plans right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
              <Typography
                sx={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}
              >
                Choose a monthly plan for structured yoga practice with video
                access and guided sequences.
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : plans.length === 0 ? (
              <Alert severity="info">
                No institute yoga plans are available at the moment.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {plans.map((plan) => {
                  const features = getPlanFeatures(plan);

                  return (
                    <Grid item xs={12} md={6} lg={4} key={plan.plan_id}>
                      <Card
                        elevation={0}
                        sx={{
                          height: "100%",
                          border: "1px solid #dfe5ec",
                          borderRadius: 2,
                        }}
                      >
                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                          <Stack spacing={3} sx={{ height: "100%" }}>
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
                                Institute plan
                              </Typography>
                            </Box>

                            <Typography
                              sx={{
                                color: "#1f6f5b",
                                fontSize: { xs: 24, md: 30 },
                                fontWeight: 900,
                              }}
                            >
                              {formatPricing(plan.pricing)}
                            </Typography>

                            <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
                              {features.map((feature) => (
                                <Stack
                                  key={feature}
                                  direction="row"
                                  spacing={1.25}
                                  alignItems="flex-start"
                                >
                                  <CheckCircleOutlineIcon
                                    sx={{
                                      color: "#1f6f5b",
                                      fontSize: 20,
                                      mt: 0.2,
                                    }}
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
                  );
                })}
              </Grid>
            )}

            <Box
              sx={{
                bgcolor: "#fff",
                border: "1px solid #dfe5ec",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography sx={{ color: "#101828", fontWeight: 800 }}>
                Questions about plans?
              </Typography>
              <Typography sx={{ color: "#667085", mt: 0.75 }}>
                Contact us at +91 98448 54007 or write to dev.6amyoga@gmail.com.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </PageWrapper>
  );
}

export default PlansAndPricing;
