// ...existing code...
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
import { useTheme } from "@mui/material/styles";

function InstitutePlansAccordion({
  allInstitutePlans,
  subscribePlan,
  selectedCurrency,
}) {
  const [expandedPlanId, setExpandedPlanId] = React.useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (planId) => (_, expanded) => {
    setExpandedPlanId(expanded ? planId : null);
  };
  const CURRENCY_SYMBOLS = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const preferredCurrencyTag = useMemo(() => {
    if (selectedCurrency?.short_tag) return selectedCurrency.short_tag;
    // prefer India if user's timezone or locale suggests India
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (
        tz.toLowerCase().includes("kolkata") ||
        tz.toLowerCase().includes("india")
      )
        return "INR";
      const lang = (navigator.language || "").toLowerCase();
      if (lang.includes("en-in") || lang.includes("hi-in")) return "INR";
    } catch (e) {
      /* ignore */
    }
    return null;
  }, [selectedCurrency]);

  const getPricingForPlan = (plan) => {
    const pricingArray = plan.pricing || [];
    // try preferred currency first
    if (preferredCurrencyTag) {
      const found = pricingArray.find(
        (p) =>
          (p.currency?.short_tag || "").toUpperCase() ===
          preferredCurrencyTag.toUpperCase()
      );
      if (found) return found;
    }
    // fallback to currency from selectedCurrency prop if symbol & short_tag provided
    if (selectedCurrency?.short_tag) {
      const fromSelected = pricingArray.find(
        (p) =>
          (p.currency?.short_tag || "").toUpperCase() ===
          selectedCurrency.short_tag.toUpperCase()
      );
      if (fromSelected) return fromSelected;
    }
    // final fallback to first available price
    return pricingArray[0] || null;
  };

  const sortedPlans = useMemo(() => {
    if (!Array.isArray(allInstitutePlans)) return [];
    const parseNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    return [...allInstitutePlans].sort((a, b) => {
      const aValidity = parseNum(a.plan_validity_days);
      const bValidity = parseNum(b.plan_validity_days);
      if (aValidity !== bValidity) return bValidity - aValidity;

      const aClasses = parseNum(a.number_of_zoom_classes);
      const bClasses = parseNum(b.number_of_zoom_classes);
      return bClasses - aClasses;
    });
  }, [allInstitutePlans]);

  return (
    <Box
      sx={{ width: "100%", px: { xs: 1, sm: 2 }, maxWidth: 1100, mx: "auto" }}
    >
      {Array.isArray(allInstitutePlans) && allInstitutePlans.length === 0 && (
        <Typography sx={{ py: 3 }} align="center" color="textSecondary">
          No plans available
        </Typography>
      )}

      {sortedPlans?.map((plan) => {
        const pricingItem = getPricingForPlan(plan);
        const currencyTag =
          pricingItem?.currency?.short_tag ||
          selectedCurrency?.short_tag ||
          "INR";
        const symbol = CURRENCY_SYMBOLS[currencyTag] || currencyTag;
        const priceAmount =
          pricingItem?.denomination ?? pricingItem?.price ?? 0;

        return (
          <Accordion
            key={plan.plan_id}
            expanded={expandedPlanId === plan.plan_id}
            onChange={handleChange(plan.plan_id)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item xs={8} sm={6}>
                  <Typography
                    variant={isMobile ? "subtitle2" : "h6"}
                    noWrap
                    sx={{ textOverflow: "ellipsis", maxWidth: "100%" }}
                  >
                    {plan.name}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {plan.description || ""}
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
                    sx={{ fontWeight: 700 }}
                  >
                    {symbol + " " + priceAmount}
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
                    variant="outlined"
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    onClick={(e) => {
                      e.stopPropagation(); // don't toggle accordion when user taps buy
                      subscribePlan(plan);
                    }}
                    fullWidth={isMobile}
                  >
                    {isMobile ? "Buy" : "Buy / Subscribe"}
                  </Button>
                </Grid>
              </Grid>
            </AccordionSummary>

            <AccordionDetails>
              <Stack direction="column" spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {plan.description || "No description available"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 2, flexWrap: "wrap" }}
                    >
                      {(plan.tags || []).slice(0, 8).map((t) => (
                        <Chip key={t} label={t} size="small" sx={{ mb: 1 }} />
                      ))}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        borderLeft: { xs: "none", sm: "1px solid #eee" },
                        pl: { sm: 2 },
                      }}
                    >
                      <Typography variant="subtitle2">Plan details</Typography>
                      <Typography variant="body2">
                        Classes: {plan.number_of_zoom_classes ?? "Unlimited"}
                      </Typography>
                      <Typography variant="body2">
                        Teachers: {plan.number_of_teachers ?? 1}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Validity: {plan.plan_validity_days} days
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => subscribePlan(plan)}
                        >
                          Purchase
                        </Button>
                        <Button
                          variant="text"
                          sx={{ mt: 1 }}
                          fullWidth
                          onClick={() => window.open("/terms", "_blank")}
                        >
                          Terms
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {isMobile && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      onClick={() => subscribePlan(plan)}
                    >
                      Quick purchase
                    </Button>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

export default InstitutePlansAccordion;
// ...existing code...
