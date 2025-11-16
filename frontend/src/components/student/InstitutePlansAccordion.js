import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";

function InstitutePlansAccordion({
  allInstitutePlans,
  subscribePlan,
  selectedCurrency,
}) {
  const [expandedPlanId, setExpandedPlanId] = React.useState(null);

  const toggleExpand = (planId) =>
    setExpandedPlanId((prev) => (prev === planId ? null : planId));

  return (
    <Box sx={{ my: 4, width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        6AM Yoga Plans
      </Typography>

      <Accordion defaultExpanded sx={{ width: "100%" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="institute-plans-content"
          id="institute-plans-header"
          sx={{
            backgroundColor: "#f5f5f5",
            "&:hover": { backgroundColor: "#eeeeee" },
            width: "100%",
          }}
        >
          <Typography variant="h6">Institute Plans</Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{ p: 0, backgroundColor: "#fafafa", width: "100%" }}
        >
          <Box sx={{ width: "100%", px: 2, py: 2 }}>
            <Grid container spacing={2}>
              {allInstitutePlans && allInstitutePlans.length > 0 ? (
                allInstitutePlans.map((plan) => {
                  const pricing = plan.pricing?.[0];
                  const priceDisplay = pricing
                    ? `${pricing.currency.short_tag} ${pricing.denomination}`
                    : "N/A";
                  const isExpanded = expandedPlanId === plan.plan_id;

                  return (
                    // force each plan to take full container width
                    <Grid item xs={12} key={plan.plan_id}>
                      <Card
                        sx={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: 2,
                        }}
                        elevation={1}
                      >
                        <CardContent sx={{ flexGrow: 1, px: 3, py: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 2,
                              width: "100%",
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "bold",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {plan.name}
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{ mt: 0.5, color: "primary.main" }}
                              >
                                {priceDisplay}
                              </Typography>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => subscribePlan(plan)}
                                sx={{ mr: 1 }}
                              >
                                Purchase
                              </Button>

                              <IconButton
                                onClick={() => toggleExpand(plan.plan_id)}
                                aria-expanded={isExpanded}
                                aria-label="show details"
                                sx={{
                                  transform: isExpanded
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.2s ease",
                                }}
                              >
                                <ExpandMoreIcon />
                              </IconButton>
                            </Box>
                          </Box>

                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ mb: 1 }}
                              >
                                {plan.description}
                              </Typography>

                              <Box
                                sx={{
                                  mb: 1,
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Chip
                                  label={`${plan.number_of_zoom_classes} Classes/Month`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={`${plan.plan_validity_days} Days Validity`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>

                              <Typography variant="caption" display="block">
                                ✓ Zoom Classes:{" "}
                                {plan.has_zoom_classes ? "Yes" : "No"}
                              </Typography>
                              <Typography variant="caption" display="block">
                                ✓ Teachers: {plan.number_of_teachers}
                              </Typography>
                              <Typography variant="caption" display="block">
                                ✓ Playlist Creation:{" "}
                                {plan.has_playlist_creation ? "Yes" : "No"}
                              </Typography>
                            </Box>
                          </Collapse>
                        </CardContent>

                        {/* <CardActions sx={{ px: 3, pb: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => subscribePlan(plan)}
                          >
                            Purchase
                          </Button>
                        </CardActions> */}
                      </Card>
                    </Grid>
                  );
                })
              ) : (
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ p: 2 }}
                  >
                    No institute plans available at the moment.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default InstitutePlansAccordion;
