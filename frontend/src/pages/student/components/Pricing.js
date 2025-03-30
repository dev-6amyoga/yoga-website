import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Fetch } from "../../../utils/Fetch";

export default function Pricing({
  heading,
  allPlans,
  subscribePlan,
  selectedCurrency,
}) {
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [currentCurrencyId, setCurrentCurrencyId] = useState(0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/currency/get-all",
          method: "GET",
        });
        const data = response.data;
        console.log(data.currencies);
        const inrCurrency = data.currencies.find(
          (currency) => currency.short_tag === selectedCurrency
        );
        if (inrCurrency) {
          setCurrentCurrencyId(inrCurrency.currency_id);
        } else {
          console.log("currency not found");
        }

        setAllCurrencies(data.currencies);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [otherNeed, setOtherNeed] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // To control dropdown anchor
  const [open, setOpen] = useState(false);

  // Open the dropdown when user clicks
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  // Handle the closing of the dropdown
  const handleClose = () => {
    setOpen(false);
  };

  // Handle selection change
  const handleNeedsChange = (event) => {
    setSelectedNeeds(event.target.value);
  };

  // Handle "OK" button click
  const handleConfirmSelection = (event) => {
    setIsConfirmed(true);
    setAnchorEl(event.currentTarget);
    setOpen(false); // Close dropdown
  };

  // Handle "Other Needs" change
  const handleOtherNeedChange = (event) => {
    setOtherNeed(event.target.value);
  };

  return (
    <div className="my-10 w-full">
      {heading && (
        <>
          <p className="text-left text-step-2 font-bold">{heading}</p>
          <Divider />
        </>
      )}
      <div className="my-10 grid w-full grid-cols-1 place-content-center place-items-center gap-4 md:grid-cols-3 lg:gap-8">
        {allPlans?.map((plan) => {
          let selectedPricing;
          if (plan.pricing) {
            selectedPricing = plan.pricing.find(
              (x) => x.currency.short_tag === selectedCurrency
            );
          } else {
            selectedPricing = Number(plan.prices[0][currentCurrencyId]);
          }
          return (
            <>
              {plan.name && (
                <Card
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    width: "100%",
                    border:
                      plan.name === "Customized Plan"
                        ? "1px solid"
                        : "1px solid",
                    borderColor:
                      plan.name === "Customized Plan"
                        ? "primary.main"
                        : "primary.main",
                    background:
                      plan.name === "Customized Plan"
                        ? "linear-gradient(#033363, #021F3B)"
                        : "linear-gradient(#033363, #021F3B)",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        mb: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color:
                          plan.name === "Customized Plan"
                            ? "grey.100"
                            : "grey.100",
                      }}
                    >
                      <Typography component="h3" variant="h6">
                        {plan.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        color:
                          plan.name === "Customized Plan"
                            ? "grey.50"
                            : "grey.50",
                      }}
                    >
                      {plan.description !==
                        "Tailor made playlists as per your requirement" && (
                        <Typography component="h3" variant="h3">
                          {selectedCurrency} {selectedPricing.denomination}
                        </Typography>
                      )}
                    </Box>
                    <Divider
                      sx={{
                        my: 2,
                        opacity: 0.2,
                        borderColor: "grey.500",
                      }}
                    />
                    {[
                      {
                        name: "Create your own yoga sequence (2 per month + 2 edits each)",
                        enable: plan.has_playlist_creation,
                      },
                      {
                        name: `Valid for ${plan.plan_validity_days} Days`,
                        enable:
                          true &&
                          plan.description !==
                            "Tailor made playlists as per your requirement",
                      },
                      {
                        name: `${plan.watch_time_limit / 3600} hours watch time`,
                        enable:
                          true &&
                          plan.description !==
                            "Tailor made playlists as per your requirement",
                      },
                      // {
                      //   name: "Play 6AM Yoga playlists",
                      //   enable:
                      //     plan.has_basic_playlist &&
                      //     plan.description !==
                      //       "Tailor made playlists as per your requirement",
                      // },
                      {
                        name: "Fixed Yoga Sequence (warm up, suryanamaskara, yogasanas and pranayama) Updated monthly",
                        enable:
                          plan.has_basic_playlist &&
                          plan.description !==
                            "Tailor made playlists as per your requirement",
                      },
                      {
                        name: "Only on Laptops and Desktops (no phones)",
                        enable: true,
                      },
                      {
                        name: "24X7 Customer Assistance",
                        enable: true,
                      },
                      {
                        name: "Exclusive Pranayama Sessions (20 min)",
                        enable:
                          plan.plan_user_type !== "TEACHER" &&
                          plan.has_basic_playlist &&
                          plan.plan_id === 12 &&
                          !plan.has_playlist_creation &&
                          plan.description !==
                            "Tailor made playlists as per your requirement",
                      },
                      {
                        name: "Yoga for back strengthening (30 min)",
                        enable:
                          plan.plan_user_type !== "TEACHER" &&
                          plan.has_basic_playlist &&
                          plan.plan_id === 12 &&
                          !plan.has_playlist_creation &&
                          plan.description !==
                            "Tailor made playlists as per your requirement",
                      },
                      {
                        name: "Yoga for knee strengthening (20 min)",
                        enable:
                          plan.plan_user_type !== "TEACHER" &&
                          plan.has_basic_playlist &&
                          plan.plan_id === 12 &&
                          !plan.has_playlist_creation &&
                          plan.description !==
                            "Tailor made playlists as per your requirement",
                      },
                      {
                        name: "Tailor made playlists as per your requirement",
                        enable:
                          plan.plan_user_type !== "TEACHER" &&
                          plan.description ===
                            "Tailor made playlists as per your requirement",
                      },
                      {
                        name: "Conduct classes using our instructional videos",
                        enable:
                          plan.plan_user_type === "TEACHER" &&
                          plan.name.includes("Advanced"),
                      },
                    ].map((feature) => (
                      <Box
                        key={feature.name}
                        sx={{
                          py: 1,
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                        }}
                      >
                        {feature.enable ? (
                          <>
                            <CheckCircleRoundedIcon
                              sx={{
                                width: 20,
                                color:
                                  plan.name === "Customized Plan"
                                    ? "primary.light"
                                    : "primary.light",
                              }}
                            />
                            <Typography
                              component="text"
                              variant="subtitle2"
                              sx={{
                                color:
                                  plan.name === "Customized Plan"
                                    ? "grey.200"
                                    : "grey.200",
                              }}
                            >
                              {feature.name}
                            </Typography>
                          </>
                        ) : (
                          <></>
                        )}
                      </Box>
                    ))}

                    {plan.name === "Customized Plan" && (
                      <>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel
                            sx={{
                              color: "grey.200",
                              "&.Mui-focused": { display: "none" },
                              "&.MuiFormLabel-filled": { display: "none" },
                            }}
                            id="yoga-needs-label"
                          >
                            Select Your Yoga Needs
                          </InputLabel>

                          {/* Using Menu component for controlled dropdown */}
                          <Select
                            sx={{
                              color: "grey.200",
                              ".MuiOutlinedInput-notchedOutline": {
                                borderColor: "grey.200",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "grey.200",
                                },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "grey.200",
                              },
                              ".MuiSvgIcon-root": {
                                fill: "grey.200 !important",
                              },
                            }}
                            labelId="yoga-needs-label"
                            multiple
                            value={selectedNeeds}
                            onChange={handleNeedsChange}
                            renderValue={(selected) => selected.join(", ")}
                            open={open} // Control dropdown open state
                            onOpen={handleClick} // Open dropdown
                            onClose={handleClose} // Close dropdown
                          >
                            {[
                              "Knee Pain",
                              "Back Pain",
                              "Neck Pain",
                              "Thyroid",
                              "Pranayama",
                              "Pre Natal Yoga",
                            ].map((need) => (
                              <MenuItem key={need} value={need}>
                                <Checkbox
                                  checked={selectedNeeds.indexOf(need) > -1}
                                  sx={{
                                    color: "grey.200",
                                    "&.Mui-checked": { color: "grey.200" },
                                  }}
                                />
                                <ListItemText primary={need} />
                              </MenuItem>
                            ))}

                            {/* Custom OK Button inside the dropdown */}
                            <MenuItem onClick={handleConfirmSelection}>
                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                              >
                                OK
                              </Button>
                            </MenuItem>
                          </Select>
                        </FormControl>

                        {isConfirmed && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" color="grey.200">
                              Selected Needs: {selectedNeeds.join(", ")}
                            </Typography>
                          </Box>
                        )}

                        <TextField
                          fullWidth
                          sx={{
                            mt: 2,
                            ".MuiInputBase-input": { color: "grey.200" },
                            ".MuiInputLabel-root": {
                              color: "grey.200",
                              "&.Mui-focused": { display: "none" },
                            },
                            ".MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: "grey.200",
                              },
                            "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: "grey.200",
                              },
                            "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: "grey.200",
                              },
                          }}
                          label="Other Needs"
                          value={otherNeed}
                          onChange={handleOtherNeedChange}
                        />
                      </>
                    )}
                  </CardContent>
                  <CardActions className="flex flex-col items-center">
                    {plan.name !== "Customized Plan" && (
                      <Button
                        // fullWidth
                        variant={
                          plan.name === "Customized Plan"
                            ? "contained"
                            : "contained"
                        }
                        onClick={() => subscribePlan(plan)}
                      >
                        Purchase
                      </Button>
                    )}
                    {plan.name === "Customized Plan" && (
                      <Button
                        // fullWidth
                        variant={
                          plan.name === "Customized Plan"
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => {
                          const data = {
                            selectedNeeds: selectedNeeds,
                            otherNeed: otherNeed,
                            plan: plan,
                          };
                          console.log(data);
                          subscribePlan(data);
                        }}
                      >
                        Enquire
                      </Button>
                    )}
                  </CardActions>
                </Card>
              )}
              {plan.plan_name && (
                <Card
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    width: "100%",
                    border: "1px solid",
                    borderColor: "primary.main",
                    background: "linear-gradient(#033363, #021F3B)",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        mb: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "grey.100",
                      }}
                    >
                      <Typography component="h3" variant="h6">
                        {plan.plan_name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        color: "grey.50",
                      }}
                    >
                      <Typography component="h3" variant="h3">
                        {/* {selectedCurrency} {selectedPricing.denomination} */}
                        {selectedCurrency} {selectedPricing}
                      </Typography>
                    </Box>
                    <Divider
                      sx={{
                        my: 2,
                        opacity: 0.2,
                        borderColor: "grey.500",
                      }}
                    />
                    {[
                      {
                        name: plan.selectedNeeds.map((x) => x + ","),
                        enable: true,
                      },
                      {
                        name: `${plan.plan_description}`,
                        enable: true,
                      },
                      {
                        name: `Validity: ${plan.planValidity} days`,
                        enable: true,
                      },
                      {
                        name: `${plan.watchHours} hours watch time`,
                        enable: true,
                      },
                    ].map((feature) => (
                      <Box
                        key={feature.name}
                        sx={{
                          py: 1,
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                        }}
                      >
                        {feature.enable ? (
                          <>
                            <CheckCircleRoundedIcon
                              sx={{
                                width: 20,
                                color: "primary.light",
                              }}
                            />
                            <Typography
                              component="text"
                              variant="subtitle2"
                              sx={{
                                color: "grey.200",
                              }}
                            >
                              {feature.name}
                            </Typography>
                          </>
                        ) : (
                          <></>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions className="flex flex-col items-center">
                    <Button
                      // fullWidth
                      variant={"contained"}
                      onClick={() => subscribePlan(plan)}
                    >
                      Purchase
                    </Button>
                  </CardActions>
                </Card>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}
