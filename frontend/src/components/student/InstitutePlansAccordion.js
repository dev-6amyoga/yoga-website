import React, { useMemo } from "react";
import {
  Box,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Chip,
  Stack,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import useUserStore from "../../store/UserStore";

const INR = "INR";

function InstitutePlansAccordion({
  allInstitutePlans,
  subscribePlan,
  selectedCurrency = INR,
}) {
  const [expandedPlanId, setExpandedPlanId] = React.useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { planId: urlPlanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (urlPlanId) {
      setExpandedPlanId(parseInt(urlPlanId));
      return;
    }

    const selectedPlanId = sessionStorage.getItem("selectedPlanId");
    if (selectedPlanId) {
      setExpandedPlanId(parseInt(selectedPlanId));
    }
  }, [urlPlanId]);

  const handleChange = (planId) => (_, expanded) => {
    setExpandedPlanId(expanded ? planId : null);
  };

  const handleSubscribePlan = (plan) => {
    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", location.pathname);
      sessionStorage.setItem("selectedPlanId", plan.plan_id);
      navigate("/auth?login=true");
      return;
    }

    subscribePlan(plan);
  };

  const preferredCurrencyTag = useMemo(() => {
    if (typeof selectedCurrency === "string") return selectedCurrency;
    if (selectedCurrency?.short_tag) return selectedCurrency.short_tag;
    return INR;
  }, [selectedCurrency]);

  const getPricingForPlan = (plan) => {
    const pricingArray = plan.pricing || [];
    const preferred = pricingArray.find(
      (p) =>
        (p.currency?.short_tag || "").toUpperCase() ===
        preferredCurrencyTag.toUpperCase(),
    );

    if (preferred) return preferred;

    return (
      pricingArray.find(
        (p) => (p.currency?.short_tag || "").toUpperCase() === INR,
      ) ||
      pricingArray[0] ||
      null
    );
  };

  const sortedPlans = useMemo(() => {
    if (!Array.isArray(allInstitutePlans)) return [];
    const parseNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    return [...allInstitutePlans].sort((a, b) => {
      const aIsUrlPlan = urlPlanId && a.plan_id === parseInt(urlPlanId);
      const bIsUrlPlan = urlPlanId && b.plan_id === parseInt(urlPlanId);

      if (aIsUrlPlan && !bIsUrlPlan) return -1;
      if (!aIsUrlPlan && bIsUrlPlan) return 1;

      const aValidity = parseNum(a.plan_validity_days);
      const bValidity = parseNum(b.plan_validity_days);
      if (aValidity !== bValidity) return bValidity - aValidity;

      const aClasses = parseNum(a.number_of_zoom_classes);
      const bClasses = parseNum(b.number_of_zoom_classes);
      return bClasses - aClasses;
    });
  }, [allInstitutePlans, urlPlanId]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1120, mx: "auto" }}>
      {Array.isArray(allInstitutePlans) && allInstitutePlans.length === 0 && (
        <Typography sx={{ py: 3 }} align="center" color="text.secondary">
          No plans available
        </Typography>
      )}

      {sortedPlans?.map((plan) => {
        const pricingItem = getPricingForPlan(plan);
        const priceAmount =
          pricingItem?.denomination ?? pricingItem?.price ?? 0;
        const isTopPlan = urlPlanId && plan.plan_id === parseInt(urlPlanId);
        const classesCount = plan.number_of_zoom_classes ?? "Unlimited";

        return (
          <Accordion
            key={plan.plan_id}
            expanded={expandedPlanId === plan.plan_id}
            onChange={handleChange(plan.plan_id)}
            sx={{
              mb: 1.5,
              border: isTopPlan ? "1px solid #1f6f5b" : "1px solid #dfe5ec",
              borderRadius: "8px !important",
              backgroundColor: "#fff",
              boxShadow: isTopPlan
                ? "0 10px 28px rgba(31, 111, 91, 0.14)"
                : "0 6px 18px rgba(16, 24, 40, 0.05)",
              overflow: "hidden",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 1,
                "& .MuiAccordionSummary-content": { my: 1.2 },
              }}
            >
              <Grid container alignItems="center" spacing={1}>
                {isTopPlan && (
                  <Grid item xs={12}>
                    <Chip
                      label="Selected Plan"
                      sx={{
                        backgroundColor: "#1f6f5b",
                        color: "white",
                        fontWeight: 700,
                        mb: 1,
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={8} sm={6}>
                  <Typography
                    variant={isMobile ? "subtitle2" : "h6"}
                    noWrap
                    sx={{
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      color: "#101828",
                      fontWeight: 800,
                    }}
                  >
                    {plan.name}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {plan.description || "Structured yoga subscription"}
                    </Typography>
                  )}
                </Grid>

                <Grid
                  item
                  xs={4}
                  sm={3}
                  sx={{ textAlign: { xs: "right", sm: "center" } }}
                >
                  <Typography
                    variant={isMobile ? "subtitle1" : "h5"}
                    sx={{ fontWeight: 900, color: "#1f6f5b" }}
                  >
                    ₹ {Number(priceAmount).toLocaleString("en-IN")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {plan.plan_validity_days ?? "30"} days
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={3}
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant={isTopPlan ? "contained" : "outlined"}
                    size={isMobile ? "small" : "medium"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribePlan(plan);
                    }}
                    fullWidth={isMobile}
                    sx={{
                      borderColor: "#1f6f5b",
                      color: isTopPlan ? "#fff" : "#1f6f5b",
                      bgcolor: isTopPlan ? "#1f6f5b" : "transparent",
                      fontWeight: 800,
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#185846",
                        bgcolor: isTopPlan
                          ? "#185846"
                          : "rgba(31, 111, 91, 0.08)",
                      },
                    }}
                  >
                    {isMobile ? "Buy" : "Buy / Subscribe"}
                  </Button>
                </Grid>
              </Grid>
            </AccordionSummary>

            <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pt: 0, pb: 2.5 }}>
              <Stack direction="column" spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {plan.description || "No description available"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 2, flexWrap: "wrap", rowGap: 1 }}
                    >
                      <Chip
                        icon={<CalendarMonthOutlinedIcon />}
                        label={`${plan.plan_validity_days ?? 30} days`}
                        size="small"
                      />
                      <Chip
                        icon={<VideocamOutlinedIcon />}
                        label={`${classesCount} live classes`}
                        size="small"
                      />
                      <Chip
                        icon={<CurrencyRupeeOutlinedIcon />}
                        label="INR billing"
                        size="small"
                      />
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        borderLeft: { xs: "none", sm: "1px solid #eee" },
                        pl: { sm: 2 },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Plan details
                      </Typography>
                      {[
                        `Classes: ${classesCount}`,
                        `Validity: ${plan.plan_validity_days ?? 30} days`,
                        plan.watch_time_limit
                          ? `Watch time: ${
                              plan.watch_time_limit < 3600
                                ? `${plan.watch_time_limit / 60} minutes`
                                : `${plan.watch_time_limit / 3600} hours`
                            }`
                          : null,
                      ]
                        .filter(Boolean)
                        .map((item) => (
                          <Stack
                            key={item}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 1 }}
                          >
                            <CheckCircleRoundedIcon
                              sx={{ color: "#1f6f5b", fontSize: 18 }}
                            />
                            <Typography variant="body2">{item}</Typography>
                          </Stack>
                        ))}

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleSubscribePlan(plan)}
                          sx={{
                            bgcolor: "#1f6f5b",
                            textTransform: "none",
                            fontWeight: 800,
                            "&:hover": { bgcolor: "#185846" },
                          }}
                        >
                          Purchase
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

export default InstitutePlansAccordion;
